import { useCallback, useEffect, memo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  doc,
  updateDoc,
} from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import PropertyCard from "../property/PropertyCard";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Header from "../layout/Header";
import { LISTING } from "@/lib/typeDefinitions";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import SearchFilters from "../search/SearchFilters";
interface SearchFiltersProps {
  address: string;
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
  propertyCategory: string;
}
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
    isFavorite,
    yearBuilt,
    onFavorite,
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
      isFavorite={isFavorite}
      yearBuilt={yearBuilt}
      onFavorite={onFavorite}
    />
  )
);

MemoizedPropertyCard.displayName = "MemoizedPropertyCard";

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="text-center py-12">
    <h3 className="text-xl font-semibold text-gray-700">
      Something went wrong loading properties
    </h3>
    <p className="text-gray-500 mt-2">{error.message}</p>
    <Button onClick={resetErrorBoundary} className="mt-4">
      Try again
    </Button>
  </div>
);

// ViewCategorizedProperties.tsx
export default function ViewCategorizedProperties() {
  const [properties, setProperties] = useState<LISTING[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFiltersProps>({
    address: "",
    province: "",
    priceRange: [0, 1000000],
    propertyType: "all",
    furnishingStatus: "all",
    yearBuilt: "",
    bedrooms: "",
    bathrooms: "",
    garage: "",
    amenities: [],
    listingType: "sale",
    propertyCategory: "all",
  });

  const handleSearch = async (filters: SearchFiltersProps) => {
    try {
      console.log("Filters from handle search:", filters);
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

      // Add property category filter
      if (filters.propertyCategory && filters.propertyCategory !== "all") {
        queryConstraints.push(
          where("propertyCategory", "==", filters.propertyCategory)
        );
      }

      // Add bedrooms filter
      if (filters.bedrooms) {
        queryConstraints.push(
          where("bedrooms", ">=", parseInt(filters.bedrooms))
        );
      }

      // Add bathrooms filter
      if (filters.bathrooms) {
        queryConstraints.push(
          where("bathrooms", ">=", parseInt(filters.bathrooms))
        );
      }

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

        // Amenities filter
        /*if (filters.amenities.length > 0) {
          const propertyAmenities = property.amenities || [];
          if (
            !filters.amenities.every((amenity) =>
              propertyAmenities.includes(amenity)
            )
          ) {
            return false;
          }
        }*/

        return true;
      });

      setProperties(filteredProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {filters?.propertyCategory !== "all"
              ? `${filters?.propertyCategory} Properties`
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
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-realtyplus" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <MemoizedPropertyCard
                      key={property.uid}
                      id={property.uid}
                      title={property.title}
                      price={property.price}
                      location={`${property.neighborhood}, ${property.city}`}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      area={property.area}
                      imageUrl={property.images[property.coverPhotoIndex]}
                      propertyType={property.propertyType}
                      isFeatured={property.isFeatured}
                      isFurnished={property.isFurnished}
                      isFavorite={() => true}
                      yearBuilt={property.yearBuilt}
                      onFavorite={() => console.log("Favorite clicked")}
                    />
                  ))}
                </div>

                {properties.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-700">
                      No properties found
                    </h3>
                    <p className="text-gray-500 mt-2">
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
