import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ref, deleteObject, listAll } from "firebase/storage";
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
  deleteDoc,
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
import { fireDataBase, fireStorage } from "@/lib/firebase";
import debounce from "lodash.debounce";
import checkAuth from "@/helpers/checkAuth";
import { LISTING, USER } from "@/lib/typeDefinitions";
import { toast } from "react-toastify";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
      const propertyPromises = propertyRefs.map(async ({ ref }) => {
        const propertyDoc = await getDoc(ref);
        if (propertyDoc.exists()) {
          return {
            uid: propertyDoc.id,
            ...(propertyDoc.data() as LISTING),
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
  const fetchListingPoster = async (posterRef) => {
    const docSnap = await getDoc(posterRef);
    if (docSnap.exists()) {
      return docSnap.data() as USER;
    }
    return null;
  };
  // Add logic to fetch listing poster data in the useEffect
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
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 text-realtyplus animate-spin" />
        <p className="text-gray-500">Loading dashboard data...</p>
      </div>
    </div>
  );

  // Add error state component
  const ErrorState = ({ message }) => (
    <div className="flex justify-center items-center h-64">
      <div className="space-y-4 text-center">
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
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Header />
      <main className="flex-grow mx-auto px-4 md:px-6 py-6 container">
        <div className="flex md:flex-row flex-col md:justify-between md:items-center mb-6">
          <div>
            <h1 className="font-bold text-gray-900 text-2xl">
              Agency Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your agency, agents, and properties
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <Button className="bg-realtyplus hover:bg-realtyplus-dark">
              <Link
                to="/list-property"
                className="flex items-center text-white"
              >
                <Plus className="mr-2 w-4 h-4" /> Add New Property
              </Link>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <UserPlus className="mr-2 w-4 h-4" /> Add Agent
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
            <div className="gap-6 grid grid-cols-1 md:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-medium text-gray-500 text-sm">
                    Total Agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-3xl">
                    {user?.myAgents?.length || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-medium text-gray-500 text-sm">
                    Total Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-3xl">
                    {user?.myListings?.length || 0}
                  </div>
                  <p className="mt-1 text-gray-500 text-xs">
                    +1 from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-medium text-gray-500 text-sm">
                    Total Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-3xl">{user.totalSales}</div>
                  <p className="mt-1 text-green-500 text-xs">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-medium text-gray-500 text-sm">
                    Total Inquiries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-3xl">
                    {properties.reduce(
                      (sum, prop) => sum + prop.inquiries,
                      0
                    ) || 0}
                  </div>
                  <p className="mt-1 text-green-500 text-xs">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="gap-6 grid grid-cols-1 lg:grid-cols-4 mb-6">
              <div className="lg:col-span-3">
                <Tabs defaultValue="agents" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="agents">My Agents</TabsTrigger>
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="agents" className="space-y-4">
                    <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4">
                      <div className="flex-1 w-full md:max-w-sm">
                        <div className="relative">
                          <Search className="top-2.5 left-2.5 absolute w-4 h-4 text-gray-500" />
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
                            <Filter className="mr-2 w-4 h-4" />
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
                            <Grid className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={
                              agentView === "list" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setAgentView("list")}
                          >
                            <List className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {agentView === "grid" ? (
                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAgents.map((agent) => (
                          <Card
                            key={agent.id}
                            className="group flex flex-col justify-between items-stretch overflow-y-auto"
                          >
                            <CardContent className="flex flex-col justify-between items-stretch p-0 h-full">
                              <div className="flex justify-between items-start bg-black/10 p-4">
                                <div className="flex items-center">
                                  <img
                                    src={agent.pfp}
                                    alt={agent.firstName}
                                    className="mr-3 rounded-full w-12 h-12"
                                  />
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {`${agent.firstName} ${agent.lastName}`}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
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
                                    <Mail className="mr-2 w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">
                                      {agent.email}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Phone className="mr-2 w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">
                                      {agent.phone}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Building className="mr-2 w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">
                                      {agent.myListings?.length || 0} listings
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between mt-4">
                                  <div>
                                    <p className="text-gray-500 text-xs">
                                      Joined
                                    </p>
                                    <p className="text-sm">
                                      {agent.createdAt
                                        .toDate()
                                        .toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-xs">
                                      Sales
                                    </p>
                                    <p className="font-semibold text-realtyplus text-sm">
                                      {agent.sales}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <CardFooter className="flex justify-between mt-auto p-4 border-t">
                                <Button variant="outline" size="sm">
                                  <User className="mr-1 w-4 h-4" /> Profile
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                      Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 w-4 h-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Mail className="mr-2 w-4 h-4" /> Email
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="mr-2 w-4 h-4" /> Delete
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
                            <div className="flex sm:flex-row flex-col">
                              <div className="flex items-center bg-gray-50 p-4 sm:w-64">
                                <img
                                  src={agent.pfp}
                                  alt={agent.firstName}
                                  className="mr-3 rounded-full w-10 h-10"
                                />
                                <div>
                                  <h3 className="font-semibold text-gray-900">
                                    {`${agent.firstName} ${agent.lastName}`}
                                  </h3>
                                  <p className="text-gray-500 text-xs">
                                    {agent.role}
                                  </p>
                                </div>
                              </div>
                              <CardContent className="flex-1 p-4">
                                <div className="flex justify-between">
                                  <div className="flex-1 gap-4 grid grid-cols-2 md:grid-cols-4">
                                    <div>
                                      <p className="text-gray-500 text-xs">
                                        Email
                                      </p>
                                      <p className="max-w-[180px] text-sm truncate">
                                        {agent.email}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-xs">
                                        Phone
                                      </p>
                                      <p className="text-sm">{agent.phone}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-xs">
                                        Listings
                                      </p>
                                      <p className="text-sm">
                                        {agent.myListings?.length || 0}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-xs">
                                        Sales
                                      </p>
                                      <p className="font-semibold text-realtyplus text-sm">
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
                                <div className="flex justify-end space-x-2 mt-3">
                                  <Button variant="outline" size="sm">
                                    <User className="mr-1 w-4 h-4" /> Profile
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Edit className="mr-1 w-4 h-4" /> Edit
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Mail className="mr-2 w-4 h-4" /> Email
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">
                                        <Trash2 className="mr-2 w-4 h-4" />{" "}
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
                      <h2 className="font-semibold text-xl">
                        Agency Properties
                      </h2>
                      <div className="flex space-x-2">
                        <Button
                          variant={view === "grid" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setView("grid")}
                        >
                          <Grid className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={view === "list" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setView("list")}
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {view === "grid" ? (
                      <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {properties.map((property) => (
                          <>
                            <Card
                              key={property.uid}
                              className="overflow-hidden"
                            >
                              <div className="relative h-48">
                                <img
                                  src={
                                    property.images[property.coverPhotoIndex]
                                  }
                                  alt={property.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="top-2 right-2 absolute bg-white px-2 py-1 rounded font-medium text-xs capitalize">
                                  {property.status}
                                </div>
                                <div className="top-2 left-2 absolute bg-realtyplus px-2 py-1 rounded font-medium text-white text-xs">
                                  {property.listingType}
                                </div>
                              </div>
                              <CardContent className="p-4">
                                <h3 className="mb-1 font-semibold text-gray-900 truncate">
                                  {property.title}
                                </h3>
                                <p className="mb-2 text-gray-500 text-sm">
                                  {property.address}
                                </p>
                                <p className="mb-3 font-bold text-realtyplus">
                                  {property.price}
                                </p>
                                <div className="flex justify-between text-gray-500 text-sm">
                                  <span>{property.viewCount} views</span>
                                  <span>{property.inquiries} inquiries</span>
                                </div>
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-gray-500 text-sm">
                                    Listed by:{" "}
                                    {property.postedByDetails.firstName}{" "}
                                    {property.postedByDetails.lastName}
                                  </p>
                                </div>
                                <div className="flex space-x-2 mt-3">
                                  <Button variant="outline" size="sm">
                                    <Link to={`/edit-property/${property.uid}`}>
                                      Edit
                                    </Link>
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Delete
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                  >
                                    <Link to={`/property/${property.uid}`}>
                                      View
                                    </Link>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                            <DeleteListingDialog
                              isOpen={isDeleteDialogOpen}
                              onClose={() => setIsDeleteDialogOpen(false)}
                              listingId={property.uid}
                            />
                          </>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {properties.map((property) => (
                          <>
                            <Card key={property.id} className="overflow-hidden">
                              <div className="flex sm:flex-row flex-col">
                                <div className="sm:w-48 h-32 sm:h-auto">
                                  <img
                                    src={
                                      property.images[property.coverPhotoIndex]
                                    }
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <CardContent className="flex-1 p-4">
                                  <div className="flex justify-between">
                                    <div>
                                      <h3 className="mb-1 font-semibold text-gray-900">
                                        {property.title}
                                      </h3>
                                      <p className="mb-2 text-gray-500 text-sm">
                                        {property.address}
                                      </p>
                                      <p className="font-bold text-realtyplus">
                                        {property.price}
                                      </p>
                                      <p className="mt-2 text-gray-500 text-sm">
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
                                      <p className="mt-2 text-gray-500 text-sm">
                                        {property.viewCount} views
                                      </p>
                                      <p className="text-gray-500 text-sm">
                                        {property.inquiries} inquiries
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2 mt-3">
                                    <Button variant="outline" size="sm">
                                      <Link
                                        to={`/edit-property/${property.uid}`}
                                      >
                                        Edit
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setIsDeleteDialogOpen(true)
                                      }
                                    >
                                      Delete
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Link to={`/property/${property.uid}`}>
                                        View
                                      </Link>
                                    </Button>
                                  </div>
                                </CardContent>
                              </div>
                            </Card>
                            <DeleteListingDialog
                              isOpen={isDeleteDialogOpen}
                              onClose={() => setIsDeleteDialogOpen(false)}
                              listingId={property.uid}
                            />
                          </>
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
                            <h3 className="mb-2 font-medium text-lg">
                              Monthly Performance
                            </h3>
                            <div className="flex justify-center items-center bg-gray-100 w-full h-[200px]">
                              <p className="text-gray-500">
                                Analytics charts coming soon
                              </p>
                            </div>
                          </div>

                          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="font-medium text-sm">
                                  Top Performing Agent
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center">
                                  <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                                    alt="Top Agent"
                                    className="mr-3 rounded-full w-10 h-10"
                                  />
                                  <div>
                                    <p className="font-medium">Sarah Tembo</p>
                                    <p className="text-gray-500 text-sm">
                                      12 sales this month
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="font-medium text-sm">
                                  Most Viewed Property
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="font-medium">
                                  Modern 3 Bedroom House in Kabulonga
                                </p>
                                <p className="text-gray-500 text-sm">
                                  245 views this month
                                </p>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="font-medium text-sm">
                                  Conversion Rate
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="font-bold text-2xl">8.2%</p>
                                <p className="text-green-500 text-sm">
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
                        <span className="font-medium text-green-600">
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
                      <p className="text-gray-500 text-xs">
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
                      <p className="text-gray-500 text-xs">
                        {subscription.listingsTotal - subscription.listingsUsed}{" "}
                        listings remaining
                      </p>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Link
                        to="/agent/subscription"
                        className="flex justify-center items-center w-full"
                      >
                        <CreditCard className="mr-2 w-4 h-4" /> Manage
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
                        className="flex items-center py-2 text-gray-700 hover:text-realtyplus"
                      >
                        <Plus className="mr-2 w-4 h-4" /> Add New Property
                      </Link>
                      <Link
                        to="/agency/profile"
                        className="flex items-center py-2 text-gray-700 hover:text-realtyplus"
                      >
                        <Building className="mr-2 w-4 h-4" /> Agency Profile
                      </Link>
                      <Link
                        to="/agency/settings"
                        className="flex items-center py-2 text-gray-700 hover:text-realtyplus"
                      >
                        <Settings className="mr-2 w-4 h-4" /> Account Settings
                      </Link>
                      <Link
                        to="/agency/reports"
                        className="flex items-center py-2 text-gray-700 hover:text-realtyplus"
                      >
                        <BarChart2 className="mr-2 w-4 h-4" /> Reports
                      </Link>
                      <Link
                        to="/"
                        className="flex items-center py-2 text-gray-700 hover:text-realtyplus"
                      >
                        <Home className="mr-2 w-4 h-4" /> View Website
                      </Link>
                      <Link
                        to="/logout"
                        className="flex items-center py-2 text-gray-700 hover:text-realtyplus"
                      >
                        <LogOut className="mr-2 w-4 h-4" /> Logout
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
        <div className="p-4 border rounded-lg">
          <h3 className="mb-2 font-semibold">Current Agency Agents</h3>
          {isFetching ? (
            <div className="flex justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : addedAgents.length > 0 ? (
            <div className="space-y-2">
              {addedAgents.map(({ agent, position }) => (
                <div
                  key={agent.id}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{`${agent.firstName} ${agent.lastName}`}</span>
                    <span className="text-gray-500 text-sm">{agent.email}</span>
                  </div>
                  <Badge>{position}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No agents added yet</p>
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
            <p className="text-gray-500 text-sm">
              Please enter at least 2 characters to search
            </p>
          )}
        </div>

        {/* Search Results */}
        {isFetching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : searchTerm.length >= 2 && agents.length === 0 ? (
          <div className="py-4 text-gray-500 text-center">No agents found</div>
        ) : agents.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 font-medium text-gray-500 text-sm text-left">
                    Select
                  </th>
                  <th className="px-4 py-2 font-medium text-gray-500 text-sm text-left">
                    Name
                  </th>
                  <th className="px-4 py-2 font-medium text-gray-500 text-sm text-left">
                    Email
                  </th>
                  <th className="px-4 py-2 font-medium text-gray-500 text-sm text-left">
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
          <div className="bg-green-50 p-2 rounded text-green-600 text-sm">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 p-2 rounded text-red-600 text-sm">
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
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
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

interface DeleteListingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
}

const DeleteListingDialog = ({
  isOpen,
  onClose,
  listingId,
}: DeleteListingDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!listingId) return;

    try {
      setIsDeleting(true);

      // 1. First get the listing data to get image URLs
      const listingRef = doc(fireDataBase, "listings", listingId);
      const listingDoc = await getDoc(listingRef);

      if (listingDoc.exists()) {
        const listingData = listingDoc.data();

        // 2. Delete images one by one if they exist
        if (listingData.images && Array.isArray(listingData.images)) {
          await Promise.all(
            listingData.images.map(async (imageUrl: string) => {
              try {
                // Convert URL to storage reference
                const imageRef = ref(
                  fireStorage,
                  getStoragePathFromURL(imageUrl)
                );
                await deleteObject(imageRef);
              } catch (error) {
                console.warn(`Failed to delete image: ${imageUrl}`, error);
                // Continue with other deletions even if one fails
              }
            })
          );
        }

        // 3. Delete the listing document
        await deleteDoc(listingRef);

        toast.success("Listing deleted successfully");
        onClose();
        navigate("/agency/dashboard");
      } else {
        throw new Error("Listing not found");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to get storage path from URL
  const getStoragePathFromURL = (url: string) => {
    try {
      // Extract the path from the Firebase Storage URL
      const baseURL =
        "https://firebasestorage.googleapis.com/v0/b/realtyplus-listings.appspot.com/o/";
      const storagePath = url.replace(baseURL, "");
      const pathWithoutQuery = storagePath.split("?")[0];
      return decodeURIComponent(pathWithoutQuery);
    } catch (error) {
      console.error("Error parsing storage URL:", error);
      return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="z-50 fixed inset-0 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      {/* Dialog */}
      <div className="flex justify-center items-end sm:items-center p-4 sm:p-0 min-h-full text-center">
        <div className="relative bg-white shadow-xl sm:my-8 rounded-lg sm:w-full sm:max-w-lg overflow-hidden text-left transition-all transform">
          <div className="bg-white sm:p-6 px-4 pt-5 pb-4 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {/* Warning Icon */}
              <div className="flex flex-shrink-0 justify-center items-center bg-red-100 mx-auto sm:mx-0 rounded-full w-12 sm:w-10 h-12 sm:h-10">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-left text-center">
                <h3 className="font-semibold text-gray-900 text-lg leading-6">
                  Delete Listing
                </h3>
                <div className="mt-2">
                  <p className="text-gray-500 text-sm">
                    Are you sure you want to delete this listing? This action
                    cannot be undone and will permanently remove the listing and
                    all associated images.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="sm:flex sm:flex-row-reverse bg-gray-50 px-4 sm:px-6 py-3">
            <button
              type="button"
              className="inline-flex justify-center bg-red-600 hover:bg-red-500 shadow-sm sm:ml-3 px-3 py-2 rounded-md w-full sm:w-auto font-semibold text-white text-sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <svg
                    className="mr-3 -ml-1 w-5 h-5 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </button>
            <button
              type="button"
              className="inline-flex justify-center bg-white hover:bg-gray-50 shadow-sm mt-3 sm:mt-0 px-3 py-2 rounded-md ring-1 ring-gray-300 ring-inset w-full sm:w-auto font-semibold text-gray-900 text-sm"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;
