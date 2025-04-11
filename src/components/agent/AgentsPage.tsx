import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Mail, Phone, Filter, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
} from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { USER } from "@/lib/typeDefinitions";

// Mock agent data
const mockAgents = [
  {
    id: "1",
    name: "John Mwanza",
    email: "john.mwanza@realtyzambia.com",
    phone: "+260 97 1234567",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    role: "Senior Agent",
    agency: "RealtyPlus Zambia",
    location: "Lusaka, Zambia",
    bio: "Experienced real estate agent specializing in luxury properties in Lusaka. Over 10 years of experience in the Zambian property market.",
    listings: 12,
    specialties: ["Luxury Homes", "Commercial", "Investment Properties"],
    languages: ["English", "Bemba", "Nyanja"],
    rating: 4.8,
    reviews: 24,
  },
  {
    id: "2",
    name: "Mary Banda",
    email: "mary.banda@realtyzambia.com",
    phone: "+260 97 7654321",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mary",
    role: "Agent",
    agency: "Zambia Homes",
    location: "Kitwe, Zambia",
    bio: "Dedicated real estate professional focusing on residential properties in the Copperbelt region. Committed to finding the perfect home for every client.",
    listings: 8,
    specialties: ["Residential", "First-time Buyers", "Rentals"],
    languages: ["English", "Bemba"],
    rating: 4.6,
    reviews: 15,
  },
  {
    id: "3",
    name: "David Phiri",
    email: "david.phiri@realtyzambia.com",
    phone: "+260 97 9876543",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    role: "Junior Agent",
    agency: "Copperbelt Properties",
    location: "Ndola, Zambia",
    bio: "Energetic new agent with a fresh perspective on the Zambian real estate market. Specializing in affordable housing solutions.",
    listings: 3,
    specialties: ["Affordable Housing", "Land", "Rentals"],
    languages: ["English", "Bemba", "Tonga"],
    rating: 4.2,
    reviews: 5,
  },
  {
    id: "4",
    name: "Sarah Tembo",
    email: "sarah.tembo@realtyzambia.com",
    phone: "+260 97 5678901",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    role: "Senior Agent",
    agency: "RealtyPlus Zambia",
    location: "Lusaka, Zambia",
    bio: "Award-winning real estate agent with expertise in high-end properties and international clients. Providing exceptional service since 2010.",
    listings: 15,
    specialties: [
      "Luxury Homes",
      "International Clients",
      "Investment Properties",
    ],
    languages: ["English", "French", "Nyanja"],
    rating: 4.9,
    reviews: 32,
  },
  {
    id: "5",
    name: "Michael Zulu",
    email: "michael.zulu@realtyzambia.com",
    phone: "+260 97 2345678",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    role: "Agent",
    agency: "Livingstone Realty",
    location: "Livingstone, Zambia",
    bio: "Specialized in tourism and vacation properties in Livingstone and Victoria Falls area. Helping investors find the perfect tourism opportunity.",
    listings: 10,
    specialties: ["Tourism Properties", "Vacation Homes", "Land"],
    languages: ["English", "Tonga"],
    rating: 4.7,
    reviews: 18,
  },
  {
    id: "6",
    name: "Grace Mutale",
    email: "grace.mutale@realtyzambia.com",
    phone: "+260 97 8765432",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
    role: "Agent",
    agency: "Zambia Homes",
    location: "Lusaka, Zambia",
    bio: "Passionate about helping families find their dream homes. Specializing in residential properties in Lusaka's growing suburbs.",
    listings: 9,
    specialties: ["Residential", "Family Homes", "Suburbs"],
    languages: ["English", "Nyanja", "Bemba"],
    rating: 4.5,
    reviews: 14,
  },
];

const AgentsPage = () => {
  const [agents, setAgents] = useState<USER[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const AGENTS_PER_PAGE = 6;

  // Add this for accessibility
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const agentsRef = collection(fireDataBase, "agents");
        const q = query(
          agentsRef,
          orderBy("firstName"),
          limit(AGENTS_PER_PAGE)
        );
        const snapshot = await getDocs(q);
        const agentData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAgents(agentData as USER[]);

        // Get total count for pagination
        const totalSnapshot = await getDocs(collection(fireDataBase, "agents"));
        const totalAgents = totalSnapshot.size;
        setTotalPages(Math.ceil(totalAgents / AGENTS_PER_PAGE));

        setStatusMessage(
          `Page ${currentPage} of ${Math.ceil(totalAgents / AGENTS_PER_PAGE)}`
        );
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [currentPage]); // Add currentPage as dependency

  // Filter agents based on search term and filters
  const filteredAgents = agents.filter(
    (agent) =>
      `${agent.firstName} ${agent.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.companyName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Extract unique locations for filter
  const locations = [
    "all",
    ...new Set(agents.map((agent) => agent.city || "").filter(Boolean)),
  ];
  const PaginationControls = () => {
    return (
      <div
        className="flex justify-center items-center gap-2 mt-8"
        role="navigation"
        aria-label="Pagination"
      >
        <Button
          variant="outline"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || loading}
          aria-label="Previous page"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {[...Array(totalPages)].map((_, index) => (
            <Button
              key={index + 1}
              variant={currentPage === index + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(index + 1)}
              disabled={loading}
              aria-label={`Page ${index + 1}`}
              aria-current={currentPage === index + 1 ? "page" : undefined}
            >
              {index + 1}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || loading}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Our Professional Real Estate Agents
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with our experienced agents who are ready to help you find
            your perfect property in Zambia. Our agents have in-depth knowledge
            of the local market and are committed to providing exceptional
            service.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Search agents by name, agency, or expertise..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location === "all" ? "All Locations" : location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              {/*<SelectContent>
                {agent.specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty === "all" ? "All Specialties" : specialty}
                  </SelectItem>
                ))}
              </SelectContent>*/}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading ? (
            filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="bg-realtyplus/10 p-6 flex flex-col items-center text-center">
                  <img
                    src={agent.pfp}
                    alt={`${agent.firstName} ${agent.lastName}`}
                    className="w-24 h-24 rounded-full mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-900">
                    {`${agent.firstName} ${agent.lastName}`}
                  </h3>
                  <p className="text-gray-600 capitalize">
                    Type: {agent.agentType}
                  </p>
                  <div className="flex items-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(agent.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-4 line-clamp-3">{agent.bio}</p>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-realtyplus mr-2 mt-0.5" />
                      <span className="text-gray-700">{agent.address}</span>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-realtyplus mr-2 mt-0.5" />
                      <span className="text-gray-700">{agent.email}</span>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-realtyplus mr-2 mt-0.5" />
                      <span className="text-gray-700">{agent.phone}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Specialties:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {agent.specialties &&
                        agent.specialties.map((specialty, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gray-100"
                          >
                            {specialty}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Languages:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {agent.languages &&
                        agent.languages.map((language, index) => (
                          <Badge key={index} variant="outline">
                            {language}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-6 border-t">
                  <div className="w-full flex flex-col sm:flex-row gap-3">
                    <Button className="flex-1 bg-realtyplus hover:bg-realtyplus-dark">
                      <Link
                        to={`/agent/${agent.id}`}
                        className="text-white w-full"
                      >
                        View Profile
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Link
                        to={`/agents/${agent.id}/properties`}
                        className="w-full"
                      >
                        View Listings ({agent.myListings.length})
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full h-full flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-realtyplus" />
            </div>
          )}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No agents found matching your criteria.
            </p>
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm("");
                setLocationFilter("all");
                setSpecialtyFilter("all");
              }}
              className="mt-2"
            >
              Clear all filters
            </Button>
          </div>
        )}
        {filteredAgents.length > 0 && <PaginationControls />}
        <div className="mt-12 bg-realtyplus/5 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Join Our Team of Professional Agents
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Are you a real estate professional looking to grow your career? Join
            our network of agents and gain access to exclusive listings,
            marketing tools, and a supportive community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-realtyplus hover:bg-realtyplus-dark">
              <Link to="/agent/signup" className="text-white">
                Register as Agent
              </Link>
            </Button>
            <Button variant="outline">
              <Link to="/agency/signup">Register as Agency</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AgentsPage;
