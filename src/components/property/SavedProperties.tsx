import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { LISTING } from "@/lib/typeDefinitions";
import {
  Heart,
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  Bath,
  Home,
  Bed,
  MapPin,
} from "lucide-react";
import { LoadingSpinner } from "@/components/globalScreens/Loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/layout/Header";
import PropertyCard from "@/components/property/PropertyCard";
import { useZustand } from "@/lib/zustand";

const SavedPropertiesPage = () => {
  const { user, setUser } = useZustand();
  const [savedProperties, setSavedProperties] = useState<LISTING[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<LISTING[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-high" | "price-low">(
    "newest"
  );
  const [filterType, setFilterType] = useState<"all" | "sale" | "rent">("all");
  const itemsPerPage = 12; // Show 12 items per page in grid view
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        if (!user?.savedProperties || user.savedProperties.length === 0) {
          setIsLoading(false);
          return;
        }

        const propertiesPromises = user.savedProperties.map(async (ref) => {
          const docRef = doc(fireDataBase, "listings", ref);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            return { uid: docSnap.id, ...docSnap.data() } as LISTING;
          }
          return null;
        });

        const properties = await Promise.all(propertiesPromises);
        const validProperties = properties.filter(
          (prop): prop is LISTING => prop !== null
        );
        setSavedProperties(validProperties);
        setFilteredProperties(validProperties);

        // Calculate total pages
        setTotalPages(Math.ceil(validProperties.length / itemsPerPage));

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching saved properties:", error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to load saved properties. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchSavedProperties();
  }, [user?.savedProperties]);

  // Apply filters and sorting
  useEffect(() => {
    let results = [...savedProperties];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        (property) =>
          property.title.toLowerCase().includes(term) ||
          property.address.toLowerCase().includes(term) ||
          property.propertyType.toLowerCase().includes(term)
      );
    }

    // Apply property type filter
    if (filterType !== "all") {
      results = results.filter(
        (property) => property.listingType === filterType
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-high":
        results.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        results.sort((a, b) => a.price - b.price);
        break;
      case "newest":
      default:
        // Assuming createdAt is a timestamp
        results.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
    }

    setFilteredProperties(results);
    setTotalPages(Math.ceil(results.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [savedProperties, searchTerm, sortBy, filterType]);

  const handleToggleFavorite = async (propertyId: string) => {
    try {
      if (!user || !user.uid) {
        toast({
          title: "Error",
          description: "You must be logged in to manage favorites",
          variant: "destructive",
        });
        return;
      }

      // Filter out the property to remove
      const updatedSavedProperties = user.savedProperties.filter(
        (id) => id !== propertyId
      );

      // Update local state
      setUser({
        ...user,
        savedProperties: updatedSavedProperties,
      });

      // Update Firebase
      const userRef = doc(fireDataBase, user.userType, user.uid);
      await updateDoc(userRef, {
        savedProperties: updatedSavedProperties,
      });

      toast({
        title: "Success",
        description: "Property removed from favorites",
      });
    } catch (error) {
      console.error("Error removing property from favorites:", error);
      // Revert local state if Firebase update fails
      setUser({
        ...user,
        savedProperties: [...user.savedProperties],
      });
      toast({
        title: "Error",
        description: "Failed to remove property from favorites",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    if (!user || !user.uid || !user.savedProperties?.length) return;

    try {
      // Update local state
      setUser({
        ...user,
        savedProperties: [],
      });

      // Update Firebase
      const userRef = doc(fireDataBase, user.userType, user.uid);
      await updateDoc(userRef, {
        savedProperties: [],
      });

      toast({
        title: "Success",
        description: "All saved properties have been removed",
      });
    } catch (error) {
      console.error("Error clearing saved properties:", error);
      // Revert local state if Firebase update fails
      setUser({
        ...user,
        savedProperties: [...user.savedProperties],
      });
      toast({
        title: "Error",
        description: "Failed to clear saved properties",
        variant: "destructive",
      });
    }
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProperties.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check if a property is in favorites
  const isPropertyFavorite = (propertyId: string) => {
    return user?.savedProperties?.includes(propertyId) || false;
  };

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="w-9 h-9"
        >
          <ChevronLeft className="w-4 h-4" />
          <ChevronLeft className="-ml-2 w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pageNumbers.map((number) => (
          <Button
            key={number}
            variant={currentPage === number ? "default" : "outline"}
            className={
              currentPage === number
                ? "bg-realtyplus hover:bg-realtyplus-dark"
                : ""
            }
            size="sm"
            onClick={() => handlePageChange(number)}
          >
            {number}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-9 h-9"
        >
          <ChevronRight className="w-4 h-4" />
          <ChevronRight className="-ml-2 w-4 h-4" />
        </Button>
      </div>
    );
  };

  // Custom list view for properties
  const ListView = ({ property }) => (
    <div className="bg-white hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-200 rounded-xl overflow-hidden transition-all">
      <div className="flex md:flex-row flex-col">
        <div className="relative md:w-1/4">
          <img
            src={
              property.images[property.coverPhotoIndex] ||
              "/placeholder-property.jpg"
            }
            alt={property.title}
            className="w-full h-48 md:h-full object-cover"
          />
          <Badge className="top-3 left-3 absolute bg-realtyplus">
            {property.listingType === "rent" ? "For Rent" : "For Sale"}
          </Badge>
        </div>

        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold hover:text-realtyplus text-lg">
              {property.title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(property.uid);
              }}
            >
              <Heart className="fill-realtyplus w-5 h-5 text-realtyplus" />
            </Button>
          </div>

          <div className="flex items-center mt-1 text-gray-600 text-sm">
            <MapPin className="mr-1 w-4 h-4" />
            <span>{property.address}</span>
          </div>

          <div className="mt-3 font-bold text-realtyplus text-xl">
            K {property.price.toLocaleString()}
            {property.listingType === "rent" && (
              <span className="font-normal text-gray-600 text-sm">/month</span>
            )}
          </div>

          <div className="flex flex-wrap gap-6 mt-3 text-gray-700 text-sm">
            {property.bedrooms > 0 && (
              <div className="flex items-center">
                <Bed className="mr-1 w-4 h-4" />
                <span>
                  {property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}
                </span>
              </div>
            )}

            {property.bathrooms > 0 && (
              <div className="flex items-center">
                <Bath className="mr-1 w-4 h-4" />
                <span>
                  {property.bathrooms}{" "}
                  {property.bathrooms === 1 ? "Bath" : "Baths"}
                </span>
              </div>
            )}

            <div className="flex items-center">
              <Home className="mr-1 w-4 h-4" />
              <span>{property.propertyType}</span>
            </div>
          </div>

          {property.description && (
            <p className="mt-3 text-gray-600 text-sm line-clamp-2">
              {property.description}
            </p>
          )}

          <div className="flex items-center mt-3 pt-3 border-gray-100 border-t text-gray-500 text-xs">
            <Calendar className="mr-1 w-3 h-3" />
            <span>
              Saved{" "}
              {new Date(
                property.createdAt?.toDate?.() || Date.now()
              ).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="mx-auto px-4 py-16 container">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </>
    );
  }
  if (!user) {
    return (
      <>
        <Header />
        <div className="mx-auto px-4 py-16 container">Kindly log in first</div>
      </>
    );
  }
  return (
    <>
      <Header />
      <div className="mx-auto px-4 py-8 container">
        <div className="flex md:flex-row flex-col justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="font-bold text-gray-900 text-2xl md:text-3xl">
              Saved Properties
            </h1>
            <p className="mt-1 text-gray-600">
              {filteredProperties.length}{" "}
              {filteredProperties.length === 1 ? "property" : "properties"}{" "}
              saved
            </p>
          </div>

          {savedProperties.length > 0 && (
            <Button
              variant="outline"
              className="hover:bg-red-50 mt-4 md:mt-0 border-red-200 text-red-600 hover:text-red-700"
              onClick={handleClearAll}
            >
              <Trash2 className="mr-2 w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>

        {!savedProperties.length ? (
          <div className="bg-gray-50 py-16 rounded-xl text-center">
            <div className="mb-4 text-gray-300">
              <Heart className="mx-auto w-20 h-20" />
            </div>
            <h2 className="mb-2 font-semibold text-xl">
              No saved properties yet
            </h2>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              Start saving properties you're interested in by clicking the heart
              icon on any property listing
            </p>
            <Button
              onClick={() => navigate("/properties")}
              className="bg-realtyplus hover:bg-realtyplus-dark text-white"
            >
              Browse Properties
            </Button>
          </div>
        ) : (
          <>
            {/* Filters and Controls */}
            <div className="bg-white mb-6 p-4 border border-gray-200 rounded-xl">
              <div className="flex md:flex-row flex-col gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2 transform" />
                    <Input
                      type="text"
                      placeholder="Search saved properties..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex sm:flex-row flex-col gap-3">
                  <div className="w-full sm:w-40">
                    <Select
                      value={filterType}
                      onValueChange={(value: any) => setFilterType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Property Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Properties</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-40">
                    <Select
                      value={sortBy}
                      onValueChange={(value: any) => setSortBy(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price-high">
                          Price: High to Low
                        </SelectItem>
                        <SelectItem value="price-low">
                          Price: Low to High
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      className={
                        viewMode === "grid"
                          ? "bg-realtyplus hover:bg-realtyplus-dark"
                          : ""
                      }
                      size="icon"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      className={
                        viewMode === "list"
                          ? "bg-realtyplus hover:bg-realtyplus-dark"
                          : ""
                      }
                      size="icon"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results count */}
            {filteredProperties.length === 0 ? (
              <div className="bg-gray-50 py-16 rounded-xl text-center">
                <Search className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                <h2 className="mb-2 font-semibold text-xl">
                  No matching properties found
                </h2>
                <p className="mb-6 text-gray-600">
                  Try adjusting your search or filters to find what you're
                  looking for
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setSortBy("newest");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Property Grid/List */}
                {viewMode === "grid" ? (
                  <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {getCurrentPageItems().map((property) => (
                      <PropertyCard
                        key={property.uid}
                        id={property.uid}
                        title={property.title}
                        price={property.price}
                        location={property.address}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        area={property.area || 0}
                        imageUrl={
                          property.images[property.coverPhotoIndex] ||
                          "/placeholder-property.jpg"
                        }
                        propertyType={property.propertyType}
                        isFeatured={property.isFeatured || false}
                        isFurnished={property.isFurnished || false}
                        isFavorite={() => isPropertyFavorite(property.uid)}
                        yearBuilt={
                          property.yearBuilt || new Date().getFullYear()
                        }
                        onFavorite={handleToggleFavorite}
                        onClick={() => navigate(`/property/${property.uid}`)}
                        viewCount={property.viewCount || 0}
                        isActive={true}
                        status="active"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {getCurrentPageItems().map((property) => (
                      <div
                        key={property.uid}
                        onClick={() => navigate(`/property/${property.uid}`)}
                        className="cursor-pointer"
                      >
                        <ListView property={property} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                <Pagination />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SavedPropertiesPage;
