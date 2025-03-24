import React, { useState } from "react";
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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchFiltersProps {
  onSearch?: (filters: SearchFilters) => void;
  className?: string;
  compact?: boolean;
}

interface SearchFilters {
  location: string;
  province: string;
  priceRange: [number, number];
  propertyType: string;
  furnishingStatus: string;
  yearBuilt: string;
  bedrooms: string;
  bathrooms: string;
  garage: string;
  amenities: string[];
  listingType: string;
}

const SearchFilters = ({
  onSearch,
  className,
  compact = false,
}: SearchFiltersProps = {}) => {
  // Set different price ranges based on listing type
  const priceRanges = {
    buy: { min: 10000, max: 5000000, default: [10000, 5000000], step: 10000 },
    rent: { min: 100, max: 50000, default: [100, 50000], step: 100 },
  };

  const [filters, setFilters] = useState<SearchFilters>({
    location: "",
    province: "",
    priceRange: priceRanges.buy.default as [number, number],
    propertyType: "",
    furnishingStatus: "",
    yearBuilt: "",
    bedrooms: "",
    bathrooms: "",
    garage: "",
    amenities: [],
    listingType: "buy",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePriceRangeChange = (value: number[]) => {
    setFilters({
      ...filters,
      priceRange: [value[0], value[1]],
    });
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(filters);
    }
  };

  const handleReset = () => {
    const defaultPriceRange =
      filters.listingType === "rent"
        ? (priceRanges.rent.default as [number, number])
        : (priceRanges.buy.default as [number, number]);

    setFilters({
      location: "",
      province: "",
      priceRange: defaultPriceRange,
      propertyType: "",
      furnishingStatus: "",
      yearBuilt: "",
      bedrooms: "",
      bathrooms: "",
      garage: "",
      amenities: [],
      listingType: filters.listingType,
    });
  };

  const handleListingTypeChange = (value: string) => {
    const newPriceRange =
      value === "rent"
        ? (priceRanges.rent.default as [number, number])
        : (priceRanges.buy.default as [number, number]);

    setFilters({
      ...filters,
      listingType: value,
      priceRange: newPriceRange,
    });
  };

  return (
    <div className={cn("bg-white p-4 rounded-lg shadow-md", className)}>
      <Tabs defaultValue="buy" onValueChange={handleListingTypeChange}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="rent">Rent</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
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
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
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
              min={priceRanges.buy.min}
              max={priceRanges.buy.max}
              step={priceRanges.buy.step}
              value={[filters.priceRange[0], filters.priceRange[1]]}
              onValueChange={handlePriceRangeChange}
              className="my-4"
            />
          </div>

          {!compact && (
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Filters
                <Filter className="ml-1 h-3 w-3" />
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>
                <Button size="sm" onClick={handleSearch}>
                  Search
                  <Search className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {showAdvanced && !compact && (
            <div className="pt-4 space-y-4 border-t mt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                        id={amenity.toLowerCase().replace(" ", "-")}
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
                                (a) => a !== amenity,
                              ),
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={amenity.toLowerCase().replace(" ", "-")}
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
          <div className="flex flex-col md:flex-row gap-4">
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
              min={priceRanges.rent.min}
              max={priceRanges.rent.max}
              step={priceRanges.rent.step}
              value={[filters.priceRange[0], filters.priceRange[1]]}
              onValueChange={handlePriceRangeChange}
              className="my-4"
            />
          </div>

          {!compact && (
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Filters
                <Filter className="ml-1 h-3 w-3" />
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>
                <Button size="sm" onClick={handleSearch}>
                  Search
                  <Search className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {showAdvanced && !compact && (
            <div className="pt-4 space-y-4 border-t mt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="bedrooms-rent">Bedrooms</Label>
                  <Select
                    value={filters.bedrooms}
                    onValueChange={(value) =>
                      setFilters({ ...filters, bedrooms: value })
                    }
                  >
                    <SelectTrigger id="bedrooms-rent">
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
                    <SelectTrigger id="bathrooms-rent">
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
                    <SelectTrigger id="garage-rent">
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
                    <SelectTrigger id="furnishingStatus-rent">
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
                  <SelectTrigger id="yearBuilt-rent">
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                        id={`${amenity.toLowerCase().replace(" ", "-")}-rent`}
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
                                (a) => a !== amenity,
                              ),
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`${amenity.toLowerCase().replace(" ", "-")}-rent`}
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
