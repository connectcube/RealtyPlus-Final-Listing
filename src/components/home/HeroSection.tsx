import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { HomeIcon, Building, MapPin } from "lucide-react";
import SearchFilters from "../search/SearchFilters";
import { useZustand } from "@/lib/zustand";
import { useState } from "react";
import { fireDataBase } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { LISTING, SearchFiltersProps } from "@/lib/typeDefinitions";
interface HeroSectionProps {
  backgroundImage?: string;
}
// HeroSection.tsx

const HeroSection = ({
  backgroundImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80",
}: HeroSectionProps) => {
  const { user } = useZustand();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<LISTING[]>([]);
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
  return (
    <section
      className="relative bg-cover bg-center h-[600px]"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 text-white">
          Find Your Perfect Property in Zambia
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-10 max-w-3xl mx-auto text-white">
          Your trusted partner for buying, selling, and renting properties
          across Zambia
        </p>
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 mb-4 md:mb-6">
            <Button className="flex-1 h-12 text-lg bg-realtyplus hover:bg-realtyplus-dark">
              <Link
                to="/buy"
                className="flex items-center justify-center w-full text-white"
              >
                <HomeIcon className="mr-2 h-5 w-5" /> Buy
              </Link>
            </Button>
            <Button className="flex-1 h-12 text-lg bg-realtyplus hover:bg-realtyplus-dark">
              <Link
                to="/rent"
                className="flex items-center justify-center w-full text-white"
              >
                <Building className="mr-2 h-5 w-5" /> Rent
              </Link>
            </Button>
            {user !== null && user.userType !== "users" && (
              <Button className="flex-1 h-12 text-lg bg-realtyplus hover:bg-realtyplus-dark">
                <Link
                  to="/list-property"
                  className="flex items-center justify-center w-full text-white"
                >
                  <MapPin className="mr-2 h-5 w-5" /> List Property
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
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
