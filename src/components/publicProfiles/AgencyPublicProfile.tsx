import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Award,
  Briefcase,
  Home,
  Users,
  Eye,
  DollarSign,
  Users2,
  Twitter,
  Linkedin,
  X,
  Building2,
  MapPin,
  Globe,
  Star,
  Loader2,
} from "lucide-react";
import { doc, DocumentReference, getDoc } from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { LISTING, USER } from "@/lib/typeDefinitions";
import Header from "../layout/Header";
import PropertyCard from "../property/PropertyCard";
import { LoadingSpinner } from "../globalScreens/Loader";
import { ErrorMessage } from "../globalScreens/Error";
import { NotFound } from "../globalScreens/Message";

export default function AgencyPublicProfile() {
  const { id } = useParams();
  const [agents, setAgents] = useState<Array<USER & { position: string }>>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agency, setAgency] = useState<USER | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<LISTING[]>([]);

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
      id: agencyDoc.id,
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
                id: agentDoc.id,
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
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-[200px_1fr] gap-6">
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
                  <h1 className="text-3xl font-bold">{agency.companyName}</h1>
                  <p className="text-muted-foreground">{agency.businessType}</p>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-realtyplus" />
                    <span className="font-medium">Business Registration:</span>
                    <span>{agency.businessRegistrationNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-realtyplus" />
                    <span className="font-medium">Email:</span>
                    <span>{agency.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-realtyplus" />
                    <span className="font-medium">Phone:</span>
                    <span>{agency.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-realtyplus" />
                    <span className="font-medium">Location:</span>
                    <span>{`${agency.address}, ${agency.city}`}</span>
                  </div>
                  {agency.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-realtyplus" />
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
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {agency.social.twitter && (
                      <a
                        href={agency.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-realtyplus hover:text-realtyplus/80"
                      >
                        <X className="h-5 w-5" />
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
            <h2 className="text-2xl font-semibold">About Company</h2>
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
            <h2 className="text-2xl font-semibold">Company Overview</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-realtyplus/5 rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-realtyplus" />
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <p className="text-2xl font-bold">
                  {agency.numberOfAgents || "0"}
                </p>
              </div>
              <div className="text-center p-4 bg-realtyplus/5 rounded-lg">
                <Home className="h-8 w-8 mx-auto mb-2 text-realtyplus" />
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">
                  {agency.myListings?.length || "0"}
                </p>
              </div>
              <div className="text-center p-4 bg-realtyplus/5 rounded-lg">
                <Eye className="h-8 w-8 mx-auto mb-2 text-realtyplus" />
                <p className="text-sm text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold">{agency.views || "0"}</p>
              </div>
              <div className="text-center p-4 bg-realtyplus/5 rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-realtyplus" />
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{agency.totalSales || "0"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        {agency.myAgents && agency.myAgents.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Users2 className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Our Team</h2>
            </CardHeader>
            <CardContent>
              {loadingAgents ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-realtyplus" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {agents.map((agent) => (
                    <Card key={agent.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4 flex flex-col items-center text-center">
                          <Avatar className="w-20 h-20 mb-3">
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
                          <p className="text-sm text-muted-foreground mb-2">
                            {agent.position}
                          </p>

                          <div className="w-full space-y-2 mt-2">
                            <div className="flex items-center justify-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-realtyplus" />
                              <span className="text-gray-600">
                                {agent.email}
                              </span>
                            </div>
                            {agent.phone && (
                              <div className="flex items-center justify-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-realtyplus" />
                                <span className="text-gray-600">
                                  {agent.phone}
                                </span>
                              </div>
                            )}
                          </div>

                          {agent.specialties &&
                            agent.specialties.length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-1 justify-center">
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

                        <div className="border-t bg-gray-50 p-4 flex justify-center">
                          <Link
                            to={`/agent/${agent.id}`}
                            className="text-sm text-realtyplus hover:text-realtyplus/80 font-medium"
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
              <Home className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Properties</h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </>
  );
}
