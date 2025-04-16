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

// Mock properties for sale data
const mockPropertiesForSale = [
  {
    id: "sale-1",
    title: "Modern 3 Bedroom House in Kabulonga",
    price: 2500000,
    location: "Kabulonga, Lusaka",
    bedrooms: 3,
    bathrooms: 2,
    area: 240,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    propertyType: "standalone",
    isFeatured: true,
    isFurnished: true,
    yearBuilt: 2020,
  },
  {
    id: "sale-2",
    title: "Luxury Apartment in Woodlands",
    price: 1800000,
    location: "Woodlands, Lusaka",
    bedrooms: 2,
    bathrooms: 2,
    area: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    propertyType: "apartment",
    isFeatured: false,
    isFurnished: true,
    yearBuilt: 2021,
  },
  {
    id: "sale-3",
    title: "Family Home in Roma",
    price: 3200000,
    location: "Roma, Lusaka",
    bedrooms: 4,
    bathrooms: 3,
    area: 320,
    imageUrl:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    propertyType: "standalone",
    isFeatured: true,
    isFurnished: false,
    yearBuilt: 2019,
  },
  {
    id: "sale-4",
    title: "Semi-Detached House in Olympia",
    price: 1950000,
    location: "Olympia, Lusaka",
    bedrooms: 3,
    bathrooms: 2,
    area: 210,
    imageUrl:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    propertyType: "semi-detached",
    isFeatured: false,
    isFurnished: true,
    yearBuilt: 2022,
  },
  {
    id: "sale-5",
    title: "Executive 5 Bedroom House with Pool",
    price: 4500000,
    location: "Ibex Hill, Lusaka",
    bedrooms: 5,
    bathrooms: 4,
    area: 450,
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    propertyType: "standalone",
    isFeatured: true,
    isFurnished: true,
    yearBuilt: 2021,
  },
  {
    id: "sale-6",
    title: "Commercial Property in Cairo Road",
    price: 8500000,
    location: "Cairo Road, Lusaka",
    bedrooms: 0,
    bathrooms: 2,
    area: 500,
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
    propertyType: "commercial",
    isFeatured: false,
    isFurnished: false,
    yearBuilt: 2018,
  },
];

const BuyProperties = () => {
  const { user, setUser } = useZustand();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [properties, setProperties] = useState<LISTING[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<LISTING[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch of properties
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const listingsRef = collection(fireDataBase, "listings");
      const q = query(
        listingsRef,
        where("listingType", "==", "sale"),
        where("status", "==", "active")
      );

      const querySnapshot = await getDocs(q);
      const propertyList: LISTING[] = [];

      querySnapshot.forEach((doc) => {
        propertyList.push({
          uid: doc.id,
          ...(doc.data() as LISTING),
        });
      });

      setProperties(propertyList);
      setFilteredProperties(propertyList);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const listingsRef = collection(fireDataBase, "listings");
      let q: Query<DocumentData> = query(
        listingsRef,
        where("listingType", "==", "sale"),
        where("status", "==", "active")
      );

      // Build query based on filters
      if (filters.province) {
        q = query(q, where("province", "==", filters.province.toLowerCase()));
      }

      if (filters.propertyType) {
        q = query(q, where("propertyType", "==", filters.propertyType));
      }

      if (filters.propertyCategory) {
        q = query(q, where("propertyCategory", "==", filters.propertyCategory));
      }

      const querySnapshot = await getDocs(q);
      let filteredResults = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...(doc.data() as LISTING),
      }));

      // Client-side filtering for remaining filters
      filteredResults = filteredResults.filter((property) => {
        // Price range filter
        if (filters.priceRange[0] && filters.priceRange[1]) {
          const minPrice = parseInt(filters.priceRange[0]);
          const maxPrice = parseInt(filters.priceRange[1]);
          if (
            parseInt(property.price) < minPrice ||
            parseInt(property.price) > maxPrice
          ) {
            return false;
          }
        }

        // Location/Address filter (case-insensitive)
        if (
          filters.location &&
          !property.city.toLowerCase().includes(filters.location.toLowerCase())
        ) {
          return false;
        }

        if (
          filters.address &&
          !property.address
            .toLowerCase()
            .includes(filters.address.toLowerCase())
        ) {
          return false;
        }

        // Bedrooms filter
        if (
          filters.bedrooms &&
          parseInt(property.bedrooms) < parseInt(filters.bedrooms)
        ) {
          return false;
        }

        // Bathrooms filter
        if (
          filters.bathrooms &&
          parseInt(property.bathrooms) < parseInt(filters.bathrooms)
        ) {
          return false;
        }

        // Garage filter
        if (
          filters.garage &&
          parseInt(property.garageSpaces) < parseInt(filters.garage)
        ) {
          return false;
        }

        // Year built filter
        if (
          filters.yearBuilt &&
          parseInt(property.yearBuilt) < parseInt(filters.yearBuilt)
        ) {
          return false;
        }

        // Furnishing status filter
        if (filters.furnishingStatus) {
          if (
            filters.furnishingStatus === "furnished" &&
            !property.isFurnished
          ) {
            return false;
          }
          if (
            filters.furnishingStatus === "unfurnished" &&
            property.isFurnished
          ) {
            return false;
          }
        }

        // Amenities filter
        if (filters.amenities && filters.amenities.length > 0) {
          return filters.amenities.every((amenity) => {
            const amenityKey = amenity.toLowerCase().replace(" ", "");
            return property.features[amenityKey];
          });
        }

        return true;
      });

      setFilteredProperties(filteredResults);
    } catch (err) {
      console.error("Error searching properties:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
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
        <SearchFilters type="sale" onSearch={handleSearch} />

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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-realtyplus"></div>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.uid}
                id={property.uid}
                title={property.title}
                price={property.price}
                location={property.address}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                imageUrl={property.coverPhoto}
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
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.uid}
                id={property.uid}
                title={property.title}
                price={property.price}
                location={property.address}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                imageUrl={property.coverPhoto}
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

        {!isLoading && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No properties found matching your criteria.
            </p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => {
                setFilteredProperties(properties);
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
