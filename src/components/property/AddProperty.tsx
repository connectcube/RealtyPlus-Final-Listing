import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  MapPin,
  DollarSign,
  Upload,
  Plus,
  X,
  Check,
  Info,
  Image,
} from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { LISTING, NearbyPlace } from "@/lib/typeDefinitions";
import { useZustand } from "@/lib/zustand";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { fireDataBase, fireStorage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { toast } from "react-toastify";

const AddProperty = () => {
  const { user, setUser } = useZustand();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [formData, setFormData] = useState<LISTING>({
    uid: "",
    coverPhotoIndex: 0,
    images: [],
    title: "",
    description: "",
    price: 0,
    propertyType: "standalone",
    listingType: "sale",
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    garageSpaces: 0,
    yearBuilt: 0,
    isFurnished: false,
    isFeatured: false,
    province: "",
    city: "",
    neighborhood: "",
    address: "",
    createdAt: null,
    viewCount: 0,
    features: {
      swimmingPool: false,
      garden: false,
      securitySystem: false,
      backupPower: false,
      borehole: false,
      airConditioning: false,
      servantsQuarters: false,
      fittedKitchen: false,
      parking: false,
    },
    postedBy: null,
    nearbyPlaces: [] as NearbyPlace[],
    propertyCategory: "newDevelopment",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState<number>(0);

  const handleInputChange = (field: string, value: any) => {
    // Array of fields that should be converted to numbers
    const numericFields = [
      "bedrooms",
      "bathrooms",
      "area",
      "garageSpaces",
      "yearBuilt",
      "price",
    ];

    if (numericFields.includes(field)) {
      // Convert to number and handle invalid inputs
      const numericValue = Number(value);
      // Only update if it's a valid number
      if (!isNaN(numericValue)) {
        setFormData({
          ...formData,
          [field]: numericValue, // This will store as number instead of string
        });
      }
    } else {
      // Handle non-numeric fields normally
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [feature]: checked,
      },
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files) return;

      // Check if user is authenticated
      if (!user || !user.uid) {
        toast.error("You must be logged in to upload images");
        return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      // Convert FileList to array and validate
      const validFiles = Array.from(files).filter((file) => {
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File ${file.name} is not a supported image type`);
          return false;
        }
        if (file.size > maxSize) {
          toast.error(`File ${file.name} is too large. Max size is 5MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length + uploadedImages.length > 10) {
        toast.error("Maximum 10 images allowed");
        return;
      }

      setUploadedImages([...uploadedImages, ...validFiles]);
    } catch (error) {
      console.error("Error handling image upload:", error);
      toast.error("Error handling image upload");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];

    // If removing the cover photo, adjust the cover photo index
    if (index === coverPhotoIndex) {
      if (newImages.length > 1) {
        // Set the next image as cover photo, or the previous one if removing the last image
        const newCoverIndex = index === newImages.length - 1 ? 0 : index;
        setCoverPhotoIndex(newCoverIndex);
      } else {
        setCoverPhotoIndex(0); // Reset to 0 if no images left
      }
    } else if (index < coverPhotoIndex) {
      // If removing an image before the cover photo, decrement the cover photo index
      setCoverPhotoIndex(coverPhotoIndex - 1);
    }

    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      // User verification
      if (!user || !user.uid) {
        toast.error("You must be logged in to submit a property");
        return;
      }

      // Get the poster's document reference
      const posterDocRef = doc(fireDataBase, user.userType, user.uid);
      const posterDoc = await getDoc(posterDocRef);

      if (!posterDoc.exists()) {
        toast.error(`${user.userType} profile not found`);
        return;
      }

      // Create listing document first
      const listingsCollectionRef = collection(fireDataBase, "listings");
      const newListingRef = await addDoc(listingsCollectionRef, {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        postedBy: posterDocRef,
        postedByDetails: {
          uid: user.uid,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        createdBy: user.uid,
        userType: user.userType,
        status: "active",
        images: [], // Will be updated after upload
        coverPhotoIndex: coverPhotoIndex,
        viewCount: 0,
      });

      // Upload images with better error handling
      const imageUrls = await Promise.all(
        uploadedImages.map(async (image, index) => {
          const storageRef = ref(
            fireStorage,
            `listings-images/${newListingRef.id}/${image.name}`
          );

          try {
            // Add metadata to help with debugging
            const metadata = {
              customMetadata: {
                uploadedBy: user.uid,
                userType: user.userType,
                listingId: newListingRef.id,
                timestamp: new Date().toISOString(),
              },
            };

            const uploadResult = await uploadBytes(storageRef, image, metadata);
            return await getDownloadURL(uploadResult.ref);
          } catch (error: any) {
            console.error("Upload error details:", {
              code: error.code,
              message: error.message,
              serverResponse: error.serverResponse,
              name: error.name,
              path: storageRef.fullPath,
              file: image.name,
              size: image.size,
              type: image.type,
            });

            if (error.code === "storage/unauthorized") {
              throw new Error(`Authentication error: ${error.message}`);
            }
            throw error;
          }
        })
      );

      // Update the listing document with image URLs
      await updateDoc(newListingRef, {
        images: imageUrls,
        coverPhotoIndex: coverPhotoIndex,
      });

      // Update user's listings
      const existingListings = posterDoc.data()?.myListings || [];
      await updateDoc(posterDocRef, {
        myListings: [
          ...existingListings,
          {
            position: user.userType,
            ref: newListingRef,
          },
        ],
        "subscription.listingsUsed": increment(1),
      });
      // Add activity
      const activityCollectionRef = collection(
        fireDataBase,
        "recentActivities"
      );
      await addDoc(activityCollectionRef, {
        activity: {
          action: "New Property Createds",
          doer: `${user.firstName} ${user.lastName}`,
          doerRef: posterDocRef,
        },
        type: "property",
        doneAt: serverTimestamp(),
        listingId: newListingRef,
      });
      toast.success("Property listed successfully!");
      navigate(`/property/${newListingRef.id}`);
    } catch (error) {
      console.error("Error submitting property:", error);
      toast.error("Failed to list property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextTab = () => {
    if (activeTab === "basic") setActiveTab("location");
    else if (activeTab === "location") setActiveTab("details");
    else if (activeTab === "details") setActiveTab("features");
    else if (activeTab === "features") setActiveTab("images");
  };

  const prevTab = () => {
    if (activeTab === "images") setActiveTab("features");
    else if (activeTab === "features") setActiveTab("details");
    else if (activeTab === "details") setActiveTab("location");
    else if (activeTab === "location") setActiveTab("basic");
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Header />
      <main className="flex-grow mx-auto px-4 py-8 container">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-2 font-bold text-gray-900 text-2xl sm:text-3xl">
            List Your Property
          </h1>
          <p className="mb-6 sm:mb-8 text-gray-600">
            Fill in the details below to list your property on RealtyZambia
          </p>

          <div className="gap-6 lg:gap-8 grid grid-cols-1 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6 md:mb-8 overflow-x-auto">
                      <TabsTrigger value="basic" className="text-xs sm:text-sm">
                        Basic Info
                      </TabsTrigger>
                      <TabsTrigger
                        value="location"
                        className="text-xs sm:text-sm"
                      >
                        Location
                      </TabsTrigger>
                      <TabsTrigger
                        value="details"
                        className="text-xs sm:text-sm"
                      >
                        Details
                      </TabsTrigger>
                      <TabsTrigger
                        value="features"
                        className="text-xs sm:text-sm"
                      >
                        Features
                      </TabsTrigger>
                      <TabsTrigger
                        value="images"
                        className="text-xs sm:text-sm"
                      >
                        Images
                      </TabsTrigger>
                    </TabsList>

                    {/* Basic Info Tab */}
                    <TabsContent value="basic">
                      <div className="space-y-6">
                        <div>
                          <Label
                            htmlFor="title"
                            className="font-medium text-base"
                          >
                            Property Title
                          </Label>
                          <Input
                            id="title"
                            placeholder="e.g. Modern 3 Bedroom House in Kabulonga"
                            className="mt-1"
                            value={formData.title}
                            onChange={(e) =>
                              handleInputChange("title", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="description"
                            className="font-medium text-base"
                          >
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Describe your property in detail..."
                            className="mt-1 min-h-[150px]"
                            value={formData.description}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isFurnished"
                            checked={formData.isFeatured}
                            onCheckedChange={(checked) =>
                              handleInputChange("isFeatured", checked)
                            }
                          />
                          <Label
                            htmlFor="isFurnished"
                            className="font-medium text-base"
                          >
                            Make this a featured property
                          </Label>
                        </div>
                        <div className="gap-3 md:gap-4 grid grid-cols-1 md:grid-cols-2">
                          <div>
                            <Label
                              htmlFor="price"
                              className="font-medium text-base"
                            >
                              Price (ZMW)
                            </Label>
                            <div className="relative mt-1">
                              <DollarSign className="top-3 left-3 absolute w-4 h-4 text-gray-400" />
                              <Input
                                id="price"
                                type="number"
                                placeholder="e.g. 450000"
                                className="pl-10"
                                value={formData.price}
                                onChange={(e) =>
                                  handleInputChange("price", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <Label
                              htmlFor="listingType"
                              className="font-medium text-base"
                            >
                              Listing Type
                            </Label>
                            <Select
                              value={formData.listingType}
                              onValueChange={(value) =>
                                handleInputChange("listingType", value)
                              }
                            >
                              <SelectTrigger id="listingType" className="mt-1">
                                <SelectValue placeholder="Select listing type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sale">For Sale</SelectItem>
                                <SelectItem value="rent">For Rent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label
                            htmlFor="propertyType"
                            className="font-medium text-base"
                          >
                            Property Type
                          </Label>
                          <Select
                            value={formData.propertyType}
                            onValueChange={(value) =>
                              handleInputChange("propertyType", value)
                            }
                          >
                            <SelectTrigger id="propertyType" className="mt-1">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standalone">
                                Standalone House
                              </SelectItem>
                              <SelectItem value="semi-detached">
                                Semi-Detached House
                              </SelectItem>
                              <SelectItem value="apartment">
                                Apartment
                              </SelectItem>
                              <SelectItem value="townhouse">
                                Townhouse
                              </SelectItem>
                              <SelectItem value="farmhouse">
                                Farmhouse
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label
                            htmlFor="propertyCategory"
                            className="font-medium text-base"
                          >
                            Property Category
                          </Label>
                          <Select
                            value={formData.propertyCategory}
                            onValueChange={(value) =>
                              handleInputChange("propertyCategory", value)
                            }
                          >
                            <SelectTrigger
                              id="propertyCategory"
                              className="mt-1"
                            >
                              <SelectValue placeholder="Select property category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="residential">
                                Residential
                              </SelectItem>
                              <SelectItem value="commercial">
                                Commercial
                              </SelectItem>
                              <SelectItem value="land">Land</SelectItem>
                              <SelectItem value="newDevelopment">
                                New Development
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Location Tab */}
                    <TabsContent value="location">
                      <div className="space-y-6">
                        <div>
                          <Label
                            htmlFor="province"
                            className="font-medium text-base"
                          >
                            Province
                          </Label>
                          <Select
                            value={formData.province}
                            onValueChange={(value) =>
                              handleInputChange("province", value)
                            }
                          >
                            <SelectTrigger id="province" className="mt-1">
                              <SelectValue placeholder="Select province" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lusaka">Lusaka</SelectItem>
                              <SelectItem value="copperbelt">
                                Copperbelt
                              </SelectItem>
                              <SelectItem value="central">Central</SelectItem>
                              <SelectItem value="eastern">Eastern</SelectItem>
                              <SelectItem value="northern">Northern</SelectItem>
                              <SelectItem value="luapula">Luapula</SelectItem>
                              <SelectItem value="north-western">
                                North-Western
                              </SelectItem>
                              <SelectItem value="western">Western</SelectItem>
                              <SelectItem value="southern">Southern</SelectItem>
                              <SelectItem value="muchinga">Muchinga</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label
                            htmlFor="city"
                            className="font-medium text-base"
                          >
                            City/Town
                          </Label>
                          <Input
                            id="city"
                            placeholder="e.g. Lusaka"
                            className="mt-1"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="neighborhood"
                            className="font-medium text-base"
                          >
                            Neighborhood/Area
                          </Label>
                          <Input
                            id="neighborhood"
                            placeholder="e.g. Kabulonga"
                            className="mt-1"
                            value={formData.neighborhood}
                            onChange={(e) =>
                              handleInputChange("neighborhood", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="address"
                            className="font-medium text-base"
                          >
                            Street Address
                          </Label>
                          <Textarea
                            id="address"
                            placeholder="Full property address..."
                            className="mt-1"
                            value={formData.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                          />
                          <p className="mt-1 text-gray-500 text-sm">
                            <Info className="inline mr-1 w-4 h-4" />
                            This address will not be displayed publicly. It will
                            be used for verification purposes only.
                          </p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <div className="flex flex-col gap-4 mb-4">
                          <Label
                            htmlFor="nearbyPlaces"
                            className="font-medium text-base"
                          >
                            Nearby Places
                          </Label>
                          <NearbyPlaces
                            formData={formData}
                            setFormData={setFormData}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details">
                      <div className="space-y-6">
                        <div className="gap-3 md:gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                          <div>
                            <Label
                              htmlFor="bedrooms"
                              className="font-medium text-base"
                            >
                              Bedrooms
                            </Label>
                            <Input
                              id="bedrooms"
                              type="number"
                              placeholder="e.g. 3"
                              className="mt-1"
                              value={formData.bedrooms}
                              onChange={(e) =>
                                handleInputChange("bedrooms", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor="bathrooms"
                              className="font-medium text-base"
                            >
                              Bathrooms
                            </Label>
                            <Input
                              id="bathrooms"
                              type="number"
                              placeholder="e.g. 2"
                              className="mt-1"
                              value={formData.bathrooms}
                              onChange={(e) =>
                                handleInputChange("bathrooms", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor="garageSpaces"
                              className="font-medium text-base"
                            >
                              Garage Spaces
                            </Label>
                            <Input
                              id="garageSpaces"
                              type="number"
                              placeholder="e.g. 2"
                              className="mt-1"
                              value={formData.garageSpaces}
                              onChange={(e) =>
                                handleInputChange(
                                  "garageSpaces",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor="yearBuilt"
                              className="font-medium text-base"
                            >
                              Year Built
                            </Label>
                            <Input
                              id="yearBuilt"
                              type="number"
                              placeholder="e.g. 2020"
                              className="mt-1"
                              value={formData.yearBuilt}
                              onChange={(e) =>
                                handleInputChange("yearBuilt", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <Label
                            htmlFor="area"
                            className="font-medium text-base"
                          >
                            Area (m²)
                          </Label>
                          <Input
                            id="area"
                            type="number"
                            placeholder="e.g. 240"
                            className="mt-1"
                            value={formData.area}
                            onChange={(e) =>
                              handleInputChange("area", e.target.value)
                            }
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isFurnished"
                            checked={formData.isFurnished}
                            onCheckedChange={(checked) =>
                              handleInputChange("isFurnished", checked)
                            }
                          />
                          <Label
                            htmlFor="isFurnished"
                            className="font-medium text-base"
                          >
                            Property is furnished
                          </Label>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Features Tab */}
                    <TabsContent value="features">
                      <div className="space-y-6">
                        <h3 className="font-medium text-lg">
                          Property Features & Amenities
                        </h3>
                        <p className="text-gray-500">
                          Select all the features that apply to your property
                        </p>

                        <div className="gap-3 md:gap-4 grid grid-cols-1 sm:grid-cols-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="swimmingPool"
                              checked={formData.features.swimmingPool}
                              onCheckedChange={(checked) =>
                                handleFeatureChange(
                                  "swimmingPool",
                                  checked as boolean
                                )
                              }
                            />
                            <Label htmlFor="swimmingPool">Swimming Pool</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="garden"
                              checked={formData.features.garden}
                              onCheckedChange={(checked) =>
                                handleFeatureChange(
                                  "garden",
                                  checked as boolean
                                )
                              }
                            />
                            <Label htmlFor="garden">Garden</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="securitySystem"
                              checked={formData.features.securitySystem}
                              onCheckedChange={(checked) =>
                                handleFeatureChange(
                                  "securitySystem",
                                  checked as boolean
                                )
                              }
                            />
                            <Label htmlFor="securitySystem">
                              Security System
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="backupPower"
                              checked={formData.features.backupPower}
                              onCheckedChange={(checked) =>
                                handleFeatureChange(
                                  "backupPower",
                                  checked as boolean
                                )
                              }
                            />
                            <Label htmlFor="backupPower">Backup Power</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="borehole"
                              checked={formData.features.borehole}
                              onCheckedChange={(checked) =>
                                handleFeatureChange(
                                  "borehole",
                                  checked as boolean
                                )
                              }
                            />
                            <Label htmlFor="borehole">Borehole</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="airConditioning"
                              checked={formData.features.airConditioning}
                              onCheckedChange={(checked) =>
                                handleFeatureChange(
                                  "airConditioning",
                                  checked as boolean
                                )
                              }
                            />
                            <Label htmlFor="airConditioning">
                              Air Conditioning
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="servantsQuarters"
                              checked={formData.features.servantsQuarters}
                              onCheckedChange={(checked) =>
                                handleFeatureChange(
                                  "servantsQuarters",
                                  checked as boolean
                                )
                              }
                            />
                            <Label htmlFor="servantsQuarters">
                              Servants Quarters
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="fittedKitchen"
                              checked={formData.features.fittedKitchen}
                              onCheckedChange={(checked) =>
                                handleFeatureChange(
                                  "fittedKitchen",
                                  checked as boolean
                                )
                              }
                            />
                            <Label htmlFor="fittedKitchen">
                              Fitted Kitchen
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="parking"
                              checked={formData.features.parking}
                              onCheckedChange={(checked) =>
                                handleFeatureChange(
                                  "parking",
                                  checked as boolean
                                )
                              }
                            />
                            <Label htmlFor="parking">Parking</Label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Images Tab */}
                    <TabsContent value="images">
                      <div className="space-y-6">
                        <div>
                          <h3 className="mb-2 font-medium text-lg">
                            Property Images
                          </h3>
                          <p className="mb-4 text-gray-500">
                            Upload high-quality images of your property (max 10
                            images)
                          </p>

                          <div className="p-4 sm:p-6 border-2 border-gray-300 border-dashed rounded-lg text-center">
                            <input
                              type="file"
                              id="images"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={uploadedImages.length >= 10}
                            />
                            <label
                              htmlFor="images"
                              className={`flex flex-col items-center justify-center cursor-pointer ${
                                uploadedImages.length >= 10
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <Upload className="mb-2 w-10 sm:w-12 h-10 sm:h-12 text-gray-400" />
                              <span className="font-medium text-gray-600 text-sm sm:text-base">
                                Click to upload images
                              </span>
                              <span className="mt-1 text-gray-500 text-xs sm:text-sm">
                                or drag and drop files here
                              </span>
                            </label>
                          </div>

                          {uploadedImages.length > 0 && (
                            <div className="mt-6">
                              <h4 className="mb-3 font-medium text-base">
                                Uploaded Images
                              </h4>
                              <p className="mb-3 text-gray-500 text-sm">
                                Click on the image icon to set it as the cover
                                photo. The first image will be automatically set
                                as the cover photo if none is selected.
                              </p>
                              <div className="gap-3 md:gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                                {uploadedImages.map((image, index) => (
                                  <ImagePreview
                                    key={index}
                                    file={image}
                                    index={index}
                                    onRemove={removeImage}
                                    isCover={index === coverPhotoIndex}
                                    onSetCover={setCoverPhotoIndex}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-between mt-6 sm:mt-8">
                    <Button
                      variant="outline"
                      onClick={prevTab}
                      disabled={activeTab === "basic"}
                      className="px-2 sm:px-4 text-xs sm:text-sm"
                    >
                      Previous
                    </Button>
                    {activeTab === "images" ? (
                      <Button
                        onClick={handleSubmit}
                        className="bg-emerald-600 hover:bg-emerald-700 px-2 sm:px-4 text-xs sm:text-sm"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Submitting...
                          </div>
                        ) : (
                          "Submit Listing"
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={nextTab}
                        className="px-2 sm:px-4 text-xs sm:text-sm"
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="top-24 sticky">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-4 font-semibold text-lg">
                      Listing Summary
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-500 text-sm">
                          Property Title
                        </h4>
                        <p className="font-medium">
                          {formData.title || "Not specified yet"}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-gray-500 text-sm">
                          Price
                        </h4>
                        <p className="font-medium">
                          {formData.price
                            ? `K ${formData.price}`
                            : "Not specified yet"}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-gray-500 text-sm">
                          Location
                        </h4>
                        <p className="font-medium">
                          {formData.neighborhood && formData.city
                            ? `${formData.neighborhood}, ${formData.city}`
                            : "Not specified yet"}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-gray-500 text-sm">
                          Property Type
                        </h4>
                        <p className="font-medium">
                          {formData.propertyType
                            ? formData.propertyType.charAt(0).toUpperCase() +
                              formData.propertyType.slice(1)
                            : "Not specified yet"}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-gray-500 text-sm">
                          Listing Type
                        </h4>
                        <p className="font-medium">
                          {formData.listingType === "sale"
                            ? "For Sale"
                            : "For Rent"}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-gray-500 text-sm">
                          Images
                        </h4>
                        <p className="font-medium">
                          {uploadedImages.length} / 10 uploaded
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 mt-6 p-4 rounded-md">
                      <h4 className="mb-2 font-medium text-sm">
                        Listing Progress
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          {formData.title &&
                          formData.price &&
                          formData.propertyType ? (
                            <Check className="mr-2 w-4 h-4 text-green-500" />
                          ) : (
                            <div className="mr-2 border border-gray-300 rounded-full w-4 h-4" />
                          )}
                          <span className="text-sm">Basic Information</span>
                        </div>
                        <div className="flex items-center">
                          {formData.province &&
                          formData.city &&
                          formData.neighborhood ? (
                            <Check className="mr-2 w-4 h-4 text-green-500" />
                          ) : (
                            <div className="mr-2 border border-gray-300 rounded-full w-4 h-4" />
                          )}
                          <span className="text-sm">Location Details</span>
                        </div>
                        <div className="flex items-center">
                          {formData.bedrooms &&
                          formData.bathrooms &&
                          formData.area ? (
                            <Check className="mr-2 w-4 h-4 text-green-500" />
                          ) : (
                            <div className="mr-2 border border-gray-300 rounded-full w-4 h-4" />
                          )}
                          <span className="text-sm">Property Details</span>
                        </div>
                        <div className="flex items-center">
                          {Object.values(formData.features).some(
                            (value) => value
                          ) ? (
                            <Check className="mr-2 w-4 h-4 text-green-500" />
                          ) : (
                            <div className="mr-2 border border-gray-300 rounded-full w-4 h-4" />
                          )}
                          <span className="text-sm">Features & Amenities</span>
                        </div>
                        <div className="flex items-center">
                          {uploadedImages.length > 0 ? (
                            <Check className="mr-2 w-4 h-4 text-green-500" />
                          ) : (
                            <div className="mr-2 border border-gray-300 rounded-full w-4 h-4" />
                          )}
                          <span className="text-sm">Property Images</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
const ImagePreview = ({
  file,
  onRemove,
  index,
  isCover,
  onSetCover,
}: {
  file: File;
  onRemove: (index: number) => void;
  index: number;
  isCover: boolean;
  onSetCover: (index: number) => void;
}) => {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="group relative">
      <img
        src={preview}
        alt={`Preview ${index + 1}`}
        className={`w-full h-24 object-cover rounded-md ${
          isCover ? "ring-2 ring-realtyplus" : ""
        }`}
      />
      <div className="top-1 right-0 absolute flex justify-between gap-1 px-2 py-1 w-full">
        <button
          onClick={() => onSetCover(index)}
          className={`bg-realtyplus text-white rounded-full p-1 
            ${isCover ? "opacity-100" : "opacity-0 group-hover:opacity-100"} 
            transition-opacity`}
          title={isCover ? "Cover Photo" : "Set as Cover Photo"}
        >
          {isCover ? (
            <Check className="w-4 h-4" />
          ) : (
            <Image className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => onRemove(index)}
          className="bg-red-500 opacity-0 group-hover:opacity-100 p-1 rounded-full text-white transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
const NearbyPlaces = ({
  setFormData,
  formData,
}: {
  formData: LISTING;
  setFormData: React.Dispatch<React.SetStateAction<LISTING>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState<Set<number>>(new Set());
  const [fetchedPlaces, setFetchedPlaces] = useState<
    Array<{
      id: number;
      name: string;
      type: string;
      lat: number;
      lon: number;
      distance?: number;
    }>
  >([]);
  const [selectedType, setSelectedType] = useState<string>("all");

  // Define place types based on your data
  const placeTypes = [
    { label: "All Places", value: "all" },
    { label: "Supermarkets", value: "supermarket" },
    { label: "Schools", value: "school" },
    { label: "Hospitals", value: "hospital" },
    { label: "Restaurants", value: "restaurant" },
    // Add more types as needed
  ];

  const handleFetchNearby = async () => {
    if (!formData.city || !formData.province || !formData.address) {
      alert("Please fill in the address, city, and province first!");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/listing/getnearbyplaces`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            city: formData.city,
            province: formData.province,
            neighborhood: formData.neighborhood,
            address: formData.address,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setFetchedPlaces(data.nearbyPlaces);
        setFormData((prev) => ({ ...prev, nearbyPlaces: [] }));
      } else {
        console.error("Failed to fetch nearby places:", data.message);
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelection = (placeId: number) => {
    const newSelected = new Set(selectedPlaces);
    if (newSelected.has(placeId)) {
      newSelected.delete(placeId);
    } else {
      newSelected.add(placeId);
    }
    setSelectedPlaces(newSelected);

    // Update formData with selected places
    const selectedPlacesArray = Array.from(newSelected).map((id) => {
      const place = fetchedPlaces.find((p) => p.id === id);
      return {
        id,
        name: place?.name || "",
        type: place?.type || "",
        lat: place?.lat || 0,
        lon: place?.lon || 0,
      };
    });

    setFormData((prev) => ({
      ...prev,
      nearbyPlaces: selectedPlacesArray,
    }));
  };

  const filteredPlaces = fetchedPlaces.filter((place) =>
    selectedType === "all" ? true : place.type === selectedType
  );

  return (
    <>
      <div className="space-y-6">
        {/* Responsive controls section */}
        <div className="flex sm:flex-row flex-col items-stretch sm:items-center gap-4">
          <Button
            onClick={handleFetchNearby}
            disabled={loading}
            variant="outline"
            className="flex-1 min-h-[40px]"
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm sm:text-base">
                  Fetching Nearby Places...
                </span>
              </div>
            ) : (
              <span className="text-sm sm:text-base">Fetch Nearby Places</span>
            )}
          </Button>
        </div>

        {fetchedPlaces.length > 0 && (
          <div className="space-y-4">
            {/* Responsive filter section */}
            <div className="flex sm:flex-row flex-col sm:items-center gap-2">
              <Label
                htmlFor="placeType"
                className="text-sm sm:text-base whitespace-nowrap"
              >
                Filter by type:
              </Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger
                  id="placeType"
                  className="w-full sm:w-[180px] h-10"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {placeTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-sm sm:text-base"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Places grid section */}
            <div className="space-y-3">
              <p className="text-gray-500 text-sm sm:text-base">
                Select nearby places to include in your listing:
              </p>
              <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPlaces.map((place) => (
                  <div
                    key={place.id}
                    className="flex items-start space-x-3 hover:bg-gray-50 p-3 border rounded-lg transition-colors"
                  >
                    <Checkbox
                      id={`place-${place.id}`}
                      checked={selectedPlaces.has(place.id)}
                      onCheckedChange={() => handlePlaceSelection(place.id)}
                      className="my-auto"
                    />
                    <Label
                      htmlFor={`place-${place.id}`}
                      className="flex-1 space-y-1 cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <p className="font-medium sm:text-md text-base line-clamp-2">
                          {place.name}
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm capitalize">
                          {place.type}
                        </p>
                        <p className="text-gray-400 text-xs sm:text-sm capitalize">
                          {place.distance} km
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {fetchedPlaces.length === 0 && !loading && (
          <p className="p-4 text-gray-500 text-sm sm:text-base text-center">
            No nearby places found. Try adjusting your location.
          </p>
        )}
      </div>
    </>
  );
};
export default AddProperty;
