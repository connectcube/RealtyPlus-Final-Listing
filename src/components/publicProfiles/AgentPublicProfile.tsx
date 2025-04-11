import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Award, Briefcase, Home } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { LISTING, USER } from "@/lib/typeDefinitions";
import Header from "../layout/Header";
import PropertyCard from "../property/PropertyCard";

export default function AgentPublicProfile() {
  const { id } = useParams();
  const [agent, setAgent] = useState<USER | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<LISTING[]>([]);
  useEffect(() => {
    const fetchAgentProfile = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error("Agent ID is required");

        const agentDocRef = doc(fireDataBase, "agents", id);
        const agentDoc = await getDoc(agentDocRef);

        if (!agentDoc.exists()) {
          throw new Error("Agent not found");
        }

        // Combine document data with ID
        const agentData = {
          id: agentDoc.id,
          ...agentDoc.data(),
        } as USER;

        setAgent(agentData);
        if (agentData.myListings && agentData.myListings.length > 0) {
          const listingsWithDetails = await Promise.all(
            agentData.myListings.map(async (listing) => {
              try {
                const listingDoc = await getDoc(listing.ref);
                if (listingDoc.exists()) {
                  return {
                    uid: listingDoc.id,
                    ...listingDoc.data(),
                  } as LISTING;
                }
                return null;
              } catch (err) {
                console.error(`Error fetching listing details:`, err);
                return null;
              }
            })
          );
          setListings(
            listingsWithDetails.filter(
              (listing): listing is LISTING => listing !== null
            )
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching agent profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        Agent not found
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-[200px_1fr] gap-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-48 h-48">
                  <AvatarImage
                    src={agent.pfp}
                    alt={`${agent?.firstName} ${agent?.lastName}`}
                  />
                  <AvatarFallback>{agent.firstName.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{`${agent?.firstName} ${agent?.lastName}`}</h1>
                  <p className="text-muted-foreground">Real Estate Agent</p>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-realtyplus" />
                    <span className="font-medium">Experience:</span>
                    <span>{agent.experience} years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-realtyplus" />
                    <span className="font-medium">Email:</span>
                    <span>{agent.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-realtyplus" />
                    <span className="font-medium">Phone:</span>
                    <span>{agent.phone}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-realtyplus" />
                    <h3 className="font-semibold">Specializations</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agent.specialties.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-realtyplus" />
                    <h3 className="font-semibold">Languages</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agent.languages.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">About Me</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{agent.bio}</p>
          </CardContent>
        </Card>
        {/* Listings Section */}
        {listings.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Listings</h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {listings.map(
                  (listing, index) =>
                    listing && (
                      <PropertyCard
                        key={listing.uid}
                        id={listing.uid}
                        title={listing.title}
                        price={listing.price}
                        location={listing.address}
                        bedrooms={listing.bedrooms}
                        bathrooms={listing.bathrooms}
                        area={listing.area}
                        imageUrl={listing.coverPhoto}
                        propertyType={listing.propertyType}
                        isFeatured={listing.isFeatured}
                        isFurnished={listing.isFurnished}
                        yearBuilt={listing.yearBuilt}
                      />
                    )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section 
      {agent.reviews.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Client Reviews</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agent.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{review.author}</h3>
                        <p className="text-sm text-muted-foreground">
                          {review.date}
                        </p>
                      </div>
                      <Badge variant="outline">Rating: {review.rating}/5</Badge>
                    </div>
                    <Separator className="my-2" />
                    <p className="text-muted-foreground">{review.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}*/}
      </div>
    </>
  );
}
