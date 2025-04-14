import React, { FormEvent, useEffect, useState } from "react";
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
  Loader2,
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
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { formatFirebaseTimestamp } from "@/helpers/firebaseTimestampConversion";
import { LISTING, USER } from "@/lib/typeDefinitions";
import { toast } from "react-toastify";

const AgentDashboard = () => {
  const { user, setUser } = useZustand();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [properties, setProperties] = useState([]);
  const LoadingState = ({ message = "Loading dashboard data..." }) => (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-realtyplus" />
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
  // Add error state component
  const ErrorState = ({ message }) => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-4">
        <p className="text-red-500">
          {message || "An error occurred while loading the dashboard"}
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-realtyplus hover:bg-realtyplus-dark text-white"
        >
          Retry
        </Button>
      </div>
    </div>
  );
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
  useEffect(() => {
    if (!user?.uid) return;

    const agencyRef = doc(fireDataBase, "agents", user.uid);
    const unsubscribe = onSnapshot(agencyRef, async (doc) => {
      if (doc.exists()) {
        const data = doc.data();

        // Update user data
        setUser({
          uid: doc.id,
          ...data,
        } as USER);
        if (data.myListings) {
          await fetchPropertyData(data.myListings);
        }

        setIsLoadingData(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

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
      {!user ? (
        <LoadingState message="Loading user data..." />
      ) : isLoadingData ? (
        <LoadingState />
      ) : fetchError ? (
        <ErrorState message={fetchError} />
      ) : (
        <>
          {" "}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {user.myListings.length || 0}
                </div>
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
                <p className="text-xs text-green-500 mt-1">
                  +8% from last month
                </p>
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
                      <Button>
                        <Link to="/agent/profile">Visit Profile</Link>
                      </Button>
                      {/*<ProfileForm
                        user={user}
                        onUpdateSuccess={() => {
                          // Handle successful update (e.g., show a toast notification)
                          toast.success("Profile updated successfully");
                        }}
                      />*/}
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
                      <span className="font-medium capitalize">
                        {user.subscription.plan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Next Billing</span>
                      <span className="font-medium">
                        {user.subscription &&
                          formatFirebaseTimestamp(
                            user.subscription.renewalDate
                          )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Listings Used</span>
                      <span className="font-medium">
                        {user.subscription.listingsUsed}/
                        {user.subscription.listingsTotal}
                      </span>
                    </div>
                    <Progress
                      value={
                        (user.subscription.listingsUsed /
                          user.subscription.listingsTotal) *
                        100
                      }
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500">
                      {user.subscription.listingsTotal -
                        user.subscription.listingsUsed}{" "}
                      listings remaining this month
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
                      to="/agent/profile"
                      className="flex items-center text-gray-700 hover:text-realtyplus py-2"
                    >
                      <User className="mr-2 h-4 w-4" /> Edit Profile and
                      Settings
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
    </div>
  );
};

/*interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  agency: string;
  bio: string;
  social: {
    linkedin: string;
    twitter: string;
  };
}
const ProfileForm = ({ user, onUpdateSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
    licenseNumber: user.licenseNumber || "",
    agency: user.agency || "",
    bio: user.bio || "",
    social: {
      linkedin: user.social?.linkedin || "",
      twitter: user.social?.twitter || "",
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userRef = doc(fireDataBase, "agents", user.uid);
      const flattenedData = {
        ...formData,
        "social.linkedin": formData.social.linkedin,
        "social.twitter": formData.social.twitter,
      };
      delete flattenedData.social;
      await updateDoc(userRef, flattenedData);
      onUpdateSuccess?.();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="relative h-24 w-24">
          <img
            src={user.pfp || "https://via.placeholder.com/96"}
            alt="Profile"
            className="rounded-full object-cover w-full h-full"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute bottom-0 right-0"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {`${formData.firstName} ${formData.lastName}`}
          </h2>
          <p className="text-gray-500">Real Estate Agent</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Personal Information</h3>
          <div className="space-y-2">
            <div>
              <label htmlFor="firstName" className="text-sm text-gray-500">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm text-gray-500">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm text-gray-500">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-sm text-gray-500">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Professional Information</h3>
          <div className="space-y-2">
            <div>
              <label htmlFor="licenseNumber" className="text-sm text-gray-500">
                License Number
              </label>
              <input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="agency" className="text-sm text-gray-500">
                Agency
              </label>
              <input
                id="agency"
                name="agency"
                type="text"
                value={formData.agency}
                onChange={handleInputChange}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm text-gray-500">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Tell potential clients about yourself..."
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="linkedin" className="text-sm text-gray-500">
              LinkedIn
            </label>
            <input
              id="linkedin"
              name="social.linkedin"
              type="url"
              value={formData.social.linkedin}
              onChange={handleInputChange}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label htmlFor="twitter" className="text-sm text-gray-500">
              Twitter
            </label>
            <input
              id="twitter"
              name="social.twitter"
              type="url"
              value={formData.social.twitter}
              onChange={handleInputChange}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setFormData({
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email || "",
              phone: user.phone || "",
              licenseNumber: user.licenseNumber || "",
              agency: user.agency || "",
              bio: user.bio || "",
              social: {
                linkedin: user.social?.linkedin || "",
                twitter: user.social?.twitter || "",
              },
            })
          }
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-realtyplus hover:bg-realtyplus-dark"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};*/

export default AgentDashboard;
