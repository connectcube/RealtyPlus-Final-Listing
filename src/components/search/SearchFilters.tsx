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
  address?: string;
  province?: string;
  priceRange?: [number, number];
  propertyType?: string;
  isFurnished?: boolean;
  yearBuilt?: number;
  bedrooms?: number;
  bathrooms?: number;
  garage?: number;
  amenities?: string[];
  listingType?: string;
  propertyCategory?: string;
}
interface SearchFiltersProps {
  onSearch?: (filters: SearchFilters) => void;
  filters?: Partial<SearchFilters>;
  setFilters: React.Dispatch<React.SetStateAction<Partial<SearchFilters>>>;
  className?: string;
  compact?: boolean;
  type?: string;
  isLoading?: boolean;
}
interface ValidationError {
  field: string;
  message: string;
}

const SearchFilters = ({
  onSearch,
  filters,
  setFilters,
  className,
  isLoading = false,
  compact = false,
  type = "sale",
}: SearchFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Set different price ranges based on listing type
  const priceRanges = {
    sale: {
      min: 10,
      max: 5000000,
      default: [10, 5000000],
      step: 1000,
    },
    rent: {
      min: 100,
      max: 50000,
      default: [100, 50000],
      step: 100,
    },
  };
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      onSearch(filters);
    } catch (error) {
      setErrors([
        {
          field: "general",
          message:
            "An error occurred while performing the search. Please try again.",
        },
      ]);
    }
  };

  const handlePriceRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setFilters((prev) => ({
      ...prev,
      priceRange: newRange,
    }));
  };

  const handleReset = () => {
    const defaultPriceRange =
      filters.listingType === "rent"
        ? (priceRanges.rent.default as [number, number])
        : (priceRanges.sale.default as [number, number]);

    const resetFilters = {
      location: "",
      address: "",
      province: "",
      priceRange: defaultPriceRange,
      propertyType: "",
      isFurnished: null,
      yearBuilt: 0,
      bedrooms: 0,
      bathrooms: 0,
      garage: 0,
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
        ? (priceRanges.rent.default as [number, number])
        : (priceRanges.sale.default as [number, number]);

    setFilters({
      ...filters,
      listingType: value,
      priceRange: newPriceRange,
    });
  };

  return (
    <div className={cn("bg-white p-4 rounded-lg shadow-md w-full", className)}>
      {errors.length > 0 && (
        <div className="bg-red-50 mb-4 p-4 border border-red-200 rounded-md">
          {errors.map((error) => (
            <p key={error.field} className="text-red-600 text-sm">
              {error.message}
            </p>
          ))}
        </div>
      )}
      <Tabs defaultValue={type} onValueChange={handleListingTypeChange}>
        <TabsList className="grid grid-cols-2 mb-4 w-full" defaultValue={type}>
          <TabsTrigger value="sale">Buy</TabsTrigger>
          <TabsTrigger value="rent">Rent</TabsTrigger>
        </TabsList>

        <TabsContent value="sale" className="space-y-4">
          <div className="flex md:flex-row flex-col gap-3 md:gap-4">
            <div className="flex-1">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="top-2.5 left-2 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Enter location"
                  className="pl-8"
                  value={filters.address}
                  onChange={(e) => {
                    setFilters({ ...filters, address: e.target.value });
                  }}
                />
              </div>
            </div>

            <div className="w-full md:w-1/4">
              <Label htmlFor="province">Province</Label>
              <Select
                value={filters.province}
                onValueChange={(value) => {
                  setFilters({ ...filters, province: value });
                }}
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
                onValueChange={(value) => {
                  setFilters({ ...filters, propertyType: value });
                }}
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
                onValueChange={(value) => {
                  setFilters({ ...filters, propertyCategory: value });
                }}
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
              <span className="text-muted-foreground text-sm">
                K{filters.priceRange[0].toLocaleString()} - K
                {filters.priceRange[1].toLocaleString()}
              </span>
            </div>
            <Slider
              min={parseInt(priceRanges[filters.listingType].min)}
              max={parseInt(priceRanges[filters.listingType].max)}
              step={priceRanges[filters.listingType].step}
              value={[filters.priceRange[0], filters.priceRange[1]]}
              onValueChange={handlePriceRangeChange}
              className="my-4"
            />
          </div>

          {!compact && (
            <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full sm:w-auto text-xs"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Filters
                <Filter className="ml-1 w-3 h-3" />
              </Button>

              <div className="flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
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
                  {isSubmitting || isLoading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      Search
                      <Search className="ml-1 w-3 h-3" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {showAdvanced && !compact && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              <div className="gap-3 md:gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select
                    value={filters.bedrooms?.toString() || "0"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, bedrooms: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="bedrooms">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
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
                    value={filters.bathrooms?.toString() || "0"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, bathrooms: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="bathrooms">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
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
                    value={filters.garage?.toString() || "0"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, garage: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="garage">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="furnishingStatus">Furnishing</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="furnishingStatus"
                      checked={filters.isFurnished === true}
                      onCheckedChange={(checked) => {
                        setFilters({
                          ...filters,
                          isFurnished: checked ? true : false,
                        });
                      }}
                    />
                    <label
                      htmlFor="furnishingStatus"
                      className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                    >
                      Furnished
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="yearBuilt">Year Built</Label>
                <Select
                  value={filters.yearBuilt.toLocaleString()}
                  onValueChange={(value) =>
                    setFilters({ ...filters, yearBuilt: parseInt(value) })
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
                <div className="gap-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    "swimmingPool",
                    "garden",
                    "security",
                    "backupPower",
                    "airConditioning",
                    "borehole",
                    "servantsQuarters",
                    "gym",
                    "parking",
                    "fittedKitchen",
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
                        className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                      >
                        {Amenities[amenity]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rent" className="space-y-4">
          <div className="flex md:flex-row flex-col gap-3 md:gap-4">
            <div className="flex-1">
              <Label htmlFor="location-rent">Location</Label>
              <div className="relative">
                <MapPin className="top-2.5 left-2 absolute w-4 h-4 text-muted-foreground" />
                <Input
                  id="location-rent"
                  placeholder="Enter location"
                  className="pl-8"
                  value={filters.address}
                  onChange={(e) =>
                    setFilters({ ...filters, address: e.target.value })
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
                  <SelectItem value="all">All</SelectItem>
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
              <span className="text-muted-foreground text-sm">
                K{filters.priceRange[0].toLocaleString()} - K
                {filters.priceRange[1].toLocaleString()}
              </span>
            </div>
            <Slider
              min={parseInt(priceRanges[filters.listingType].min)}
              max={parseInt(priceRanges[filters.listingType].max)}
              step={priceRanges[filters.listingType].step}
              value={[filters.priceRange[0], filters.priceRange[1]]}
              onValueChange={handlePriceRangeChange}
              className="my-4"
            />
          </div>

          {!compact && (
            <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full sm:w-auto text-xs"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Filters
                <Filter className="ml-1 w-3 h-3" />
              </Button>

              <div className="flex gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
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
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      Search
                      <Search className="ml-1 w-3 h-3" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {showAdvanced && !compact && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              <div className="gap-3 md:gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <Label htmlFor="bedrooms-rent">Bedrooms</Label>
                  <Select
                    value={filters.bedrooms?.toString() || "0"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, bedrooms: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="bedrooms-rent">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
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
                    value={filters.bathrooms?.toString() || "0"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, bathrooms: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="bathrooms-rent">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
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
                    value={filters.garage?.toString() || "0"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, garage: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="garage-rent">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="furnishingStatus">Furnishing</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="furnishingStatus-rent"
                      checked={filters.isFurnished === true}
                      onCheckedChange={(checked) => {
                        setFilters({
                          ...filters,
                          isFurnished: checked ? true : false,
                        });
                      }}
                    />
                    <label
                      htmlFor="furnishingStatus"
                      className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
                    >
                      Furnished
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="yearBuilt-rent">Year Built</Label>
                <Select
                  value={filters.yearBuilt.toLocaleString()}
                  onValueChange={(value) =>
                    setFilters({ ...filters, yearBuilt: parseInt(value) })
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
                  className="gap-2 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4"
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
                        className="peer-disabled:opacity-70 font-medium text-sm leading-none peer-disabled:cursor-not-allowed"
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

const Amenities = {
  swimmingPool: "Swimming Pool",
  garden: "Garden",
  security: "Security",
  backupPower: "Backup Power",
  airConditioning: "Air Conditioning",
  borehole: "Borehole",
  fittedKitchen: "Fitted Kitchen",
  parking: "Parking",
  servantsQuarters: "Staff Quarters",
  gym: "Gym",
  securitySystem: "Security System",
};
export default SearchFilters;
