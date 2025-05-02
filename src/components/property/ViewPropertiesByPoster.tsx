import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import { LISTING } from "@/lib/typeDefinitions";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import Header from "../layout/Header";
import { useZustand } from "@/lib/zustand";
import { toast } from "react-toastify";

const ViewPropertiesByPoster = () => {
  const { user, setUser } = useZustand();
  const [properties, setProperties] = useState<LISTING[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract posterId and posterType from URL
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  const posterType = pathParts[0]; // "agents" or "agency"
  const posterId = pathParts[1]; // the ID
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);

        // First, get the agent/agency document
        const posterDoc = await getDoc(
          doc(
            fireDataBase,
            posterType === "agents" ? "agents" : "agencies",
            posterId
          )
        );

        if (!posterDoc.exists()) {
          throw new Error("Poster not found");
        }

        const myListings = posterDoc.data().myListings || [];
        const propertyList: LISTING[] = [];

        // Fetch all properties using the refs
        for (const listing of myListings) {
          const listingDoc = await getDoc(listing.ref);
          if (listingDoc.exists()) {
            propertyList.push({
              uid: listingDoc.id,
              ...(listingDoc.data() as Omit<LISTING, "uid">),
            });
          }
        }

        setProperties(propertyList);
      } catch (err) {
        setError("Failed to fetch properties");
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };

    if (posterId && posterType) {
      fetchProperties();
    }
  }, [posterId, posterType]);
  const handleFavClick = (propertyId: string) => {
    try {
      if (!user) {
        toast.error("Please log in to save properties");
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
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="mx-auto px-4 py-8 container">
        <h1 className="mb-6 font-bold text-2xl">
          {posterType === "agents" ? "Agent's" : "Agency's"} Properties
        </h1>

        {properties.length === 0 ? (
          <div className="text-gray-500 text-center">
            No properties found for this{" "}
            {posterType === "agents" ? "agent" : "agency"}
          </div>
        ) : (
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard
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
                yearBuilt={property.yearBuilt}
                onFavorite={handleFavClick}
                isFavorite={() => handleCheckFav(property.uid)}
                onClick={() => console.log(property.uid)}
                status={property.status}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ViewPropertiesByPoster;
