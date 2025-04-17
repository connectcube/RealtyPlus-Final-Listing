import React, { useEffect, useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import SearchFilters from "../search/SearchFilters";
import PropertyCard from "./PropertyCard";
import { Button } from "../ui/button";
import { Grid, LayoutGrid, List, MapPin } from "lucide-react";
import { fireDataBase } from "@/lib/firebase";
import {
  collection,
  doc,
  DocumentData,
  getDocs,
  Query,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { LISTING } from "@/lib/typeDefinitions";
import { useZustand } from "@/lib/zustand";
import { LoadingSpinner } from "../globalScreens/Loader";
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
const BuyProperties = () => {
  const { user, setUser } = useZustand();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [properties, setProperties] = useState<LISTING[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<LISTING[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
      if (filters.province && filters.province !== "all") {
        queryConstraints.push(where("province", "==", filters.province));
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <SearchFilters
          onSearch={handleSearch}
          setFilters={setFilters}
          filters={filters}
          isLoading={loading}
          type="sale"
          className="mb-8"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center my-6">
          <div className="text-gray-600">
            <p>
              <span className="font-semibold">{filteredProperties.length}</span>{" "}
              properties found
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("grid")}
              className={view === "grid" ? "bg-gray-100" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("list")}
              className={view === "list" ? "bg-gray-100" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {properties.map((property) => (
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
                onClick={() => console.log(property.uid)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
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
                onClick={() => console.log(property.uid)}
              />
            ))}
          </div>
        )}

        {!loading && properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No properties found matching your criteria.
            </p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => {
                setProperties([]);
                // You might want to trigger a reset in SearchFilters component
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BuyProperties;
