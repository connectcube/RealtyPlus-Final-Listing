import React, { useState } from "react";
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

const AddProperty = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
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
  });

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In a real app, you would upload these to a server
    // Here we're just creating local URLs for preview
    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file),
    );
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    console.log("Uploaded images:", uploadedImages);
    // In a real app, you would send this data to your backend
    alert("Property listing submitted successfully!");
    navigate("/");
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            List Your Property
          </h1>
          <p className="text-gray-600 mb-8">
            Fill in the details below to list your property on RealtyZambia
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-6 md:mb-8 overflow-x-auto">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="location">Location</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="features">Features</TabsTrigger>
                      <TabsTrigger value="images">Images</TabsTrigger>
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
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details">
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
                                  e.target.value,
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
                                  checked as boolean,
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
                                  checked as boolean,
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
                                  checked as boolean,
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
                                  checked as boolean,
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
                                  checked as boolean,
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
                                  checked as boolean,
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
                                  checked as boolean,
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
                                  checked as boolean,
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
                                  checked as boolean,
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

                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                              <Upload className="h-12 w-12 text-gray-400 mb-2" />
                              <span className="text-gray-600 font-medium">
                                Click to upload images
                              </span>
                              <span className="text-gray-500 text-sm mt-1">
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
                                  <div key={index} className="relative group">
                                    <img
                                      src={image}
                                      alt={`Property image ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-md"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={prevTab}
                      disabled={activeTab === "basic"}
                    >
                      Previous
                    </Button>
                    {activeTab === "images" ? (
                      <Button
                        onClick={handleSubmit}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Submit Listing
                      </Button>
                    ) : (
                      <Button onClick={nextTab}>Next</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
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
                            (value) => value,
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

export default AddProperty;
