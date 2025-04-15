import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  MapPin,
  Home,
  DollarSign,
  Calendar,
  Bed,
  Bath,
  Car,
  Coffee,
  Map,
  Filter,
  Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";

interface SearchFiltersProps {
  onSearch?: (filters: SearchFilters) => void;
  className?: string;
  compact?: boolean;
  type?: string;
}

interface SearchFilters {
  location: string;
  address: string;
  province: string;
  priceRange: [string, string];
  propertyType: string;
  furnishingStatus: string;
  yearBuilt: string;
  bedrooms: string;
  bathrooms: string;
  garage: string;
  amenities: string[];
  listingType: string;
  propertyCategory: string;
}

interface ValidationError {
  field: string;
  message: string;
}

const SearchFilters = ({
  onSearch,
  className,
  compact = false,
  type = "sale",
}: SearchFiltersProps = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set different price ranges based on listing type
  const priceRanges = {
    sale: {
      min: 10,
      max: 5000000,
      default: ["10", "5000000"],
      step: 10000,
    },
    rent: { min: 10, max: 50000, default: ["100", "50000"], step: 100 },
  };

  const [filters, setFilters] = useState<SearchFilters>({
    location: "",
    address: "",
    province: "",
    priceRange: [priceRanges[type].default[0], priceRanges[type].default[1]],
    propertyType: "",
    furnishingStatus: "",
    yearBuilt: "",
    bedrooms: "",
    bathrooms: "",
    garage: "",
    amenities: [],
    listingType: type,
    propertyCategory: "",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    setFilters((prev) => ({
      ...prev,
      location: params.location || "",
      province: params.province || "",
      priceRange: params.priceRange
        ? (params.priceRange.split(",") as [string, string])
        : prev.priceRange,
      propertyType: params.propertyType || "",
      propertyCategory: params.propertyCategory || "",
      bedrooms: params.bedrooms || "",
      bathrooms: params.bathrooms || "",
      garage: params.garage || "",
      furnishingStatus: params.furnishingStatus || "",
      yearBuilt: params.yearBuilt || "",
      amenities: params.amenities ? params.amenities.split(",") : [],
      listingType: params.listingType || type,
    }));
  }, [searchParams, type]);

  // In SearchFilters.tsx
  const updateURLParams = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();

    // Only add non-empty and non-default values to URL
    if (newFilters.location) params.set("location", newFilters.location);
    if (newFilters.province) params.set("province", newFilters.province);
    if (newFilters.propertyType)
      params.set("propertyType", newFilters.propertyType);
    if (newFilters.propertyCategory)
      params.set("propertyCategory", newFilters.propertyCategory);
    if (newFilters.bedrooms) params.set("bedrooms", newFilters.bedrooms);
    if (newFilters.bathrooms) params.set("bathrooms", newFilters.bathrooms);
    if (newFilters.garage) params.set("garage", newFilters.garage);
    if (newFilters.furnishingStatus)
      params.set("furnishingStatus", newFilters.furnishingStatus);
    if (newFilters.yearBuilt) params.set("yearBuilt", newFilters.yearBuilt);
    if (newFilters.amenities.length > 0)
      params.set("amenities", newFilters.amenities.join(","));

    if (
      newFilters.priceRange[0] !==
        priceRanges[newFilters.listingType].default[0] ||
      newFilters.priceRange[1] !==
        priceRanges[newFilters.listingType].default[1]
    ) {
      params.set("priceRange", newFilters.priceRange.join(","));
    }

    setSearchParams(params, { replace: true });
  };
  const validatePriceRange = (range: [string, string]): boolean => {
    // Check if values are valid numbers
    if (isNaN(Number(range[0])) || isNaN(Number(range[1]))) {
      return false;
    }

    // Check if min is less than max
    if (Number(range[0]) > Number(range[1])) {
      return false;
    }

    return true;
  };
  const validateFilters = (filters: SearchFilters): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validate price range
    if (filters.priceRange[0] > filters.priceRange[1]) {
      errors.push({
        field: "priceRange",
        message: "Minimum price cannot be greater than maximum price",
      });
    }

    // Validate year built
    if (filters.yearBuilt && isNaN(Number(filters.yearBuilt))) {
      errors.push({
        field: "yearBuilt",
        message: "Year built must be a valid number",
      });
    }

    return errors;
  };

  const handleSearch = async () => {
    const validationErrors = validateFilters(filters);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      updateURLParams(filters);
      if (onSearch) {
        await onSearch(filters);
      }
    } catch (error) {
      setErrors([
        {
          field: "general",
          message:
            "An error occurred while performing the search. Please try again.",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceRangeChange = (value: number[]) => {
    const newRange: [string, string] = [
      value[0].toString(),
      value[1].toString(),
    ];

    if (!validatePriceRange(newRange)) {
      setErrors((prev) => [
        ...prev.filter((e) => e.field !== "priceRange"),
        {
          field: "priceRange",
          message: "Invalid price range values",
        },
      ]);
      return;
    }

    setErrors((prev) => prev.filter((error) => error.field !== "priceRange"));
    setFilters((prev) => ({
      ...prev,
      priceRange: newRange,
    }));
  };

  const handleReset = () => {
    const defaultPriceRange =
      filters.listingType === "rent"
        ? (priceRanges.rent.default as [string, string])
        : (priceRanges.sale.default as [string, string]);

    const resetFilters = {
      location: "",
      address: "",
      province: "",
      priceRange: defaultPriceRange,
      propertyType: "",
      furnishingStatus: "",
      yearBuilt: "",
      bedrooms: "",
      bathrooms: "",
      garage: "",
      amenities: [],
      propertyCategory: "",
      listingType: filters.listingType,
    };

    setFilters(resetFilters);
    setSearchParams(new URLSearchParams()); // Clear all URL params
  };

  const handleListingTypeChange = (value: string) => {
    const newPriceRange =
      value === "rent"
        ? (priceRanges.rent.default as [string, string])
        : (priceRanges.sale.default as [string, string]);

    setFilters({
      ...filters,
      listingType: value,
      priceRange: newPriceRange,
    });
  };

  return (
    <div className={cn("bg-white p-4 rounded-lg shadow-md", className)}>
      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          {errors.map((error) => (
            <p key={error.field} className="text-red-600 text-sm">
              {error.message}
            </p>
          ))}
        </div>
      )}
      <Tabs defaultValue={type} onValueChange={handleListingTypeChange}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="sale">Buy</TabsTrigger>
          <TabsTrigger value="rent">Rent</TabsTrigger>
        </TabsList>

        <TabsContent value="sale" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Enter location"
                  className="pl-8"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="w-full md:w-1/4">
              <Label htmlFor="province">Province</Label>
              <Select
                value={filters.province}
                onValueChange={(value) =>
                  setFilters({ ...filters, province: value })
                }
              >
                <SelectTrigger id="province">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="lusaka">Lusaka</SelectItem>
                  <SelectItem value="copperbelt">Copperbelt</SelectItem>
                  <SelectItem value="central">Central</SelectItem>
                  <SelectItem value="eastern">Eastern</SelectItem>
                  <SelectItem value="northern">Northern</SelectItem>
                  <SelectItem value="southern">Southern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/4">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={filters.propertyType}
                onValueChange={(value) =>
                  setFilters({ ...filters, propertyType: value })
                }
              >
                <SelectTrigger id="propertyType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="semi-detached">Semi Detached</SelectItem>
                  <SelectItem value="standalone">Stand Alone</SelectItem>
                  <SelectItem value="farmhouse">Farmhouse</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/4">
              <Label htmlFor="propertyCategory">Property Category</Label>
              <Select
                value={filters.propertyCategory}
                onValueChange={(value) =>
                  setFilters({ ...filters, propertyCategory: value })
                }
              >
                <SelectTrigger id="propertyCategory">
                  <SelectValue placeholder="Select property category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="newDevelopment">
                    New Development
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Price Range</Label>
              <span className="text-sm text-muted-foreground">
                K{parseInt(filters.priceRange[0]).toLocaleString()} - K
                {parseInt(filters.priceRange[1]).toLocaleString()}
              </span>
            </div>
            <Slider
              min={parseInt(priceRanges[filters.listingType].min)}
              max={parseInt(priceRanges[filters.listingType].max)}
              step={priceRanges[filters.listingType].step}
              value={[
                parseInt(filters.priceRange[0]),
                parseInt(filters.priceRange[1]),
              ]}
              onValueChange={handlePriceRangeChange}
              className="my-4"
            />
          </div>

          {!compact && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs w-full sm:w-auto"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Filters
                <Filter className="ml-1 h-3 w-3" />
              </Button>

              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none"
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSearch}
                  className="flex-1 sm:flex-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      Search
                      <Search className="ml-1 h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {showAdvanced && !compact && (
            <div className="pt-4 space-y-4 border-t mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select
                    value={filters.bedrooms}
                    onValueChange={(value) =>
                      setFilters({ ...filters, bedrooms: value })
                    }
                  >
                    <SelectTrigger id="bedrooms">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select
                    value={filters.bathrooms}
                    onValueChange={(value) =>
                      setFilters({ ...filters, bathrooms: value })
                    }
                  >
                    <SelectTrigger id="bathrooms">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="garage">Garage</Label>
                  <Select
                    value={filters.garage}
                    onValueChange={(value) =>
                      setFilters({ ...filters, garage: value })
                    }
                  >
                    <SelectTrigger id="garage">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="furnishingStatus">Furnishing</Label>
                  <Select
                    value={filters.furnishingStatus}
                    onValueChange={(value) =>
                      setFilters({ ...filters, furnishingStatus: value })
                    }
                  >
                    <SelectTrigger id="furnishingStatus">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furnished">Furnished</SelectItem>
                      <SelectItem value="semi-furnished">
                        Semi-Furnished
                      </SelectItem>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Select
                  value={filters.yearBuilt}
                  onValueChange={(value) =>
                    setFilters({ ...filters, yearBuilt: value })
                  }
                >
                  <SelectTrigger id="yearBuilt">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023+</SelectItem>
                    <SelectItem value="2020">2020+</SelectItem>
                    <SelectItem value="2015">2015+</SelectItem>
                    <SelectItem value="2010">2010+</SelectItem>
                    <SelectItem value="2000">2000+</SelectItem>
                    <SelectItem value="1990">1990+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    "Swimming Pool",
                    "Garden",
                    "Security",
                    "Backup Power",
                    "Air Conditioning",
                    "Borehole",
                    "Staff Quarters",
                    "Gym",
                  ].map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`buy-${amenity.toLowerCase().replace(" ", "-")}`}
                        checked={filters.amenities.includes(amenity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters({
                              ...filters,
                              amenities: [...filters.amenities, amenity],
                            });
                          } else {
                            setFilters({
                              ...filters,
                              amenities: filters.amenities.filter(
                                (a) => a !== amenity
                              ),
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`buy-${amenity
                          .toLowerCase()
                          .replace(" ", "-")}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rent" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex-1">
              <Label htmlFor="location-rent">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location-rent"
                  placeholder="Enter location"
                  className="pl-8"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="w-full md:w-1/4">
              <Label htmlFor="province-rent">Province</Label>
              <Select
                value={filters.province}
                onValueChange={(value) =>
                  setFilters({ ...filters, province: value })
                }
              >
                <SelectTrigger id="province-rent">
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lusaka">Lusaka</SelectItem>
                  <SelectItem value="copperbelt">Copperbelt</SelectItem>
                  <SelectItem value="central">Central</SelectItem>
                  <SelectItem value="eastern">Eastern</SelectItem>
                  <SelectItem value="northern">Northern</SelectItem>
                  <SelectItem value="southern">Southern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-1/4">
              <Label htmlFor="propertyType-rent">Property Type</Label>
              <Select
                value={filters.propertyType}
                onValueChange={(value) =>
                  setFilters({ ...filters, propertyType: value })
                }
              >
                <SelectTrigger id="propertyType-rent">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="semi-detached">Semi Detached</SelectItem>
                  <SelectItem value="standalone">Stand Alone</SelectItem>
                  <SelectItem value="farmhouse">Farmhouse</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Price Range</Label>
              <span className="text-sm text-muted-foreground">
                K{filters.priceRange[0].toLocaleString()} - K
                {filters.priceRange[1].toLocaleString()}
              </span>
            </div>
            <Slider
              min={parseInt(priceRanges[filters.listingType].min)}
              max={parseInt(priceRanges[filters.listingType].max)}
              step={priceRanges[filters.listingType].step}
              value={[
                parseInt(filters.priceRange[0]),
                parseInt(filters.priceRange[1]),
              ]}
              onValueChange={handlePriceRangeChange}
              className="my-4"
            />
          </div>

          {!compact && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs w-full sm:w-auto"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Filters
                <Filter className="ml-1 h-3 w-3" />
              </Button>

              <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none"
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSearch}
                  className="flex-1 sm:flex-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      Search
                      <Search className="ml-1 h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {showAdvanced && !compact && (
            <div className="pt-4 space-y-4 border-t mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="bedrooms-rent">Bedrooms</Label>
                  <Select
                    value={filters.bedrooms}
                    onValueChange={(value) =>
                      setFilters({ ...filters, bedrooms: value })
                    }
                  >
                    <SelectTrigger
                      id="bedrooms-rent"
                      aria-label="Select number of bedrooms"
                    >
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bathrooms-rent">Bathrooms</Label>
                  <Select
                    value={filters.bathrooms}
                    onValueChange={(value) =>
                      setFilters({ ...filters, bathrooms: value })
                    }
                  >
                    <SelectTrigger
                      id="bathrooms-rent"
                      aria-label="Select number of bathrooms"
                    >
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="garage-rent">Garage</Label>
                  <Select
                    value={filters.garage}
                    onValueChange={(value) =>
                      setFilters({ ...filters, garage: value })
                    }
                  >
                    <SelectTrigger
                      id="garage-rent"
                      aria-label="Select number of garage spaces"
                    >
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="furnishingStatus-rent">Furnishing</Label>
                  <Select
                    value={filters.furnishingStatus}
                    onValueChange={(value) =>
                      setFilters({ ...filters, furnishingStatus: value })
                    }
                  >
                    <SelectTrigger
                      id="furnishingStatus-rent"
                      aria-label="Select furnishing status"
                    >
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furnished">Furnished</SelectItem>
                      <SelectItem value="semi-furnished">
                        Semi-Furnished
                      </SelectItem>
                      <SelectItem value="unfurnished">Unfurnished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="yearBuilt-rent">Year Built</Label>
                <Select
                  value={filters.yearBuilt}
                  onValueChange={(value) =>
                    setFilters({ ...filters, yearBuilt: value })
                  }
                >
                  <SelectTrigger
                    id="yearBuilt-rent"
                    aria-label="Select year built"
                  >
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023+</SelectItem>
                    <SelectItem value="2020">2020+</SelectItem>
                    <SelectItem value="2015">2015+</SelectItem>
                    <SelectItem value="2010">2010+</SelectItem>
                    <SelectItem value="2000">2000+</SelectItem>
                    <SelectItem value="1990">1990+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amenities</Label>
                <div
                  className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2"
                  role="group"
                  aria-labelledby="amenities-label"
                >
                  <span id="amenities-label" className="sr-only">
                    Select amenities
                  </span>
                  {[
                    "Swimming Pool",
                    "Garden",
                    "Security",
                    "Backup Power",
                    "Air Conditioning",
                    "Borehole",
                    "Staff Quarters",
                    "Gym",
                  ].map((amenity) => (
                    <div
                      key={`rent-${amenity}`}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`rent-${amenity.toLowerCase().replace(" ", "-")}`}
                        checked={filters.amenities.includes(amenity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters({
                              ...filters,
                              amenities: [...filters.amenities, amenity],
                            });
                          } else {
                            setFilters({
                              ...filters,
                              amenities: filters.amenities.filter(
                                (a) => a !== amenity
                              ),
                            });
                          }
                        }}
                        aria-label={`${amenity} amenity`}
                      />
                      <label
                        htmlFor={`rent-${amenity
                          .toLowerCase()
                          .replace(" ", "-")}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {amenity}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchFilters;
