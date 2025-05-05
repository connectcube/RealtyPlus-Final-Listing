import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  startAfter,
  DocumentData,
  startAt,
  endAt,
} from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { LISTING, USER } from "@/lib/typeDefinitions";
import { LoadingSpinner } from "../globalScreens/Loader";
import { Button } from "../ui/button";
import { Search, MapPin, Home, Bed, Bath, Phone, Mail } from "lucide-react";

import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "../layout/Header";

export default function GlobalSearch() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState("all");

  // State for properties
  const [properties, setProperties] = useState<LISTING[]>([]);
  const [propertyLastVisible, setPropertyLastVisible] =
    useState<DocumentData | null>(null);
  const [hasMoreProperties, setHasMoreProperties] = useState(true);

  // State for agents
  const [agents, setAgents] = useState<USER[]>([]);
  const [agentLastVisible, setAgentLastVisible] = useState<DocumentData | null>(
    null
  );
  const [hasMoreAgents, setHasMoreAgents] = useState(true);

  // State for agencies
  const [agencies, setAgencies] = useState<USER[]>([]);
  const [agencyLastVisible, setAgencyLastVisible] =
    useState<DocumentData | null>(null);
  const [hasMoreAgencies, setHasMoreAgencies] = useState(true);

  // Common state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all search results
  const fetchAllSearchResults = async () => {
    setLoading(true);
    await Promise.all([fetchProperties(), fetchAgents(), fetchAgencies()]);
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "all") {
      fetchAllSearchResults();
    } else if (activeTab === "properties") {
      fetchProperties();
    } else if (activeTab === "agents") {
      fetchAgents();
    } else if (activeTab === "agencies") {
      fetchAgencies();
    }
  }, [searchQuery, activeTab]);

  const handleLoadMoreProperties = () => {
    fetchProperties(true);
  };

  const handleLoadMoreAgents = () => {
    fetchAgents(true);
  };

  const handleLoadMoreAgencies = () => {
    fetchAgencies(true);
  };

  const getTotalResults = () => {
    return properties.length + agents.length + agencies.length;
  };

  const hasNoResults = () => {
    if (activeTab === "all") {
      return !loading && getTotalResults() === 0;
    } else if (activeTab === "properties") {
      return !loading && properties.length === 0;
    } else if (activeTab === "agents") {
      return !loading && agents.length === 0;
    } else if (activeTab === "agencies") {
      return !loading && agencies.length === 0;
    }
    return false;
  };

  // Function to fetch properties
  const fetchProperties = async (isLoadMore = false) => {
    try {
      console.log("🔍 fetchProperties called with:", {
        searchQuery,
        isLoadMore,
      });
      if (!isLoadMore) setLoading(true);

      // Create a base query for properties
      let q;
      const lowerSearchQuery = searchQuery.toLowerCase();
      console.log("Search query (lowercase):", lowerSearchQuery);

      // For Firestore, we need to check if the data is stored in lowercase
      // If not, we'll need to rely more on client-side filtering
      if (searchQuery) {
        // Get a broader range of results to filter client-side
        q = query(
          collection(fireDataBase, "listings"),
          // We'll get more results and filter client-side for case-insensitive matching
          limit(50)
        );
        console.log("Using broader query for case-insensitive search");
      } else {
        q = query(
          collection(fireDataBase, "listings"),
          orderBy("createdAt", "desc"),
          limit(8)
        );
        console.log("Using default createdAt query");
      }

      // Add pagination for load more
      if (isLoadMore && propertyLastVisible) {
        console.log(
          "Adding pagination with lastVisible:",
          propertyLastVisible.id
        );
        if (searchQuery) {
          q = query(
            collection(fireDataBase, "listings"),
            startAfter(propertyLastVisible),
            limit(50)
          );
        } else {
          q = query(
            collection(fireDataBase, "listings"),
            orderBy("createdAt", "desc"),
            startAfter(propertyLastVisible),
            limit(8)
          );
        }
      }

      console.log("Executing Firestore query for properties...");
      const querySnapshot = await getDocs(q);
      console.log(`Raw query returned ${querySnapshot.docs.length} documents`);

      let propertyResults = querySnapshot.docs.map((doc) => {
        return { uid: doc.id, ...(doc.data() as LISTING) };
      });
      console.log("Mapped property results:", propertyResults.length);

      // Client-side filtering for case-insensitive matches if search query exists
      if (searchQuery) {
        const beforeFilter = propertyResults.length;
        propertyResults = propertyResults.filter((property) => {
          // Case-insensitive search on title
          const titleLower = property.title?.toLowerCase() || "";
          // Also search in address and description if available
          const addressLower = property.address?.toLowerCase() || "";
          const descriptionLower = property.description?.toLowerCase() || "";

          return (
            titleLower.includes(lowerSearchQuery) ||
            addressLower.includes(lowerSearchQuery) ||
            descriptionLower.includes(lowerSearchQuery)
          );
        });
        console.log(
          `Client-side filtering: ${beforeFilter} → ${propertyResults.length} results`
        );

        // Limit results after filtering
        const beforeLimit = propertyResults.length;
        propertyResults = propertyResults.slice(0, 8);
        console.log(
          `After limiting: ${beforeLimit} → ${propertyResults.length} results`
        );
      }

      // Check if we have more results
      setHasMoreProperties(propertyResults.length === 8);
      console.log("Has more properties:", propertyResults.length === 8);

      // Set the last visible document for pagination
      if (querySnapshot.docs.length > 0) {
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        console.log("Setting last visible document:", lastDoc.id);
        setPropertyLastVisible(lastDoc);
      } else {
        console.log("No last visible document to set");
        setPropertyLastVisible(null);
      }

      if (isLoadMore) {
        console.log("Loading more - appending to existing properties");
        setProperties((prev) => {
          const newState = [...prev, ...propertyResults];
          console.log(
            `Properties state updated: ${prev.length} → ${newState.length}`
          );
          return newState;
        });
      } else {
        console.log(
          "Setting properties state with",
          propertyResults.length,
          "items"
        );
        setProperties(propertyResults);
      }
    } catch (err) {
      console.error("Error fetching property results:", err);
      setError("Failed to fetch property results. Please try again.");
    } finally {
      if (!isLoadMore) {
        console.log("Finished loading properties");
        setLoading(false);
      }
    }
  };

  // Function to fetch agents
  const fetchAgents = async (isLoadMore = false) => {
    try {
      console.log("🔍 fetchAgents called with:", { searchQuery, isLoadMore });
      if (!isLoadMore) setLoading(true);

      const lowerSearchQuery = searchQuery.toLowerCase();
      console.log("Search query (lowercase):", lowerSearchQuery);

      let agentResults: USER[] = [];
      const agentIds = new Set();

      if (searchQuery) {
        // Get a broader range of results to filter client-side
        const agentsQuery = query(
          collection(fireDataBase, "agents"),
          limit(50)
        );

        console.log("Executing broader Firestore query for agents...");
        const snapshot = await getDocs(agentsQuery);
        console.log(`Query returned ${snapshot.docs.length} agents`);

        snapshot.docs.forEach((doc) => {
          agentResults.push({ uid: doc.id, ...(doc.data() as USER) });
        });

        // Client-side filtering for case-insensitive matches
        const beforeFilter = agentResults.length;
        agentResults = agentResults.filter((agent) => {
          const firstNameLower = agent.firstName?.toLowerCase() || "";
          const lastNameLower = agent.lastName?.toLowerCase() || "";
          const emailLower = agent.email?.toLowerCase() || "";

          return (
            firstNameLower.includes(lowerSearchQuery) ||
            lastNameLower.includes(lowerSearchQuery) ||
            emailLower.includes(lowerSearchQuery)
          );
        });
        console.log(
          `Client-side filtering: ${beforeFilter} → ${agentResults.length} results`
        );

        // Limit results after filtering
        const beforeLimit = agentResults.length;
        agentResults = agentResults.slice(0, 8);
        console.log(
          `After limiting: ${beforeLimit} → ${agentResults.length} results`
        );
      } else {
        // If no search query, just get the first 8 agents
        console.log("Using default firstName query for agents");
        const firstNameQuery = query(
          collection(fireDataBase, "agents"),
          orderBy("firstName"),
          limit(8)
        );

        console.log("Executing Firestore query for agents...");
        const snapshot = await getDocs(firstNameQuery);
        console.log(`Query returned ${snapshot.docs.length} agents`);

        snapshot.docs.forEach((doc) => {
          agentResults.push({ uid: doc.id, ...(doc.data() as USER) });
        });
      }

      // Check if we have more results
      setHasMoreAgents(agentResults.length === 8);
      console.log("Has more agents:", agentResults.length === 8);

      // Set the last visible document for pagination (simplified)
      if (agentResults.length > 0) {
        console.log(
          "Getting last visible agent document for:",
          agentResults[agentResults.length - 1].uid
        );
        // This is simplified and might need adjustment for proper pagination
        const lastDoc = await getDocs(
          query(
            collection(fireDataBase, "agents"),
            where("uid", "==", agentResults[agentResults.length - 1].uid)
          )
        );

        if (!lastDoc.empty) {
          console.log("Setting agent last visible document");
          setAgentLastVisible(lastDoc.docs[0]);
        } else {
          console.log("No agent last visible document found");
        }
      } else {
        console.log("No agents to set last visible");
        setAgentLastVisible(null);
      }

      if (isLoadMore) {
        console.log("Loading more - appending to existing agents");
        setAgents((prev) => {
          const newState = [...prev, ...agentResults];
          console.log(
            `Agents state updated: ${prev.length} → ${newState.length}`
          );
          return newState;
        });
      } else {
        console.log("Setting agents state with", agentResults.length, "items");
        setAgents(agentResults);
      }
    } catch (err) {
      console.error("Error fetching agent results:", err);
      setError("Failed to fetch agent results. Please try again.");
    } finally {
      if (!isLoadMore) {
        console.log("Finished loading agents");
        setLoading(false);
      }
    }
  };

  // Function to fetch agencies
  const fetchAgencies = async (isLoadMore = false) => {
    try {
      console.log("🔍 fetchAgencies called with:", { searchQuery, isLoadMore });
      if (!isLoadMore) setLoading(true);

      const lowerSearchQuery = searchQuery.toLowerCase();
      console.log("Search query (lowercase):", lowerSearchQuery);

      let agencyResults: USER[] = [];
      const agencyIds = new Set();

      if (searchQuery) {
        // Get a broader range of results to filter client-side
        const agenciesQuery = query(
          collection(fireDataBase, "agencies"),
          limit(50)
        );

        console.log("Executing broader Firestore query for agencies...");
        const snapshot = await getDocs(agenciesQuery);
        console.log(`Query returned ${snapshot.docs.length} agencies`);

        snapshot.docs.forEach((doc) => {
          agencyResults.push({ uid: doc.id, ...(doc.data() as USER) });
        });

        // Client-side filtering for case-insensitive matches
        const beforeFilter = agencyResults.length;
        agencyResults = agencyResults.filter((agency) => {
          const firstNameLower = agency.firstName?.toLowerCase() || "";
          const lastNameLower = agency.lastName?.toLowerCase() || "";
          const emailLower = agency.email?.toLowerCase() || "";

          return (
            firstNameLower.includes(lowerSearchQuery) ||
            lastNameLower.includes(lowerSearchQuery) ||
            emailLower.includes(lowerSearchQuery)
          );
        });
        console.log(
          `Client-side filtering: ${beforeFilter} → ${agencyResults.length} results`
        );

        // Limit results after filtering
        const beforeLimit = agencyResults.length;
        agencyResults = agencyResults.slice(0, 8);
        console.log(
          `After limiting: ${beforeLimit} → ${agencyResults.length} results`
        );
      } else {
        // If no search query, just get the first 8 agencies
        console.log("Using default firstName query for agencies");
        const firstNameQuery = query(
          collection(fireDataBase, "agencies"),
          orderBy("firstName"),
          limit(8)
        );

        console.log("Executing Firestore query for agencies...");
        const snapshot = await getDocs(firstNameQuery);
        console.log(`Query returned ${snapshot.docs.length} agencies`);

        snapshot.docs.forEach((doc) => {
          agencyResults.push({ uid: doc.id, ...(doc.data() as USER) });
        });
      }

      // Check if we have more results
      setHasMoreAgencies(agencyResults.length === 8);
      console.log("Has more agencies:", agencyResults.length === 8);

      // Set the last visible document for pagination (simplified)
      if (agencyResults.length > 0) {
        console.log(
          "Getting last visible agency document for:",
          agencyResults[agencyResults.length - 1].uid
        );
        // This is simplified and might need adjustment for proper pagination
        const lastDoc = await getDocs(
          query(
            collection(fireDataBase, "agencies"),
            where("uid", "==", agencyResults[agencyResults.length - 1].uid)
          )
        );

        if (!lastDoc.empty) {
          console.log("Setting agency last visible document");
          setAgencyLastVisible(lastDoc.docs[0]);
        } else {
          console.log("No agency last visible document found");
        }
      } else {
        console.log("No agencies to set last visible");
        setAgencyLastVisible(null);
      }

      if (isLoadMore) {
        console.log("Loading more - appending to existing agencies");
        setAgencies((prev) => {
          const newState = [...prev, ...agencyResults];
          console.log(
            `Agencies state updated: ${prev.length} → ${newState.length}`
          );
          return newState;
        });
      } else {
        console.log(
          "Setting agencies state with",
          agencyResults.length,
          "items"
        );
        setAgencies(agencyResults);
      }
    } catch (err) {
      console.error("Error fetching agency results:", err);
      setError("Failed to fetch agency results. Please try again.");
    } finally {
      if (!isLoadMore) {
        console.log("Finished loading agencies");
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="mx-auto px-4 py-8 container">
        <h1 className="mb-6 font-bold text-2xl md:text-3xl">
          Search Results {searchQuery ? `for "${searchQuery}"` : ""}
        </h1>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="agencies">Agencies</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading && getTotalResults() === 0 ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-50 mb-6 p-4 rounded-md text-red-600">
            {error}
          </div>
        ) : hasNoResults() ? (
          <div className="py-16 text-center">
            <Search className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <h2 className="mb-2 font-semibold text-xl">No results found</h2>
            <p className="mb-6 text-gray-600">
              Try adjusting your search or filters to find what you're looking
              for
            </p>
          </div>
        ) : (
          <>
            {/* Properties Section */}
            {(activeTab === "all" || activeTab === "properties") &&
              properties.length > 0 && (
                <div className="mb-10">
                  {activeTab === "all" && (
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-semibold text-xl">Properties</h2>
                      <Button
                        variant="link"
                        onClick={() => setActiveTab("properties")}
                      >
                        View All Properties
                      </Button>
                    </div>
                  )}

                  <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {properties.map((property) => (
                      <Link
                        to={`/property/${property.uid}`}
                        key={property.uid}
                        className="bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden transition-shadow"
                      >
                        <div className="relative">
                          <img
                            src={
                              property.images[property.coverPhotoIndex] ||
                              "/placeholder-property.jpg"
                            }
                            alt={property.title}
                            className="w-full h-48 object-cover"
                          />
                          <Badge className="top-2 right-2 absolute bg-realtyplus">
                            {property.listingType === "rent"
                              ? "For Rent"
                              : "For Sale"}
                          </Badge>
                        </div>

                        <div className="p-4">
                          <h3 className="mb-1 font-semibold text-lg line-clamp-1">
                            {property.title}
                          </h3>

                          <div className="flex items-center mb-2 text-gray-600 text-sm">
                            <MapPin className="mr-1 w-4 h-4" />
                            <span className="line-clamp-1">
                              {property.address}
                            </span>
                          </div>

                          <div className="mb-3 font-bold text-realtyplus text-lg">
                            K {property.price.toLocaleString()}
                            {property.listingType === "rent" && (
                              <span className="font-normal text-gray-600 text-sm">
                                /month
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 text-gray-600 text-sm">
                            {property.bedrooms > 0 && (
                              <div className="flex items-center">
                                <Bed className="mr-1 w-4 h-4" />
                                <span>
                                  {property.bedrooms}{" "}
                                  {property.bedrooms === 1 ? "Bed" : "Beds"}
                                </span>
                              </div>
                            )}

                            {property.bathrooms > 0 && (
                              <div className="flex items-center">
                                <Bath className="mr-1 w-4 h-4" />
                                <span>
                                  {property.bathrooms}{" "}
                                  {property.bathrooms === 1 ? "Bath" : "Baths"}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center">
                              <Home className="mr-1 w-4 h-4" />
                              <span>{property.propertyType}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {hasMoreProperties && activeTab === "properties" && (
                    <div className="flex justify-center mt-8">
                      <Button
                        variant="outline"
                        onClick={handleLoadMoreProperties}
                        disabled={loading}
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          "Load More Properties"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

            {/* Agents Section */}
            {(activeTab === "all" || activeTab === "agents") &&
              agents.length > 0 && (
                <div className="mb-10">
                  {activeTab === "all" && (
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-semibold text-xl">Agents</h2>
                      <Button
                        variant="link"
                        onClick={() => setActiveTab("agents")}
                      >
                        View All Agents
                      </Button>
                    </div>
                  )}

                  <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {agents.map((agent) => (
                      <Link
                        to={`/agent/${agent.uid}`}
                        key={agent.uid}
                        className="bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden transition-shadow"
                      >
                        <div className="p-6 text-center">
                          <div className="mx-auto mb-4 rounded-full w-24 h-24 overflow-hidden">
                            <img
                              src={agent.pfp || "/default-avatar.png"}
                              alt={`${agent.firstName} ${agent.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="mb-1 font-semibold text-lg">
                            {agent.firstName} {agent.lastName}
                          </h3>
                          <p className="mb-2 text-gray-600 text-sm">
                            Real Estate Agent
                          </p>

                          {agent.phone && (
                            <div className="flex justify-center items-center mb-2 text-gray-600 text-sm">
                              <Phone className="mr-1 w-4 h-4" />
                              <span>{agent.phone}</span>
                            </div>
                          )}

                          {agent.email && (
                            <div className="flex justify-center items-center mb-3 text-gray-600 text-sm">
                              <Mail className="mr-1 w-4 h-4" />
                              <span className="truncate">{agent.email}</span>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            View Profile
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {hasMoreAgents && activeTab === "agents" && (
                    <div className="flex justify-center mt-8">
                      <Button
                        variant="outline"
                        onClick={handleLoadMoreAgents}
                        disabled={loading}
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          "Load More Agents"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

            {/* Agencies Section */}
            {(activeTab === "all" || activeTab === "agencies") &&
              agencies.length > 0 && (
                <div className="mb-10">
                  {activeTab === "all" && (
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-semibold text-xl">Agencies</h2>
                      <Button
                        variant="link"
                        onClick={() => setActiveTab("agencies")}
                      >
                        View All Agencies
                      </Button>
                    </div>
                  )}

                  <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {agencies.map((agency) => (
                      <Link
                        to={`/agency/${agency.uid}`}
                        key={agency.uid}
                        className="bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden transition-shadow"
                      >
                        <div className="p-6 text-center">
                          <div className="mx-auto mb-4 rounded-full w-24 h-24 overflow-hidden">
                            <img
                              src={agency.pfp || "/default-avatar.png"}
                              alt={`${agency.firstName} ${agency.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="mb-1 font-semibold text-lg">
                            {agency.firstName} {agency.lastName}
                          </h3>
                          <p className="mb-2 text-gray-600 text-sm">
                            Real Estate Agency
                          </p>

                          {agency.phone && (
                            <div className="flex justify-center items-center mb-2 text-gray-600 text-sm">
                              <Phone className="mr-1 w-4 h-4" />
                              <span>{agency.phone}</span>
                            </div>
                          )}

                          {agency.email && (
                            <div className="flex justify-center items-center mb-3 text-gray-600 text-sm">
                              <Mail className="mr-1 w-4 h-4" />
                              <span className="truncate">{agency.email}</span>
                            </div>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            View Agency
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {hasMoreAgencies && activeTab === "agencies" && (
                    <div className="flex justify-center mt-8">
                      <Button
                        variant="outline"
                        onClick={handleLoadMoreAgencies}
                        disabled={loading}
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          "Load More Agencies"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
          </>
        )}
      </div>
    </>
  );
}
