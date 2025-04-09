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
} from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { NearbyPlace } from "@/lib/typeDefinitions";
import { useZustand } from "@/lib/zustand";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { ref } from "firebase/storage";
import { toast } from "react-toastify";

const AddProperty = () => {
  const { user, setUser } = useZustand();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    propertyType: "",
    listingType: "sale",
    bedrooms: "",
    bathrooms: "",
    area: "",
    garageSpaces: "",
    yearBuilt: "",
    isFurnished: false,
    province: "",
    city: "",
    neighborhood: "",
    address: "",
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
    nearby_places: [] as NearbyPlace[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
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

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      // Convert FileList to array and validate
      const validFiles = Array.from(files).filter((file) => {
        if (!allowedTypes.includes(file.type)) {
          alert(`File ${file.name} is not a supported image type`);
          return false;
        }
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Max size is 5MB`);
          return false;
        }
        return true;
      });

      setUploadedImages([...uploadedImages, ...validFiles]);
    } catch (error) {
      console.error("Error handling image upload:", error);
      alert("Error handling image upload");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      console.log(user);
      // Get the poster's document reference
      const posterDocRef = doc(fireDataBase, user.userType, user.uid);

      // First, create a new listing document in the "listings" collection
      const listingsCollectionRef = collection(fireDataBase, "listings");
      const newListingRef = await addDoc(listingsCollectionRef, {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        postedBy: posterDocRef, // Using the document reference instead of just UID
        userType: user.userType,
        status: "active",
        images: [], // This will be updated after uploading images
      });

      // Upload images to Firebase Storage and get their URLs
      /* const imageUrls = await Promise.all(
      //  uploadedImages.map(async (image) => {
          const storageRef = ref(
            storage,
            `listings/${newListingRef.id}/${image.name}`
          );
          const uploadResult = await uploadBytes(storageRef, image);
          return await getDownloadURL(uploadResult.ref);
        })
      );

      // Update the listing document with image URLs
      await updateDoc(newListingRef, {
        images: imageUrls,
      });*/

      // Update the user's document with the reference to this listing
      const posterDocSnap = await getDoc(posterDocRef);

      if (posterDocSnap.exists()) {
        const existingListings = posterDocSnap.data().listings || [];
        await updateDoc(posterDocRef, {
          myListings: [
            ...existingListings,
            {
              position: user.userType,
              ref: newListingRef.id,
            },
          ],
        });
      }

      toast.success("Property listed successfully!");
      setIsSubmitting(false);
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            List Your Property
          </h1>
          <p className="text-gray-600 mb-6 sm:mb-8">
            Fill in the details below to list your property on RealtyZambia
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
                            className="text-base font-medium"
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
                            className="text-base font-medium"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          <div>
                            <Label
                              htmlFor="price"
                              className="text-base font-medium"
                            >
                              Price (ZMW)
                            </Label>
                            <div className="relative mt-1">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                              className="text-base font-medium"
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
                            className="text-base font-medium"
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
                              <SelectItem value="commercial">
                                Commercial Property
                              </SelectItem>
                              <SelectItem value="land">Land</SelectItem>
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
                            className="text-base font-medium"
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
                            className="text-base font-medium"
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
                            className="text-base font-medium"
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
                            className="text-base font-medium"
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
                          <p className="text-sm text-gray-500 mt-1">
                            <Info className="h-4 w-4 inline mr-1" />
                            This address will not be displayed publicly. It will
                            be used for verification purposes only.
                          </p>
                        </div>
                      </div>
                      {/*<div className="mt-6">
                        <div className="mb-4 flex flex-col gap-4">
                          <Label
                            htmlFor="nearbyPlaces"
                            className="text-base font-medium"
                          >
                            Nearby Places
                          </Label>

                          
                          {formData.nearby_places.map((place, index) => (
                            <div key={index} className="flex gap-4 mb-2">
                              <input
                                type="text"
                                placeholder="Place name"
                                value={place.name}
                                onChange={(e) =>
                                  updateNearbyPlace(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="border rounded px-2 py-1"
                              />
                              <input
                                type="text"
                                placeholder="Distance (km)"
                                value={place.distance}
                                onChange={(e) =>
                                  updateNearbyPlace(
                                    index,
                                    "distance",
                                    e.target.value
                                  )
                                }
                                className="border rounded px-2 py-1"
                              />
                              <select
                                value={place.type}
                                onChange={(e) =>
                                  updateNearbyPlace(
                                    index,
                                    "type",
                                    e.target.value
                                  )
                                }
                                className="border rounded px-2 py-1"
                              >
                                <option value="">Select type</option>
                                <option value="school">School</option>
                                <option value="hospital">Hospital</option>
                                <option value="shopping">Shopping</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="park">Park</option>
                              </select>
                            </div>
                          ))}

                          
                          <button
                            type="button"
                            onClick={addNearbyPlace}
                            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                          >
                            Add a place
                          </button>
                        </div>
                      </div>*/}
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                          <div>
                            <Label
                              htmlFor="bedrooms"
                              className="text-base font-medium"
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
                              className="text-base font-medium"
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
                              className="text-base font-medium"
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
                              className="text-base font-medium"
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
                            className="text-base font-medium"
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
                            className="text-base font-medium"
                          >
                            Property is furnished
                          </Label>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Features Tab */}
                    <TabsContent value="features">
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">
                          Property Features & Amenities
                        </h3>
                        <p className="text-gray-500">
                          Select all the features that apply to your property
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
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
                          <h3 className="text-lg font-medium mb-2">
                            Property Images
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Upload high-quality images of your property (max 10
                            images)
                          </p>

                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
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
                              <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-2" />
                              <span className="text-gray-600 font-medium text-sm sm:text-base">
                                Click to upload images
                              </span>
                              <span className="text-gray-500 text-xs sm:text-sm mt-1">
                                or drag and drop files here
                              </span>
                            </label>
                          </div>

                          {uploadedImages.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-base font-medium mb-3">
                                Uploaded Images
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                                {uploadedImages.map((image, index) => (
                                  <ImagePreview
                                    key={index}
                                    file={image}
                                    onRemove={removeImage}
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
                      className="text-xs sm:text-sm px-2 sm:px-4"
                    >
                      Previous
                    </Button>
                    {activeTab === "images" ? (
                      <Button
                        onClick={handleSubmit}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm px-2 sm:px-4"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4"
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
                        className="text-xs sm:text-sm px-2 sm:px-4"
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
              <div className="sticky top-24">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Listing Summary
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Property Title
                        </h4>
                        <p className="font-medium">
                          {formData.title || "Not specified yet"}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Price
                        </h4>
                        <p className="font-medium">
                          {formData.price
                            ? `K${parseInt(formData.price).toLocaleString()}`
                            : "Not specified yet"}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
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
                        <h4 className="text-sm font-medium text-gray-500">
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
                        <h4 className="text-sm font-medium text-gray-500">
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
                        <h4 className="text-sm font-medium text-gray-500">
                          Images
                        </h4>
                        <p className="font-medium">
                          {uploadedImages.length} / 10 uploaded
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium mb-2">
                        Listing Progress
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          {formData.title &&
                          formData.price &&
                          formData.propertyType ? (
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-gray-300 mr-2" />
                          )}
                          <span className="text-sm">Basic Information</span>
                        </div>
                        <div className="flex items-center">
                          {formData.province &&
                          formData.city &&
                          formData.neighborhood ? (
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-gray-300 mr-2" />
                          )}
                          <span className="text-sm">Location Details</span>
                        </div>
                        <div className="flex items-center">
                          {formData.bedrooms &&
                          formData.bathrooms &&
                          formData.area ? (
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-gray-300 mr-2" />
                          )}
                          <span className="text-sm">Property Details</span>
                        </div>
                        <div className="flex items-center">
                          {Object.values(formData.features).some(
                            (value) => value
                          ) ? (
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-gray-300 mr-2" />
                          )}
                          <span className="text-sm">Features & Amenities</span>
                        </div>
                        <div className="flex items-center">
                          {uploadedImages.length > 0 ? (
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-gray-300 mr-2" />
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
  key,
}: {
  file: File;
  onRemove: (index: number) => void;
  key: number;
}) => {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Clean up
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative group">
      <img
        src={preview}
        alt="Preview"
        className="w-full h-24 object-cover rounded-md"
      />
      <button
        onClick={() => onRemove(key)}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default AddProperty;
