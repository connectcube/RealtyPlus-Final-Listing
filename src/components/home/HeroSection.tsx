import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { HomeIcon, Building, MapPin, List, Grid, X } from "lucide-react";
import SearchFilters from "../search/SearchFilters";
import { useZustand } from "@/lib/zustand";
import { useEffect, useState } from "react";
import { fireDataBase } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { FEATURES, LISTING, SearchFiltersProps } from "@/lib/typeDefinitions";
import PropertyCard from "../property/PropertyCard";
interface HeroSectionProps {
  backgroundImage?: string;
}
// HeroSection.tsx

const HeroSection = ({
  backgroundImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80",
}: HeroSectionProps) => {
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
    propertyCategory: "all",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching properties:", error);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(filters as SearchFiltersProps);
  }, [filters]);

  return (
    <section
      className="relative bg-cover bg-center h-[600px]"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="z-10 relative flex flex-col justify-start items-center mx-auto px-4 h-full text-center container">
        <h1 className="mb-4 md:mb-6 font-bold text-white text-3xl sm:text-4xl md:text-6xl">
          Find Your Perfect Property in Zambia
        </h1>
        <p className="mx-auto mb-6 md:mb-10 max-w-3xl text-white text-lg sm:text-xl md:text-2xl">
          Your trusted partner for buying, selling, and renting properties
          across Zambia
        </p>
        <div className="bg-white shadow-lg p-4 sm:p-6 rounded-lg w-full max-w-4xl">
          <div className="flex md:flex-row flex-col md:space-x-4 space-y-3 md:space-y-0 mb-4 md:mb-6">
            <Button className="flex-1 bg-realtyplus hover:bg-realtyplus-dark h-12 text-lg">
              <Link
                to="/buy"
                className="flex justify-center items-center w-full text-white"
              >
                <HomeIcon className="mr-2 w-5 h-5" /> Buy
              </Link>
            </Button>
            <Button className="flex-1 bg-realtyplus hover:bg-realtyplus-dark h-12 text-lg">
              <Link
                to="/rent"
                className="flex justify-center items-center w-full text-white"
              >
                <Building className="mr-2 w-5 h-5" /> Rent
              </Link>
            </Button>
            {user !== null && user.userType !== "users" && (
              <Button className="flex-1 bg-realtyplus hover:bg-realtyplus-dark h-12 text-lg">
                <Link
                  to="/list-property"
                  className="flex justify-center items-center w-full text-white"
                >
                  <MapPin className="mr-2 w-5 h-5" /> List Property
                </Link>
              </Button>
            )}
          </div>
          <SearchFilters
            onSearch={handleSearch}
            setFilters={setFilters}
            filters={filters}
            isLoading={loading}
            type="sale"
            className="shadow-none"
          />
          {isModalOpen && (
            <HomePagePropertiesModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              properties={properties}
              user={user}
              setUser={setUser}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

const HomePagePropertiesModal = ({
  isOpen,
  onClose,
  properties,
  user,
  setUser,
}) => {
  const [view, setView] = useState<"grid" | "list">("grid");
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
  useEffect(() => {
    if (isOpen) {
      // Prevent background scroll
      document.body.style.overflow = "hidden";
      // Store current scroll position
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      // Re-enable scrolling when modal closes
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div
      className={`modal ${
        isOpen ? "open" : ""
      } fixed inset-0 z-[1000] w-full h-full bg-black/50 flex items-center justify-center backdrop-blur overflow-y-auto p-4`}
    >
      <div className="relative bg-white mx-auto rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto modal-content">
        {/* Header Section */}
        <div className="top-0 z-10 sticky flex justify-between items-center bg-white p-4 border-b">
          <h2 className="font-semibold text-2xl">Property Details</h2>
          <div className="flex items-center gap-3">
            <Button
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
              onClick={() => setView(view === "grid" ? "list" : "grid")}
            >
              {view === "grid" ? (
                <span className="flex items-center">
                  <List className="mr-2 w-4 h-4" /> List View
                </span>
              ) : (
                <span className="flex items-center">
                  <Grid className="mr-2 w-4 h-4" /> Grid View
                </span>
              )}
            </Button>
            <Button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <p className="mb-4 text-gray-600">
            {properties.length} properties found
          </p>

          {properties.length > 0 ? (
            <div
              className={`
              ${
                view === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "flex flex-col gap-4"
              }
            `}
            >
              {properties.map((property) => (
                <PropertyCard
                  key={property.uid}
                  onFavorite={handleFavClick}
                  isFavorite={() => handleCheckFav(property.uid)}
                  onClick={() => console.log(property.uid)}
                  view={view}
                  {...property}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">
                No properties found matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
