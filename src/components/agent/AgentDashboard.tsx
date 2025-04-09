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
  LogOut,
  Camera,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { useZustand } from "@/lib/zustand";

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
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=75",
  },
];

const AgentDashboard = () => {
  const { user } = useZustand();
  const [view, setView] = useState<"grid" | "list">("grid");

  // Mock subscription data
  const subscription = {
    plan: user.subscription.plan,
    listingsTotal: user.subscription.listingsTotal,
    listingsUsed: user.subscription.listingsUsed,
    renewalDate: new Date(
      Date.now() + 25 * 24 * 60 * 60 * 1000
    ).toLocaleDateString(),
    isActive: user.subscription.status,
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600">
            Manage your properties and subscription
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button className="bg-realtyplus hover:bg-realtyplus-dark">
            <Link to="/list-property" className="flex items-center text-white">
              <Plus className="mr-2 h-4 w-4" /> Add New Property
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.myListings.length}</div>
            {/*<p className="text-xs text-gray-500 mt-1">+2 from last month</p>*/}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.views}</div>
            {/*<p className="text-xs text-green-500 mt-1">+15% from last month</p>*/}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{user.enquiries || 5}</div>
            <p className="text-xs text-green-500 mt-1">+8% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="properties">My Properties</TabsTrigger>
              <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">My Properties</h2>
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

            <TabsContent value="inquiries">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Inquiries</CardTitle>
                  <CardDescription>
                    Manage inquiries from potential buyers and renters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    No inquiries to display at this time.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Property Analytics</CardTitle>
                  <CardDescription>
                    View performance metrics for your listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Analytics dashboard coming soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Profile</CardTitle>
                  <CardDescription>
                    Manage your personal and professional information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Header with Avatar */}
                  <div className="flex items-center space-x-4">
                    <div className="relative h-24 w-24">
                      <img
                        src={user.pfp || "https://via.placeholder.com/96"}
                        alt="Profile"
                        className="rounded-full object-cover w-full h-full"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-0 right-0"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{`${user.firstName} ${user.lastName} `}</h2>
                      <p className="text-gray-500">Real Estate Agent</p>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        Personal Information
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-gray-500">
                            Full Name
                          </label>
                          <input
                            type="text"
                            defaultValue={`${user.firstName} ${user.lastName}`}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">
                            Email Address
                          </label>
                          <input
                            type="email"
                            defaultValue={user.email}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            defaultValue={user.phone}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        Professional Information
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm text-gray-500">
                            License Number
                          </label>
                          <input
                            type="text"
                            defaultValue={user.licenseNumber}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">
                            Agency
                          </label>
                          <input
                            type="text"
                            defaultValue={user.agency}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">
                            Years of Experience
                          </label>
                          <input
                            type="number"
                            defaultValue={user.experience}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-500">Bio</label>
                    <textarea
                      defaultValue={user.bio}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Tell potential clients about yourself..."
                    />
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          defaultValue={user.social?.linkedin}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Twitter</label>
                        <input
                          type="url"
                          defaultValue={user.social?.twitter}
                          className="w-full mt-1 px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-realtyplus hover:bg-realtyplus-dark">
                      Save Changes
                    </Button>
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
                  listings remaining this month
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
                  <User className="mr-2 h-4 w-4" /> Edit Profile
                </Link>
                <Link
                  to="/agent/settings"
                  className="flex items-center text-gray-700 hover:text-realtyplus py-2"
                >
                  <Settings className="mr-2 h-4 w-4" /> Account Settings
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
    </div>
  );
};

export default AgentDashboard;
