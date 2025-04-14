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
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  imageUrl: string;
  propertyType: "standalone" | "semi-detached" | "apartment" | "other";
  isFeatured: boolean;
  isFurnished: boolean;
  yearBuilt: number;
}

interface FeaturedPropertiesProps {
  properties?: Property[];
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

const FeaturedProperties = ({
  title = "Featured Properties",
  subtitle = "Discover our handpicked selection of premium properties across Zambia",
}: FeaturedPropertiesProps) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const listingsRef = collection(fireDataBase, "listings");
        const q = query(listingsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedProperties: Property[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Property, "id">),
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
    if (activeTab === "featured") return property.isFeatured;
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

  const handleFavorite = (id: string) => {
    // Handle favorite functionality
    console.log(`Property ${id} added to favorites`);
  };

  const handlePropertyClick = (id: string) => {
    // Navigate to property details page
    console.log(`Navigating to property ${id} details`);
  };

  return (
    <section id="featured-properties" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Tabs
            defaultValue="all"
            className="w-full max-w-lg"
            onValueChange={setActiveTab}
          >
            <TabsList className="flex justify-between w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="standalone">Houses</TabsTrigger>
              <TabsTrigger value="apartment">Apartments</TabsTrigger>
              <TabsTrigger value="semi-detached" className="w-fit">
                Semi-Detached
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="h-[380px] bg-white">
                <CardContent className="p-0 h-full flex items-center justify-center">
                  <div className="animate-pulse w-full h-full">
                    <div className="bg-gray-200 h-48 w-full"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
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
                key={property.id}
                id={property.id}
                title={property.title}
                price={property.price}
                location={property.location}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                imageUrl={property.imageUrl}
                propertyType={property.propertyType}
                isFeatured={property.isFeatured}
                isFurnished={property.isFurnished}
                yearBuilt={property.yearBuilt}
                onFavorite={handleFavorite}
                onClick={handlePropertyClick}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center bg-white">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">
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
