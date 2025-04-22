import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Home,
  Users,
  Eye,
  DollarSign,
  Users2,
  Linkedin,
  X,
  Building2,
  MapPin,
  Globe,
  Star,
  Loader2,
} from "lucide-react";
import { doc, DocumentReference, getDoc, updateDoc } from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { LISTING, USER } from "@/lib/typeDefinitions";
import Header from "../layout/Header";
import PropertyCard from "../property/PropertyCard";
import { LoadingSpinner } from "../globalScreens/Loader";
import { ErrorMessage } from "../globalScreens/Error";
import { NotFound } from "../globalScreens/Message";
import { useZustand } from "@/lib/zustand";
import { toast } from "react-toastify";

export default function AgencyPublicProfile() {
  const { user, setUser } = useZustand();
  const { id } = useParams();
  const [agents, setAgents] = useState<Array<USER & { position: string }>>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agency, setAgency] = useState<USER | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<LISTING[]>([]);
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

  useEffect(() => {
    if (!id) {
      setError("Agency ID is required");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchAgencyProfile(id), fetchAgencyListings(id)]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching agency data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (agency?.myAgents && agency.myAgents.length > 0) {
      fetchAgents(agency.myAgents);
    }
  }, [agency]);

  const fetchAgencyProfile = async (agencyId: string) => {
    const agencyDocRef = doc(fireDataBase, "agencies", agencyId);
    const agencyDoc = await getDoc(agencyDocRef);

    if (!agencyDoc.exists()) {
      throw new Error("Agency not found");
    }

    const agencyData = {
      uid: agencyDoc.id,
      ...agencyDoc.data(),
    } as USER;

    setAgency(agencyData);
    return agencyData;
  };

  const fetchAgencyListings = async (agencyId: string) => {
    const agencyDoc = await getDoc(doc(fireDataBase, "agencies", agencyId));
    const agencyData = agencyDoc.data() as USER;

    if (!agencyData.myListings?.length) {
      setListings([]);
      return;
    }

    const listingsWithDetails = await Promise.all(
      agencyData.myListings.map(async (listing) => {
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
  };

  const fetchAgents = async (
    agentsList: Array<{ position: string; ref: DocumentReference }>
  ) => {
    setLoadingAgents(true);
    try {
      const agentsData = await Promise.all(
        agentsList.map(async ({ position, ref }) => {
          try {
            const agentDoc = await getDoc(ref);
            if (agentDoc.exists()) {
              return {
                ...agentDoc.data(),
                uid: agentDoc.id,
                position,
              } as USER & { position: string };
            }
            return null;
          } catch (err) {
            console.error(`Error fetching agent details:`, err);
            return null;
          }
        })
      );

      setAgents(
        agentsData.filter(
          (agent): agent is USER & { position: string } => agent !== null
        )
      );
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoadingAgents(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!agency) {
    return <NotFound message="Agency not found" />;
  }

  return (
    <>
      <Header />
      <div className="space-y-6 mx-auto p-4 max-w-7xl">
        <Card>
          <CardContent className="p-6">
            <div className="gap-6 grid md:grid-cols-[200px_1fr]">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-48 h-48">
                  <AvatarImage
                    src={
                      agency.pfp ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${agency.companyName}`
                    }
                    alt={agency.companyName}
                  />
                  <AvatarFallback>
                    {agency.companyName?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                {agency.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < agency.rating!
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h1 className="font-bold text-3xl">{agency.companyName}</h1>
                  <p className="text-muted-foreground">{agency.businessType}</p>
                </div>

                <div className="gap-2 grid">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-realtyplus" />
                    <span className="font-medium">Business Registration:</span>
                    <span>{agency.businessRegistrationNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-realtyplus" />
                    <span className="font-medium">Email:</span>
                    <span>{agency.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-realtyplus" />
                    <span className="font-medium">Phone:</span>
                    <span>{agency.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-realtyplus" />
                    <span className="font-medium">Location:</span>
                    <span>{`${agency.address}, ${agency.city}`}</span>
                  </div>
                  {agency.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-realtyplus" />
                      <span className="font-medium">Website:</span>
                      <a
                        href={agency.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-realtyplus hover:underline"
                      >
                        {agency.website}
                      </a>
                    </div>
                  )}
                </div>

                {agency.social && (
                  <div className="flex gap-4">
                    {agency.social.linkedin && (
                      <a
                        href={agency.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-realtyplus hover:text-realtyplus/80"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {agency.social.twitter && (
                      <a
                        href={agency.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-realtyplus hover:text-realtyplus/80"
                      >
                        <X className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-2xl">About Company</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {agency.companyDescription || agency.bio}
            </p>
          </CardContent>
        </Card>

        {/* Company Stats */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-2xl">Company Overview</h2>
          </CardHeader>
          <CardContent>
            <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
              <div className="bg-realtyplus/5 p-4 rounded-lg text-center">
                <Users className="mx-auto mb-2 w-8 h-8 text-realtyplus" />
                <p className="text-muted-foreground text-sm">Total Agents</p>
                <p className="font-bold text-2xl">
                  {agency.numberOfAgents || "0"}
                </p>
              </div>
              <div className="bg-realtyplus/5 p-4 rounded-lg text-center">
                <Home className="mx-auto mb-2 w-8 h-8 text-realtyplus" />
                <p className="text-muted-foreground text-sm">Active Listings</p>
                <p className="font-bold text-2xl">
                  {agency.myListings?.length || "0"}
                </p>
              </div>
              <div className="bg-realtyplus/5 p-4 rounded-lg text-center">
                <Eye className="mx-auto mb-2 w-8 h-8 text-realtyplus" />
                <p className="text-muted-foreground text-sm">Profile Views</p>
                <p className="font-bold text-2xl">{agency.views || "0"}</p>
              </div>
              <div className="bg-realtyplus/5 p-4 rounded-lg text-center">
                <DollarSign className="mx-auto mb-2 w-8 h-8 text-realtyplus" />
                <p className="text-muted-foreground text-sm">Total Sales</p>
                <p className="font-bold text-2xl">{agency.totalSales || "0"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        {agency.myAgents && agency.myAgents.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Users2 className="w-6 h-6 text-primary" />
              <h2 className="font-semibold text-2xl">Our Team</h2>
            </CardHeader>
            <CardContent>
              {loadingAgents ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 text-realtyplus animate-spin" />
                </div>
              ) : (
                <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
                  {agents.map((agent) => (
                    <Card key={agent.uid} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col items-center p-4 text-center">
                          <Avatar className="mb-3 w-20 h-20">
                            <AvatarImage
                              src={
                                agent.pfp ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.firstName}${agent.lastName}`
                              }
                              alt={`${agent.firstName} ${agent.lastName}`}
                            />
                            <AvatarFallback>
                              {agent.firstName?.[0]}
                              {agent.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-lg">
                            {agent.firstName} {agent.lastName}
                          </h3>
                          <p className="mb-2 text-muted-foreground text-sm">
                            {agent.position}
                          </p>

                          <div className="space-y-2 mt-2 w-full">
                            <div className="flex justify-center items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-realtyplus" />
                              <span className="text-gray-600">
                                {agent.email}
                              </span>
                            </div>
                            {agent.phone && (
                              <div className="flex justify-center items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-realtyplus" />
                                <span className="text-gray-600">
                                  {agent.phone}
                                </span>
                              </div>
                            )}
                          </div>

                          {agent.specialties &&
                            agent.specialties.length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap justify-center gap-1">
                                  {agent.specialties
                                    .slice(0, 3)
                                    .map((specialty, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {specialty}
                                      </Badge>
                                    ))}
                                  {agent.specialties.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      +{agent.specialties.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>

                        <div className="flex justify-center bg-gray-50 p-4 border-t">
                          <Link
                            to={`/agent/${agent.uid}`}
                            className="font-medium text-realtyplus hover:text-realtyplus/80 text-sm"
                          >
                            View Profile
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Listings Section */}
        {listings.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Home className="w-6 h-6 text-primary" />
              <h2 className="font-semibold text-2xl">Properties</h2>
            </CardHeader>
            <CardContent>
              <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
                {listings.map(
                  (listing) =>
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
                        imageUrl={listing.images[listing.coverPhotoIndex]}
                        propertyType={listing.propertyType}
                        isFeatured={listing.isFeatured}
                        isFurnished={listing.isFurnished}
                        yearBuilt={listing.yearBuilt}
                        onFavorite={handleFavClick}
                        isFavorite={() => handleCheckFav(listing.uid)}
                        onClick={() => console.log(listing.uid)}
                      />
                    )
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
