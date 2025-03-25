import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Plus,
  Settings,
  CreditCard,
  BarChart2,
  List,
  Grid,
  User,
  Users,
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

// Mock agent data
const mockAgents = [
  {
    id: "1",
    name: "John Mwanza",
    email: "john.mwanza@realtyzambia.com",
    phone: "+260 97 1234567",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    role: "Senior Agent",
    status: "active",
    listings: 12,
    sales: 8,
    joinDate: "2022-03-15",
  },
  {
    id: "2",
    name: "Mary Banda",
    email: "mary.banda@realtyzambia.com",
    phone: "+260 97 7654321",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mary",
    role: "Agent",
    status: "active",
    listings: 8,
    sales: 5,
    joinDate: "2022-05-20",
  },
  {
    id: "3",
    name: "David Phiri",
    email: "david.phiri@realtyzambia.com",
    phone: "+260 97 9876543",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    role: "Junior Agent",
    status: "inactive",
    listings: 3,
    sales: 1,
    joinDate: "2023-01-10",
  },
  {
    id: "4",
    name: "Sarah Tembo",
    email: "sarah.tembo@realtyzambia.com",
    phone: "+260 97 5678901",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    role: "Senior Agent",
    status: "active",
    listings: 15,
    sales: 12,
    joinDate: "2021-11-05",
  },
  {
    id: "5",
    name: "Michael Zulu",
    email: "michael.zulu@realtyzambia.com",
    phone: "+260 97 2345678",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    role: "Agent",
    status: "active",
    listings: 10,
    sales: 7,
    joinDate: "2022-08-15",
  },
];

// Mock properties data
const mockProperties = [
  {
    id: "1",
    title: "Modern 3 Bedroom House in Kabulonga",
    price: "K2,500,000",
    location: "Kabulonga, Lusaka",
    type: "For Sale",
    status: "Active",
    views: 245,
    inquiries: 12,
    agent: "John Mwanza",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=75",
  },
  {
    id: "2",
    title: "Luxury Apartment in Sunningdale",
    price: "K15,000",
    location: "Sunningdale, Lusaka",
    type: "For Rent",
    status: "Active",
    views: 187,
    inquiries: 8,
    agent: "Mary Banda",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=75",
  },
  {
    id: "3",
    title: "Commercial Space in Cairo Road",
    price: "K25,000",
    location: "Cairo Road, Lusaka",
    type: "For Rent",
    status: "Pending",
    views: 56,
    inquiries: 2,
    agent: "Sarah Tembo",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=75",
  },
  {
    id: "4",
    title: "4 Bedroom House in Ibex Hill",
    price: "K3,200,000",
    location: "Ibex Hill, Lusaka",
    type: "For Sale",
    status: "Active",
    views: 132,
    inquiries: 5,
    agent: "Michael Zulu",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=75",
  },
];

const AgencyDashboard = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [agentView, setAgentView] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter agents based on search term and status
  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mock subscription data
  const subscription = {
    plan: "Elite Package",
    agentsTotal: 10,
    agentsUsed: 5,
    listingsTotal: 100,
    listingsUsed: 38,
    renewalDate: new Date(
      Date.now() + 25 * 24 * 60 * 60 * 1000,
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
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Agent</DialogTitle>
                  <DialogDescription>
                    Create a new agent account for your agency.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Full name"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email address"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Phone number"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="senior">Senior Agent</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="junior">Junior Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-realtyplus hover:bg-realtyplus-dark"
                  >
                    Add Agent
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockAgents.length}</div>
              <p className="text-xs text-green-500 mt-1">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockProperties.length}</div>
              <p className="text-xs text-gray-500 mt-1">+1 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {mockAgents.reduce((sum, agent) => sum + agent.sales, 0)}
              </div>
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
                {mockProperties.reduce((sum, prop) => sum + prop.inquiries, 0)}
              </div>
              <p className="text-xs text-green-500 mt-1">+8% from last month</p>
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
                        variant={agentView === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAgentView("grid")}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={agentView === "list" ? "default" : "outline"}
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
                      <Card key={agent.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="bg-realtyplus/10 p-4 flex justify-between items-start">
                            <div className="flex items-center">
                              <img
                                src={agent.photo}
                                alt={agent.name}
                                className="w-12 h-12 rounded-full mr-3"
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {agent.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {agent.role}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={`${agent.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
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
                                  {agent.listings} listings
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-between">
                              <div>
                                <p className="text-xs text-gray-500">Joined</p>
                                <p className="text-sm">
                                  {new Date(
                                    agent.joinDate,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Sales</p>
                                <p className="text-sm font-semibold text-realtyplus">
                                  {agent.sales}
                                </p>
                              </div>
                            </div>
                          </div>
                          <CardFooter className="border-t p-4 flex justify-between">
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
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
                              src={agent.photo}
                              alt={agent.name}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {agent.name}
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
                                  <p className="text-xs text-gray-500">Email</p>
                                  <p className="text-sm truncate max-w-[180px]">
                                    {agent.email}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Phone</p>
                                  <p className="text-sm">{agent.phone}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Listings
                                  </p>
                                  <p className="text-sm">{agent.listings}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Sales</p>
                                  <p className="text-sm font-semibold text-realtyplus">
                                    {agent.sales}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start">
                                <Badge
                                  className={`${agent.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"} ml-2`}
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
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
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
                  <h2 className="text-xl font-semibold">Agency Properties</h2>
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
                    {mockProperties.map((property) => (
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
                    {mockProperties.map((property) => (
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
                                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${property.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
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
                    <span className="text-green-600 font-medium">Active</span>
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
                      (subscription.agentsUsed / subscription.agentsTotal) * 100
                    }
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500">
                    {subscription.agentsTotal - subscription.agentsUsed} agent
                    slots remaining
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Listings Used</span>
                    <span className="font-medium">
                      {subscription.listingsUsed}/{subscription.listingsTotal}
                    </span>
                  </div>
                  <Progress
                    value={
                      (subscription.listingsUsed / subscription.listingsTotal) *
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
                    <CreditCard className="mr-2 h-4 w-4" /> Manage Subscription
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
                    to="/agent/profile"
                    className="flex items-center text-gray-700 hover:text-realtyplus py-2"
                  >
                    <Building className="mr-2 h-4 w-4" /> Agency Profile
                  </Link>
                  <Link
                    to="/agent/settings"
                    className="flex items-center text-gray-700 hover:text-realtyplus py-2"
                  >
                    <Settings className="mr-2 h-4 w-4" /> Account Settings
                  </Link>
                  <Link
                    to="/agent/reports"
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
      </main>
      <Footer />
    </div>
  );
};

export default AgencyDashboard;
