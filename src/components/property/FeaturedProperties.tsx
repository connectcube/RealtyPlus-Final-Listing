import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Pagination } from "../ui/pagination";
import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { ChevronLeft, ChevronRight, Grid3X3, List } from "lucide-react";
import PropertyCard from "./PropertyCard";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { useZustand } from "@/lib/zustand";
import { LISTING } from "@/lib/typeDefinitions";

interface FeaturedPropertiesProps {
  properties?: LISTING[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

const FeaturedProperties = ({
  title = "Featured Properties",
  subtitle = "Discover our handpicked selection of premium properties across Zambia",
}: FeaturedPropertiesProps) => {
  const { user, setUser } = useZustand();
  const [properties, setProperties] = useState<LISTING[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const listingsRef = collection(fireDataBase, "listings");
        const q = query(
          listingsRef,
          where("isFeatured", "==", true),
          orderBy("createdAt", "desc"),
          limit(12)
        );
        const querySnapshot = await getDocs(q);

        const fetchedProperties: LISTING[] = querySnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...(doc.data() as Omit<LISTING, "id">),
        }));

        setProperties(fetchedProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);
  // Filter properties based on active tab
  const filteredProperties = properties.filter((property) => {
    if (activeTab === "all") return true;
    if (activeTab === "standalone")
      return property.propertyType === "standalone";
    if (activeTab === "apartment") return property.propertyType === "apartment";
    if (activeTab === "semi-detached")
      return property.propertyType === "semi-detached";
    return true;
  });

  // Pagination logic
  const propertiesPerPage = 6;
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredProperties.slice(
    indexOfFirstProperty,
    indexOfLastProperty
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the properties section
    window.scrollTo({
      top: document.getElementById("featured-properties")?.offsetTop || 0,
      behavior: "smooth",
    });
  };
  const handlePropertyClick = (id: string) => {
    // Navigate to property details page
    console.log(`Navigating to property ${id} details`);
  };
  const handleFavClick = (propertyId: string) => {
    try {
      if (!user) {
        console.log("User not logged in");
        return;
      }

      // Check if property is already saved
      const isAlreadySaved = user.savedProperties?.includes(propertyId);

      let updatedSavedProperties;
      if (isAlreadySaved) {
        // Remove from favorites
        updatedSavedProperties =
          user.savedProperties?.filter((savedId) => savedId !== propertyId) ||
          [];
      } else {
        // Add to favorites
        updatedSavedProperties = [...(user.savedProperties || []), propertyId];
      }

      // Update local state
      setUser({
        ...user,
        savedProperties: updatedSavedProperties,
      });

      // If you're using Firebase, update the database
      const userRef = doc(fireDataBase, user.userType, user.uid);
      updateDoc(userRef, {
        savedProperties: updatedSavedProperties,
      });
    } catch (error) {
      console.error("Error handling favorite:", error);
    }
  };

  // And the isFavorite check would be simpler too:
  const handleCheckFav = (propertyId: string) => {
    if (!user || !user.savedProperties) return false;
    return user.savedProperties.includes(propertyId);
  };
  return (
    <section id="featured-properties" className="bg-gray-50 py-12">
      <div className="mx-auto px-4 container">
        <div className="mb-10 text-center">
          <h2 className="mb-3 font-bold text-gray-900 text-3xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-gray-600">{subtitle}</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Tabs
            defaultValue="all"
            className="w-full max-w-lg"
            onValueChange={setActiveTab}
          >
            <TabsList className="flex justify-between w-full">
              <TabsTrigger value="all">All Properties</TabsTrigger>
              <TabsTrigger value="standalone">Houses</TabsTrigger>
              <TabsTrigger value="apartment">Apartments</TabsTrigger>
              <TabsTrigger value="semi-detached">Semi-Detached</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-white h-[380px]">
                <CardContent className="flex justify-center items-center p-0 h-full">
                  <div className="w-full h-full animate-pulse">
                    <div className="bg-gray-200 w-full h-48"></div>
                    <div className="space-y-3 p-4">
                      <div className="bg-gray-200 rounded w-3/4 h-4"></div>
                      <div className="bg-gray-200 rounded w-1/2 h-4"></div>
                      <div className="bg-gray-200 rounded w-full h-4"></div>
                      <div className="bg-gray-200 rounded w-full h-4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : currentProperties.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {currentProperties.map((property) => (
              <PropertyCard
                key={property.uid}
                id={property.uid}
                title={property.title}
                price={property.price}
                location={property.address}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                imageUrl={property.images[property.coverPhotoIndex]}
                propertyType={property.propertyType}
                isFeatured={property.isFeatured}
                isFurnished={property.isFurnished}
                yearBuilt={property.yearBuilt}
                onFavorite={handleFavClick}
                isFavorite={() => handleCheckFav(property.uid)}
                onClick={handlePropertyClick}
                viewCount={property.viewCount}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-white p-8 text-center">
            <CardContent>
              <h3 className="mb-2 font-semibold text-xl">
                No properties found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or check back later for new
                listings.
              </p>
            </CardContent>
          </Card>
        )}

        {filteredProperties.length > propertiesPerPage && (
          <div className="mt-10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  // Show limited page numbers with ellipsis for better UX
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return <PaginationItem key={page}>...</PaginationItem>;
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProperties;
