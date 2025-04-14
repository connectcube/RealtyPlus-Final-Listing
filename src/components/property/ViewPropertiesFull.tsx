import { useCallback, useEffect, useMemo, memo, useState } from "react";
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
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import debounce from "lodash/debounce";
import { FixedSizeGrid } from "react-window";
import { ErrorBoundary } from "react-error-boundary";

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
    yearBuilt,
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
    />
  )
);

MemoizedPropertyCard.displayName = "MemoizedPropertyCard";

// Query Cache Implementation
const queryCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const createQueryKey = (
  propertyType: string,
  priceRange: string,
  sortBy: string,
  searchTerm: string,
  lastVisible: DocumentData | null
) => {
  return `${propertyType}-${priceRange}-${sortBy}-${searchTerm}-${
    lastVisible?.id || ""
  }`;
};

const getCachedQuery = (key: string) => {
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedQuery = (key: string, data: any) => {
  queryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

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

// ViewPropertiesFull.tsx
export default function ViewCategorizedProperties() {
  const ITEMS_PER_PAGE = 12;
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const search = searchParams.get("search");
  const initialPriceRange = searchParams.get("priceRange");
  // Initialize states with URL parameters
  const [properties, setProperties] = useState<LISTING[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Filters with URL parameters
  const [priceRange, setPriceRange] = useState(initialPriceRange || "all");
  const [propertyType, setPropertyType] = useState(type || "all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState(search || "");

  // Modified fetchProperties to include search term in query
  const fetchProperties = useCallback(
    async (isNewQuery: boolean = true) => {
      try {
        setLoading(true);
        setError(null);

        const queryConstraints = [];

        // Basic filters
        if (propertyType !== "all") {
          queryConstraints.push(where("propertyCategory", "==", propertyType));
        }

        if (priceRange !== "all") {
          const [min, max] = priceRange.split("-").map(Number);
          queryConstraints.push(where("price", ">=", min));
          if (max) queryConstraints.push(where("price", "<=", max));
        }

        // Advanced filters from URL params
        const params = Object.fromEntries(searchParams.entries());

        if (params.bedrooms) {
          queryConstraints.push(
            where("bedrooms", ">=", parseInt(params.bedrooms))
          );
        }

        if (params.bathrooms) {
          queryConstraints.push(
            where("bathrooms", ">=", parseInt(params.bathrooms))
          );
        }

        if (params.garage) {
          queryConstraints.push(where("garage", ">=", parseInt(params.garage)));
        }

        if (params.furnishingStatus) {
          queryConstraints.push(
            where("furnishingStatus", "==", params.furnishingStatus)
          );
        }

        if (params.yearBuilt) {
          queryConstraints.push(where("yearBuilt", ">=", params.yearBuilt));
        }

        if (params.amenities) {
          const amenitiesList = params.amenities.split(",");
          // Using array-contains-any to match any of the selected amenities
          queryConstraints.push(
            where("amenities", "array-contains-any", amenitiesList)
          );
        }

        // Search term filter
        if (searchTerm) {
          queryConstraints.push(
            where("searchKeywords", "array-contains", searchTerm.toLowerCase())
          );
        }

        // Sorting
        queryConstraints.push(
          sortBy === "price-asc"
            ? orderBy("price", "asc")
            : sortBy === "price-desc"
            ? orderBy("price", "desc")
            : orderBy("createdAt", "desc")
        );

        // Pagination
        queryConstraints.push(limit(ITEMS_PER_PAGE));
        if (!isNewQuery && lastVisible) {
          queryConstraints.push(startAfter(lastVisible));
        }

        const q = query(
          collection(fireDataBase, "listings"),
          ...queryConstraints
        );
        const querySnapshot = await getDocs(q);

        // Rest of the existing code...
      } catch (err) {
        // Error handling...
      }
    },
    [
      propertyType,
      priceRange,
      sortBy,
      lastVisible,
      properties,
      searchTerm,
      searchParams,
    ]
  );

  // Update effect to refetch when URL parameters change
  useEffect(() => {
    fetchProperties(true);
  }, [searchParams, propertyType, priceRange, sortBy, searchTerm]);

  const filteredProperties = useMemo(() => {
    const lowercasedSearch = searchTerm.toLowerCase();
    return properties.filter(
      (property) =>
        property.title.toLowerCase().includes(lowercasedSearch) ||
        property.description.toLowerCase().includes(lowercasedSearch)
    );
  }, [properties, searchTerm]);

  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {type ? `${type} Properties` : "All Properties"}
          </h1>

          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Search properties..."
              onChange={handleSearchChange}
              className="w-full"
            />

            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="newDevelopment">New Development</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-1000000">Under 1M</SelectItem>
                <SelectItem value="1000000-2000000">1M - 2M</SelectItem>
                <SelectItem value="2000000-3000000">2M - 3M</SelectItem>
                <SelectItem value="3000000-5000000">3M - 5M</SelectItem>
                <SelectItem value="5000000-10000000">5M - 10M</SelectItem>
                <SelectItem value="10000000-999999999">Over 10M</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => fetchProperties(true)}
          >
            {loading && properties.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-realtyplus" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <MemoizedPropertyCard
                      key={property.uid}
                      id={property.uid}
                      title={property.title}
                      price={property.price}
                      location={`${property.neighborhood}, ${property.city}`}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      area={property.area}
                      imageUrl={property.coverPhoto}
                      propertyType={property.propertyType}
                      isFeatured={property.isFeatured}
                      isFurnished={property.isFurnished}
                      yearBuilt={property.yearBuilt}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      onClick={() => fetchProperties(false)}
                      disabled={loading}
                      className="bg-realtyplus hover:bg-realtyplus-dark"
                    >
                      {loading && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Load More Properties
                    </Button>
                  </div>
                )}

                {filteredProperties.length === 0 && (
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
