import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import { LISTING } from "@/lib/typeDefinitions";
import { doc, getDoc } from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import Header from "../layout/Header";

const ViewPropertiesByPoster = () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {posterType === "agents" ? "Agent's" : "Agency's"} Properties
        </h1>

        {properties.length === 0 ? (
          <div className="text-center text-gray-500">
            No properties found for this{" "}
            {posterType === "agents" ? "agent" : "agency"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                imageUrl={property.coverPhoto}
                propertyType={property.propertyType}
                isFeatured={property.isFeatured}
                isFurnished={property.isFurnished}
                yearBuilt={property.yearBuilt}
                onFavorite={(id) => {
                  // Implement favorite functionality
                  console.log("Favorite clicked:", id);
                }}
                onClick={(id) => {
                  // Implement click functionality
                  console.log("Property clicked:", id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ViewPropertiesByPoster;
