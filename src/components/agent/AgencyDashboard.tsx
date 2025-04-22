import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Plus,
  Settings,
  CreditCard,
  BarChart2,
  List,
  Grid,
  User,
  LogOut,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Building,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { useZustand } from "@/lib/zustand";
import {
  arrayUnion,
  collection,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import debounce from "lodash.debounce";
import checkAuth from "@/helpers/checkAuth";
import { LISTING, USER } from "@/lib/typeDefinitions";

const AgencyDashboard = () => {
  const { user, setUser } = useZustand();
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [agentView, setAgentView] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agents, setAgents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Add this function to fetch agent data
  const fetchAgentData = async (agentRefs) => {
    try {
      const agentPromises = agentRefs.map(async ({ ref, position }) => {
        const agentDoc = await getDoc(ref);
        if (agentDoc.exists()) {
          return {
            uid: agentDoc.id,
            ...(agentDoc.data() as USER),
            position,
          } as USER;
        }
        return null;
      });

      const resolvedAgents = (await Promise.all(agentPromises)).filter(
        (agent) => agent !== null
      );
      setAgents(resolvedAgents);
    } catch (error) {
      console.error("Error fetching agent data:", error);
      setFetchError("Failed to load agents");
    }
  };

  // Add this function to fetch property data
  const fetchPropertyData = async (propertyRefs) => {
    try {
      const propertyPromises = propertyRefs.map(async ({ ref, postedBy }) => {
        const propertyDoc = await getDoc(ref);
        if (propertyDoc.exists()) {
          return {
            uid: propertyDoc.id,
            ...(propertyDoc.data() as LISTING),
            postedBy,
          } as LISTING;
        }
        return null;
      });

      const resolvedProperties = (await Promise.all(propertyPromises)).filter(
        (property) => property !== null
      );
      setProperties(resolvedProperties);
    } catch (error) {
      console.error("Error fetching property data:", error);
      setFetchError("Failed to load properties");
    }
  };

  // Replace your existing useEffect with this updated version
  useEffect(() => {
    const isUserValid = checkAuth();
    if (!isUserValid) {
      navigate("/");
      return;
    }

    if (!user?.uid) return;

    const fetchData = async () => {
      setIsLoadingData(true);
      setFetchError(null);

      try {
        // Set up real-time listener for agency data
        const agencyRef = doc(fireDataBase, "agencies", user.uid);
        const unsubscribe = onSnapshot(
          agencyRef,
          async (doc) => {
            if (doc.exists()) {
              const data = doc.data();

              // Update user data
              setUser({
                uid: doc.id,
                ...data,
              } as USER);

              // Fetch agents and properties data
              if (data.myAgents) {
                await fetchAgentData(data.myAgents);
              }
              if (data.myListings) {
                await fetchPropertyData(data.myListings);
              }

              setIsLoadingData(false);
            }
          },
          (error) => {
            console.error("Error fetching agency data:", error);
            setFetchError("Failed to load agency data");
            setIsLoadingData(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error("Error in data fetching:", error);
        setFetchError("Failed to load data");
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [user?.uid]);

  // Add a loading state component
  const LoadingState = () => (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-realtyplus" />
        <p className="text-gray-500">Loading dashboard data...</p>
      </div>
    </div>
  );

  // Add error state component
  const ErrorState = ({ message }) => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <p className="text-red-500">{message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    </div>
  );

  // Filter agents based on search term and status
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mock subscription data
  const subscription = {
    plan: user?.subscription.plan || "",
    agentsTotal: 10,
    agentsUsed: 5,
    listingsTotal: 100,
    listingsUsed: 38,
    renewalDate: new Date(
      Date.now() + 25 * 24 * 60 * 60 * 1000
    ).toLocaleDateString(),
    isActive: true,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Agency Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your agency, agents, and properties
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button className="bg-realtyplus hover:bg-realtyplus-dark">
              <Link
                to="/list-property"
                className="flex items-center text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add New Property
              </Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" /> Add Agent
                </Button>
              </DialogTrigger>
              <AddAgentDialog />
            </Dialog>
          </div>
        </div>
        {isLoadingData ? (
          <LoadingState />
        ) : fetchError ? (
          <ErrorState message={fetchError} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {user?.myAgents?.length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {user?.myListings?.length || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    +1 from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{user.totalSales}</div>
                  <p className="text-xs text-green-500 mt-1">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Inquiries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {properties.reduce(
                      (sum, prop) => sum + prop.inquiries,
                      0
                    ) || 0}
                  </div>
                  <p className="text-xs text-green-500 mt-1">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <div className="lg:col-span-3">
                <Tabs defaultValue="agents" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="agents">My Agents</TabsTrigger>
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="agents" className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1 w-full md:max-w-sm">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input
                            type="search"
                            placeholder="Search agents..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Select
                          value={statusFilter}
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex space-x-2">
                          <Button
                            variant={
                              agentView === "grid" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setAgentView("grid")}
                          >
                            <Grid className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={
                              agentView === "list" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setAgentView("list")}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {agentView === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAgents.map((agent) => (
                          <Card
                            key={agent.id}
                            className="overflow-y-auto flex flex-col justify-between items-stretch group"
                          >
                            <CardContent className="p-0 h-full flex flex-col justify-between items-stretch">
                              <div className="bg-black/10 p-4 flex justify-between items-start">
                                <div className="flex items-center">
                                  <img
                                    src={agent.pfp}
                                    alt={agent.firstName}
                                    className="w-12 h-12 rounded-full mr-3"
                                  />
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {`${agent.firstName} ${agent.lastName}`}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      {agent.role}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  className={`${
                                    agent.status === "active"
                                      ? "bg-green-100 text-green-800 group-hover:bg-green-800 group-hover:text-green-100"
                                      : "bg-gray-100 text-gray-800"
                                  } `}
                                >
                                  {agent.status === "active"
                                    ? "Active"
                                    : "Inactive"}
                                </Badge>
                              </div>
                              <div className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center text-sm">
                                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-gray-600">
                                      {agent.email}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-gray-600">
                                      {agent.phone}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Building className="h-4 w-4 text-gray-500 mr-2" />
                                    <span className="text-gray-600">
                                      {agent.myListings?.length || 0} listings
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-4 flex justify-between">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Joined
                                    </p>
                                    <p className="text-sm">
                                      {agent.createdAt
                                        .toDate()
                                        .toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Sales
                                    </p>
                                    <p className="text-sm font-semibold text-realtyplus">
                                      {agent.sales}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <CardFooter className="border-t mt-auto p-4 flex justify-between">
                                <Button variant="outline" size="sm">
                                  <User className="h-4 w-4 mr-1" /> Profile
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                      Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Mail className="h-4 w-4 mr-2" /> Email
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </CardFooter>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredAgents.map((agent) => (
                          <Card key={agent.id} className="overflow-hidden">
                            <div className="flex flex-col sm:flex-row">
                              <div className="p-4 flex items-center sm:w-64 bg-gray-50">
                                <img
                                  src={agent.pfp}
                                  alt={agent.firstName}
                                  className="w-10 h-10 rounded-full mr-3"
                                />
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {`${agent.firstName} ${agent.lastName}`}
                                  </h3>
                                  <p className="text-xs text-gray-500">
                                    {agent.role}
                                  </p>
                                </div>
                              </div>
                              <CardContent className="flex-1 p-4">
                                <div className="flex justify-between">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                    <div>
                                      <p className="text-xs text-gray-500">
                                        Email
                                      </p>
                                      <p className="text-sm truncate max-w-[180px]">
                                        {agent.email}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">
                                        Phone
                                      </p>
                                      <p className="text-sm">{agent.phone}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">
                                        Listings
                                      </p>
                                      <p className="text-sm">
                                        {agent.myListings?.length || 0}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">
                                        Sales
                                      </p>
                                      <p className="text-sm font-semibold text-realtyplus">
                                        {agent.sales}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <Badge
                                      className={`${
                                        agent.status === "active"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-800"
                                      } ml-2`}
                                    >
                                      {agent.status === "active"
                                        ? "Active"
                                        : "Inactive"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="mt-3 flex justify-end space-x-2">
                                  <Button variant="outline" size="sm">
                                    <User className="h-4 w-4 mr-1" /> Profile
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Mail className="h-4 w-4 mr-2" /> Email
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />{" "}
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="properties" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">
                        Agency Properties
                      </h2>
                      <div className="flex space-x-2">
                        <Button
                          variant={view === "grid" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setView("grid")}
                        >
                          <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={view === "list" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setView("list")}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {view === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {properties.map((property) => (
                          <Card key={property.id} className="overflow-hidden">
                            <div className="relative h-48">
                              <img
                                src={property.image}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">
                                {property.status}
                              </div>
                              <div className="absolute top-2 left-2 bg-realtyplus text-white px-2 py-1 rounded text-xs font-medium">
                                {property.type}
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                {property.title}
                              </h3>
                              <p className="text-gray-500 text-sm mb-2">
                                {property.location}
                              </p>
                              <p className="font-bold text-realtyplus mb-3">
                                {property.price}
                              </p>
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>{property.views} views</span>
                                <span>{property.inquiries} inquiries</span>
                              </div>
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm text-gray-500">
                                  Listed by: {property.agent}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {properties.map((property) => (
                          <Card key={property.id} className="overflow-hidden">
                            <div className="flex flex-col sm:flex-row">
                              <div className="sm:w-48 h-32 sm:h-auto">
                                <img
                                  src={property.image}
                                  alt={property.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <CardContent className="flex-1 p-4">
                                <div className="flex justify-between">
                                  <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                      {property.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-2">
                                      {property.location}
                                    </p>
                                    <p className="font-bold text-realtyplus">
                                      {property.price}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                      Listed by: {property.agent}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span
                                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                        property.status === "Active"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {property.status}
                                    </span>
                                    <p className="text-gray-500 text-sm mt-2">
                                      {property.views} views
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                      {property.inquiries} inquiries
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 flex space-x-2">
                                  <Button variant="outline" size="sm">
                                    Edit
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Delete
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    View
                                  </Button>
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="analytics">
                    <Card>
                      <CardHeader>
                        <CardTitle>Agency Analytics</CardTitle>
                        <CardDescription>
                          View performance metrics for your agency
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-lg font-medium mb-2">
                              Monthly Performance
                            </h3>
                            <div className="h-[200px] w-full bg-gray-100 flex items-center justify-center">
                              <p className="text-gray-500">
                                Analytics charts coming soon
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                  Top Performing Agent
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center">
                                  <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                                    alt="Top Agent"
                                    className="w-10 h-10 rounded-full mr-3"
                                  />
                                  <div>
                                    <p className="font-medium">Sarah Tembo</p>
                                    <p className="text-sm text-gray-500">
                                      12 sales this month
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                  Most Viewed Property
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="font-medium">
                                  Modern 3 Bedroom House in Kabulonga
                                </p>
                                <p className="text-sm text-gray-500">
                                  245 views this month
                                </p>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">
                                  Conversion Rate
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-2xl font-bold">8.2%</p>
                                <p className="text-sm text-green-500">
                                  +1.3% from last month
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subscription</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Plan</span>
                        <span className="font-medium">{subscription.plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <span className="text-green-600 font-medium">
                          Active
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Next Billing</span>
                        <span className="font-medium">
                          {subscription.renewalDate}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Agents Used</span>
                        <span className="font-medium">
                          {subscription.agentsUsed}/{subscription.agentsTotal}
                        </span>
                      </div>
                      <Progress
                        value={
                          (subscription.agentsUsed / subscription.agentsTotal) *
                          100
                        }
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        {subscription.agentsTotal - subscription.agentsUsed}{" "}
                        agent slots remaining
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Listings Used</span>
                        <span className="font-medium">
                          {subscription.listingsUsed}/
                          {subscription.listingsTotal}
                        </span>
                      </div>
                      <Progress
                        value={
                          (subscription.listingsUsed /
                            subscription.listingsTotal) *
                          100
                        }
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        {subscription.listingsTotal - subscription.listingsUsed}{" "}
                        listings remaining
                      </p>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Link
                        to="/agent/subscription"
                        className="flex items-center w-full justify-center"
                      >
                        <CreditCard className="mr-2 h-4 w-4" /> Manage
                        Subscription
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <nav className="space-y-2">
                      <Link
                        to="/list-property"
                        className="flex items-center text-gray-700 hover:text-realtyplus py-2"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add New Property
                      </Link>
                      <Link
                        to="/agency/profile"
                        className="flex items-center text-gray-700 hover:text-realtyplus py-2"
                      >
                        <Building className="mr-2 h-4 w-4" /> Agency Profile
                      </Link>
                      <Link
                        to="/agency/settings"
                        className="flex items-center text-gray-700 hover:text-realtyplus py-2"
                      >
                        <Settings className="mr-2 h-4 w-4" /> Account Settings
                      </Link>
                      <Link
                        to="/agency/reports"
                        className="flex items-center text-gray-700 hover:text-realtyplus py-2"
                      >
                        <BarChart2 className="mr-2 h-4 w-4" /> Reports
                      </Link>
                      <Link
                        to="/"
                        className="flex items-center text-gray-700 hover:text-realtyplus py-2"
                      >
                        <Home className="mr-2 h-4 w-4" /> View Website
                      </Link>
                      <Link
                        to="/logout"
                        className="flex items-center text-gray-700 hover:text-realtyplus py-2"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </Link>
                    </nav>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

interface Agent {
  id: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}
const AddAgentDialog = () => {
  const { user: agency } = useZustand();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [addedAgents, setAddedAgents] = useState<
    { agent: Agent; position: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Only fetch added agents on mount
  useEffect(() => {
    fetchAddedAgents();
  }, []);

  const fetchAddedAgents = async () => {
    setIsFetching(true);
    try {
      const agencyRef = doc(fireDataBase, "agencies", agency.uid);
      const agencyDoc = await getDoc(agencyRef);

      if (agencyDoc.exists() && agencyDoc.data().myAgents) {
        const myAgents = agencyDoc.data().myAgents;
        const agentPromises = myAgents.map(
          async (agentData: { ref: DocumentReference; position: string }) => {
            const agentDoc = await getDoc(agentData.ref);
            if (agentDoc.exists()) {
              return {
                agent: { id: agentDoc.id, ...agentDoc.data() } as Agent,
                position: agentData.position,
              };
            }
            return null;
          }
        );

        const resolvedAgents = (await Promise.all(agentPromises)).filter(
          (agent) => agent !== null
        );
        setAddedAgents(resolvedAgents);
      }
    } catch (err) {
      console.error("Error fetching added agents:", err);
      setError("Failed to fetch added agents");
    } finally {
      setIsFetching(false);
    }
  };

  const fetchAgents = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setAgents([]);
      return;
    }

    setIsFetching(true);
    setError(null);
    try {
      const agentsRef = collection(fireDataBase, "agents");
      const searchLower = searchQuery.toLowerCase();

      // Create compound queries for multiple fields
      const [emailResults, firstNameResults, lastNameResults, phoneResults] =
        await Promise.all([
          getDocs(
            query(
              agentsRef,
              where("email", ">=", searchLower),
              where("email", "<=", searchLower + "\uf8ff"),
              limit(5) // Limit results per field
            )
          ),
          getDocs(
            query(
              agentsRef,
              where("firstName", ">=", searchLower),
              where("firstName", "<=", searchLower + "\uf8ff"),
              limit(5)
            )
          ),
          getDocs(
            query(
              agentsRef,
              where("lastName", ">=", searchLower),
              where("lastName", "<=", searchLower + "\uf8ff"),
              limit(5)
            )
          ),
          getDocs(
            query(
              agentsRef,
              where("phone", ">=", searchQuery),
              where("phone", "<=", searchQuery + "\uf8ff"),
              limit(5)
            )
          ),
        ]);

      const agentsMap = new Map();

      // Filter out already added agents while combining results
      [emailResults, firstNameResults, lastNameResults, phoneResults].forEach(
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const isAlreadyAdded = addedAgents.some(
              ({ agent }) => agent.id === doc.id
            );

            if (!agentsMap.has(doc.id) && !isAlreadyAdded) {
              agentsMap.set(doc.id, { id: doc.id, ...doc.data() });
            }
          });
        }
      );

      setAgents(Array.from(agentsMap.values()) as Agent[]);
    } catch (err) {
      setError("Failed to fetch agents");
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSearch = debounce((searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.length >= 2) {
      // Only search if at least 2 characters
      fetchAgents(searchValue);
    } else {
      setAgents([]); // Clear results if search term is too short
    }
  }, 500);

  const handleAddAgent = async () => {
    if (!selectedAgentId || !selectedRole) {
      setError("Please select an agent and role");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const agencyRef = doc(fireDataBase, "agencies", agency.uid);
      const agentRef = doc(fireDataBase, "agents", selectedAgentId);

      await updateDoc(agencyRef, {
        myAgents: arrayUnion({
          ref: agentRef,
          position: selectedRole,
        }),
      });

      // Refresh added agents list
      await fetchAddedAgents();

      // Reset selection and search
      setSelectedAgentId(null);
      setSelectedRole("");
      setSearchTerm("");
      setAgents([]);
      setSuccess("Agent added successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add agent");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[800px]">
      <DialogHeader>
        <DialogTitle>Add New Agent</DialogTitle>
        <DialogDescription>
          Search and select an agent to add to your agency.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Added Agents Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Current Agency Agents</h3>
          {isFetching ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : addedAgents.length > 0 ? (
            <div className="space-y-2">
              {addedAgents.map(({ agent, position }) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{`${agent.firstName} ${agent.lastName}`}</span>
                    <span className="text-gray-500 text-sm">{agent.email}</span>
                  </div>
                  <Badge>{position}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No agents added yet</p>
          )}
        </div>

        {/* Search Input */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search by name, email, or phone... (min. 2 characters)"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
          </div>
          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <p className="text-sm text-gray-500">
              Please enter at least 2 characters to search
            </p>
          )}
        </div>

        {/* Search Results */}
        {isFetching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : searchTerm.length >= 2 && agents.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No agents found</div>
        ) : agents.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Select
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {agents.map((agent) => (
                  <tr
                    key={agent.id}
                    className={`hover:bg-gray-50 ${
                      selectedAgentId === agent.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="radio"
                        name="selectedAgent"
                        checked={selectedAgentId === agent.id}
                        onChange={() => setSelectedAgentId(agent.id)}
                        className="rounded-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      {`${agent.firstName} ${agent.lastName}`}
                    </td>
                    <td className="px-4 py-2">{agent.email}</td>
                    <td className="px-4 py-2">{agent.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Role Selection */}
        {selectedAgentId && (
          <div className="flex items-center space-x-4">
            <Label htmlFor="role">Assign Role:</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="senior">Senior Agent</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="junior">Junior Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 text-green-600 p-2 rounded text-sm">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-2 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          onClick={handleAddAgent}
          disabled={isLoading || !selectedAgentId || !selectedRole}
          className="bg-realtyplus hover:bg-realtyplus-dark"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add to Agency"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AgencyDashboard;
