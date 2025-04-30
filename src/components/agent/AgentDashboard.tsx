import React, { FormEvent, useEffect, useState } from "react";
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
import {
  arrayRemove,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  increment,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { fireDataBase, fireStorage } from "@/lib/firebase";
import { formatFirebaseTimestamp } from "@/helpers/firebaseTimestampConversion";
import { LISTING, USER } from "@/lib/typeDefinitions";
import { toast } from "react-toastify";
import Header from "../layout/Header";
import { deleteObject, ref } from "firebase/storage";
import { set } from "lodash";

const AgentDashboard = () => {
  const { user, setUser } = useZustand();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [properties, setProperties] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [totalViews, setTotalViews] = useState(0);
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

  interface PropertyRef {
    ref: DocumentReference;
    postedBy: DocumentReference;
  }

  const fetchPropertyData = async (propertyRefs: PropertyRef[]) => {
    try {
      const propertyPromises = propertyRefs.map(async ({ ref }) => {
        const propertyDoc = await getDoc(ref);
        if (propertyDoc.exists()) {
          const propertyData = propertyDoc.data() as LISTING;
          setTotalViews((prev) => prev + (propertyData.viewCount || 0));

          return {
            uid: propertyDoc.id,
            ...propertyData,
          } as LISTING;
        }
        return null;
      });

      const resolvedProperties = (await Promise.all(propertyPromises)).filter(
        (property): property is LISTING => property !== null
      );
      setProperties(resolvedProperties);
    } catch (error) {
      console.error("Error fetching property data:", error);
      setFetchError("Failed to load properties");
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    const agentRef = doc(fireDataBase, "agents", user.uid);
    const unsubscribe = onSnapshot(agentRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();

        // Update user data
        setUser({
          uid: docSnapshot.id,
          ...data,
          authProvider: data.authProvider || "", // Ensure required fields are present
          termsAccepted: data.termsAccepted || false,
          subscription: data.subscription || {
            listingsUsed: 0,
            plan: "",
            isActive: false,
            listingsTotal: 0,
            agentsUsed: 0,
            agentsTotal: 0,
            renewalDate: null,
          },
          status: data.status || "Active",
        } as USER);

        if (data.myListings && Array.isArray(data.myListings)) {
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
                to={
                  user.subscription.listingsUsed <
                  user.subscription.listingsTotal
                    ? "/list-property"
                    : "/subscription"
                }
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
                  <div className="font-bold text-3xl">{totalViews}</div>
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
                    {user.enquiries || 0}
                  </div>
                  <p className="mt-1 text-green-500 text-xs">
                    ( Analytics coming soon )
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
                                <div
                                  className={`${
                                    property.status === "active"
                                      ? "bg-green-200 text-green-800"
                                      : "bg-yellow-200 text-yellow-800"
                                  }  top-2 right-2 absolute bg-white px-2 py-1 rounded font-medium text-xs`}
                                >
                                  {property.status}
                                </div>
                                <div className="top-2 left-2 absolute bg-realtyplus px-2 py-1 rounded font-medium text-white text-xs capitalize">
                                  {property.listingType}
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
                                  <span>{property.viewCount} views</span>
                                  <span>{property.inquiries} inquiries</span>
                                </div>
                                <div className="flex space-x-2 mt-3">
                                  <Button variant="outline" size="sm">
                                    <Link to={`/edit-property/${property.uid}`}>
                                      Edit
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsDeleteDialogOpen(true)}
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
                                        className={`inline-block capitalize px-2 py-1 rounded text-xs font-medium ${
                                          property.status === "active"
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
        // 4. Update the user's listings array and subscription count
        await updateDoc(listingData.postedBy, {
          myListings: arrayRemove(listingRef),
          "subscription.listingsUsed": increment(-1),
        });
        toast.success("Listing deleted successfully");
        onClose();
        navigate("/agent/dashboard");
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
export default AgentDashboard;
