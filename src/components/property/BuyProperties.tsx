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
import { FEATURES, LISTING, SearchFiltersProps } from "@/lib/typeDefinitions";
import { useZustand } from "@/lib/zustand";
import { LoadingSpinner } from "../globalScreens/Loader";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
const BuyProperties = () => {
  const { user, setUser } = useZustand();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [properties, setProperties] = useState<LISTING[]>([]);
  const [error, setError] = useState<string | null>(null);
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
        toast.error("Please log in to save properties.");
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

  useEffect(() => {
    handleSearch(filters as SearchFiltersProps);
  }, [filters]);
  const handleCheckFav = (propertyId: string) => {
    if (!user || !user.savedProperties) return false;
    return user.savedProperties.includes(propertyId);
  };
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Header />
      <main className="flex-grow mx-auto px-4 py-8 container">
        <SearchFilters
          onSearch={handleSearch}
          setFilters={setFilters}
          filters={filters}
          isLoading={loading}
          type="sale"
          className="mb-8"
        />

        {error && (
          <div className="bg-red-50 mb-4 px-4 py-3 border border-red-200 rounded text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center my-6">
          <div className="text-gray-600">
            <p>
              <span className="font-semibold">{properties.length}</span>{" "}
              propertie(s) found
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("grid")}
              className={view === "grid" ? "bg-gray-100" : ""}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("list")}
              className={view === "list" ? "bg-gray-100" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : view === "grid" ? (
          <div className="gap-4 md:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="py-12 text-center">
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
