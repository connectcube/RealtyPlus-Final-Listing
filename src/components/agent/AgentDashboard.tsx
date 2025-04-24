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
import Header from "../layout/Header";

const AgentDashboard = () => {
  const { user, setUser } = useZustand();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [properties, setProperties] = useState([]);
  const LoadingState = ({ message = "Loading dashboard data..." }) => (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 text-realtyplus animate-spin" />
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
  // Add error state component
  const ErrorState = ({ message }) => (
    <div className="flex justify-center items-center h-64">
      <div className="space-y-4 text-center">
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
    <>
      <Header />
      <div className="mx-auto px-4 md:px-6 py-6 container">
        <div className="flex md:flex-row flex-col md:justify-between md:items-center mb-6">
          <div>
            <h1 className="font-bold text-gray-900 text-2xl">
              Agent Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your properties and subscription
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
            <div className="gap-6 grid grid-cols-1 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-medium text-gray-500 text-sm">
                    Total Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-3xl">
                    {user.myListings.length || 0}
                  </div>
                  {/*<p className="mt-1 text-gray-500 text-xs">+2 from last month</p>*/}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="font-medium text-gray-500 text-sm">
                    Total Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-3xl">{user.views}</div>
                  {/*<p className="mt-1 text-green-500 text-xs">+15% from last month</p>*/}
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
                    {user.enquiries || 5}
                  </div>
                  <p className="mt-1 text-green-500 text-xs">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="gap-6 grid grid-cols-1 lg:grid-cols-4 mb-6">
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
                      <h2 className="font-semibold text-xl">My Properties</h2>
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
                          <Card key={property.id} className="overflow-hidden">
                            <div className="relative h-48">
                              <img
                                src={property.images[property.coverPhotoIndex]}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="top-2 right-2 absolute bg-white px-2 py-1 rounded font-medium text-xs">
                                {property.status}
                              </div>
                              <div className="top-2 left-2 absolute bg-realtyplus px-2 py-1 rounded font-medium text-white text-xs">
                                {property.type}
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="mb-1 font-semibold text-gray-900 truncate">
                                {property.title}
                              </h3>
                              <p className="mb-2 text-gray-500 text-sm">
                                {property.location}
                              </p>
                              <p className="mb-3 font-bold text-realtyplus">
                                {property.price}
                              </p>
                              <div className="flex justify-between text-gray-500 text-sm">
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
                            <div className="flex sm:flex-row flex-col">
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
                                    <h3 className="mb-1 font-semibold text-gray-900">
                                      {property.title}
                                    </h3>
                                    <p className="mb-2 text-gray-500 text-sm">
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
                                    <p className="mt-2 text-gray-500 text-sm">
                                      {property.views} views
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                      {property.inquiries} inquiries
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2 mt-3">
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
                        <span className="font-medium text-green-600">
                          Active
                        </span>
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
                      <p className="text-gray-500 text-xs">
                        {user.subscription.listingsTotal -
                          user.subscription.listingsUsed}{" "}
                        listings remaining this month
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
                        to="/agent/profile"
                        className="flex items-center py-2 text-gray-700 hover:text-realtyplus"
                      >
                        <User className="mr-2 w-4 h-4" /> Edit Profile and
                        Settings
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
      </div>
    </>
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
        <div className="relative w-24 h-24">
          <img
            src={user.pfp || "https://via.placeholder.com/96"}
            alt="Profile"
            className="rounded-full w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="right-0 bottom-0 absolute"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>
        <div>
          <h2 className="font-semibold text-xl">
            {`${formData.firstName} ${formData.lastName}`}
          </h2>
          <p className="text-gray-500">Real Estate Agent</p>
        </div>
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Personal Information</h3>
          <div className="space-y-2">
            <div>
              <label htmlFor="firstName" className="text-gray-500 text-sm">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 border rounded-md w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="text-gray-500 text-sm">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 border rounded-md w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="text-gray-500 text-sm">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 border rounded-md w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-gray-500 text-sm">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 border rounded-md w-full"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Professional Information</h3>
          <div className="space-y-2">
            <div>
              <label htmlFor="licenseNumber" className="text-gray-500 text-sm">
                License Number
              </label>
              <input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 border rounded-md w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="agency" className="text-gray-500 text-sm">
                Agency
              </label>
              <input
                id="agency"
                name="agency"
                type="text"
                value={formData.agency}
                onChange={handleInputChange}
                className="mt-1 px-3 py-2 border rounded-md w-full"
                required
              />
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="bio" className="text-gray-500 text-sm">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          className="px-3 py-2 border rounded-md w-full"
          placeholder="Tell potential clients about yourself..."
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Social Links</h3>
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
          <div>
            <label htmlFor="linkedin" className="text-gray-500 text-sm">
              LinkedIn
            </label>
            <input
              id="linkedin"
              name="social.linkedin"
              type="url"
              value={formData.social.linkedin}
              onChange={handleInputChange}
              className="mt-1 px-3 py-2 border rounded-md w-full"
            />
          </div>
          <div>
            <label htmlFor="twitter" className="text-gray-500 text-sm">
              Twitter
            </label>
            <input
              id="twitter"
              name="social.twitter"
              type="url"
              value={formData.social.twitter}
              onChange={handleInputChange}
              className="mt-1 px-3 py-2 border rounded-md w-full"
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
