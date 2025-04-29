import { memo, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import PropertyCard from "../property/PropertyCard";
import { Button } from "../ui/button";
import Header from "../layout/Header";
import { FEATURES, LISTING, SearchFiltersProps } from "@/lib/typeDefinitions";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import SearchFilters from "../search/SearchFilters";
import { useZustand } from "@/lib/zustand";
import { LoadingSpinner } from "../globalScreens/Loader";
import { useSearchParams } from "react-router-dom";

// Memoized Property Card Component
const MemoizedPropertyCard = memo(
  ({
    id,
    title,
    price,
    location,
    bedrooms,
    bathrooms,
    area,
    imageUrl,
    propertyType,
    isFeatured,
    isFurnished,
    onFavorite,
    isFavorite,
    yearBuilt,
    viewCount,
  }: any) => (
    <PropertyCard
      id={id}
      title={title}
      price={price}
      location={location}
      bedrooms={bedrooms}
      bathrooms={bathrooms}
      area={area}
      imageUrl={imageUrl}
      propertyType={propertyType}
      isFeatured={isFeatured}
      isFurnished={isFurnished}
      yearBuilt={yearBuilt}
      onFavorite={onFavorite}
      isFavorite={isFavorite}
      viewCount={viewCount}
    />
  )
);

MemoizedPropertyCard.displayName = "MemoizedPropertyCard";

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="py-12 text-center">
    <h3 className="font-semibold text-gray-700 text-xl">
      Something went wrong loading properties
    </h3>
    <p className="mt-2 text-gray-500">{error.message}</p>
    <Button onClick={resetErrorBoundary} className="mt-4">
      Try again
    </Button>
  </div>
);

// ViewCategorizedProperties.tsx
export default function ViewCategorizedProperties() {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("propertyCategory");
  const { user, setUser } = useZustand();
  const [properties, setProperties] = useState<LISTING[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersProps>({
    address: "",
    province: "",
    priceRange: [0, 1000000],
    propertyType: "all",
    isFurnished: null,
    yearBuilt: 0,
    bedrooms: 0,
    bathrooms: 0,
    garage: 0,
    amenities: [],
    listingType: "sale",
    propertyCategory: categoryFromUrl || "all",
  });
  // Add these state variables at the top of the component with other states
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(9); // 9 items per page (3x3 grid)
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      propertyCategory: categoryFromUrl || "all",
    }));
    handleSearch(filters as SearchFiltersProps);
  }, [categoryFromUrl, filters]);
  const handleSearch = async (filters: SearchFiltersProps) => {
    try {
      setLoading(true);
      setFilters(filters);

      const listingsRef = collection(fireDataBase, "listings");
      let queryConstraints: any[] = [];

      // Base query
      queryConstraints.push(where("listingType", "==", filters.listingType));

      // Add price range filter
      if (filters.priceRange[0] && filters.priceRange[1]) {
        queryConstraints.push(where("price", ">=", filters.priceRange[0]));
        queryConstraints.push(where("price", "<=", filters.priceRange[1]));
      }

      // Add property type filter
      if (filters.propertyType && filters.propertyType !== "all") {
        queryConstraints.push(
          where("propertyType", "==", filters.propertyType)
        );
      }
      if (filters.province && filters.province !== "all") {
        queryConstraints.push(where("province", "==", filters.province));
      }
      // Add property category filter
      if (filters.propertyCategory && filters.propertyCategory !== "all") {
        queryConstraints.push(
          where("propertyCategory", "==", filters.propertyCategory)
        );
      }

      if (filters.amenities.length > 0) {
        const featureMapping: Record<string, keyof FEATURES> = {
          swimmingPool: "swimmingPool",
          garden: "garden",
          securitySystem: "securitySystem",
          backupPower: "backupPower",
          borehole: "borehole",
          airConditioning: "airConditioning",
          servantsQuarters: "servantsQuarters",
          fittedKitchen: "fittedKitchen",
          parking: "parking",
        };

        filters.amenities.forEach((amenity) => {
          if (amenity in featureMapping) {
            queryConstraints.push(
              where(`features.${featureMapping[amenity]}`, "==", true)
            );
          }
        });
      }
      if (filters.yearBuilt) {
        queryConstraints.push(where("yearBuilt", ">=", filters.yearBuilt));
      }
      if (filters.bedrooms && filters.bedrooms > 0) {
        queryConstraints.push(where("bedrooms", ">=", filters.bedrooms));
      }

      // Add bathrooms filter
      if (filters.bathrooms && filters.bathrooms > 0) {
        queryConstraints.push(where("bathrooms", ">=", filters.bathrooms));
      }
      // Add garage filter
      if (filters.garage && filters.garage > 0) {
        queryConstraints.push(where("garageSpaces", ">=", filters.garage));
      }
      // Add furnishing status filter
      if (filters.isFurnished !== null) {
        queryConstraints.push(where("isFurnished", "==", filters.isFurnished));
      }

      console.log(queryConstraints);
      // Execute query
      const q = query(listingsRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      // Process results
      const fetchedProperties = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as LISTING[];

      // Apply text-based filters client-side
      const filteredProperties = fetchedProperties.filter((property) => {
        // Location filter
        if (
          filters.address &&
          !property.address
            .toLowerCase()
            .includes(filters.address.toLowerCase())
        ) {
          return false;
        }
        return true;
      });

      setTotalPages(Math.ceil(filteredProperties.length / propertiesPerPage));
      // Reset to first page when search filters change
      setCurrentPage(1);
      setProperties(filteredProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };
  const getCurrentPageProperties = () => {
    const indexOfLastProperty = currentPage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    return properties.slice(indexOfFirstProperty, indexOfLastProperty);
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

  const handleCheckFav = (propertyId: string) => {
    if (!user || !user.savedProperties) return false;
    return user.savedProperties.includes(propertyId);
  };
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="mx-auto px-4 py-8 container">
        <div className="mb-8">
          <h1 className="mb-4 font-bold text-gray-900 text-3xl capitalize">
            {filters?.propertyType !== "all"
              ? `${filters?.propertyType} Properties`
              : "All Properties"}
          </h1>

          <SearchFilters
            onSearch={handleSearch}
            setFilters={setFilters}
            filters={filters}
            isLoading={loading}
            type="sale"
            className="mb-8"
          />

          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => handleSearch(filters as SearchFiltersProps)}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <p className="mb-4 text-gray-600">
                  <span className="font-semibold">{properties.length}</span>{" "}
                  propertie(s) found
                </p>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {getCurrentPageProperties().map((property) => (
                    <MemoizedPropertyCard
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
                      onClick={() => console.log(property.uid)}
                      viewCount={property.viewCount}
                    />
                  ))}
                </div>

                {properties.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                )}

                {properties.length === 0 && (
                  <div className="py-12 text-center">
                    <h3 className="font-semibold text-gray-700 text-xl">
                      No properties found
                    </h3>
                    <p className="mt-2 text-gray-500">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                )}
              </>
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        className="px-4 py-2"
      >
        Previous
      </Button>

      <div className="flex items-center gap-2">
        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index + 1}
            onClick={() => onPageChange(index + 1)}
            variant={currentPage === index + 1 ? "default" : "outline"}
            className="px-4 py-2"
          >
            {index + 1}
          </Button>
        ))}
      </div>

      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
        className="px-4 py-2"
      >
        Next
      </Button>
    </div>
  );
};
