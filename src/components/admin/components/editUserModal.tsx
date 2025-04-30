import { useZustand } from "@/lib/zustand";
import {
  Badge,
  Building,
  Building2,
  Edit,
  Globe,
  Loader2,
  Mail,
  Phone,
  Save,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";

import { fireDataBase, fireStorage } from "@/lib/firebase";
import { toast } from "react-toastify";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Subscription, USER } from "@/lib/typeDefinitions";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectTrigger } from "@radix-ui/react-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AgentEditModal({
  user,
  setAgentToEdit,
}: {
  user: USER;
  setAgentToEdit: (user: USER | null) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {});
  const [formData, setFormData] = useState<USER>({
    status: "Active",
    uid: user.uid || "",
    licenseNumber: user?.licenseNumber || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    pfp: user?.pfp || "",
    agentType: user?.agentType || "",
    email: user?.email || "",
    phone: user?.phone || "",
    website: user?.website || "",
    companyName: user?.companyName || "",
    businessType: user?.businessType || "",
    businessRegistrationNumber: user?.businessRegistrationNumber || "",
    specialties: user?.specialties || [],
    languages: user?.languages || [],
    social: {
      linkedin: user?.social?.linkedin || "",
      twitter: user?.social?.twitter || "",
    },
    address: user?.address || "",
    city: user?.city || "",
    termsAccepted: true,
    subscription: user.subscription,
    enquiries: null,
    views: 0,
    experience: "",
    authProvider: user?.authProvider || "",
  });
  const specialtyOptions = [
    "Residential",
    "Family Homes",
    "Suburbs",
    "Tourism Properties",
    "Vacation Homes",
    "Land",
    "Luxury Homes",
    "International Clients",
    "Investment Properties",
    "Affordable Housing",
    "Rentals",
    "First-time Buyers",
    "Commercial",
  ].sort(); // Sort alphabetically and remove duplicates

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle nested social media fields
    if (name.startsWith("social.")) {
      const socialField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        social: {
          ...prev.social,
          [socialField]: value,
        },
      }));
    } else {
      // Handle other fields as before
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      businessType: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const agencyRef = doc(fireDataBase, "agents", user?.uid);
      await updateDoc(agencyRef, {
        ...formData,
        specialties: formData.specialties, // Make sure specialties are included
      });

      setIsEditing(false);
      toast.success("Profile updated successfully!");
      setAgentToEdit(null);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddSpecialty = (value: string) => {
    if (!formData.specialties.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, value],
      }));
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((item) => item !== specialty),
    }));
  };
  const handleClose = () => {
    if (!loading) {
      setAgentToEdit(null);
    }
  };
  // Add these types to your type definitions
  type SubscriptionPlan = {
    plan: "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE";
    isActive: boolean;
    listingUsed: number;
    listingTotal: number;
  };

  const subscriptionPlans: Subscription[] = [
    {
      plan: "FREE",
      isActive: true,
      listingsUsed: formData.subscription.listingsUsed || 0,
      listingsTotal: 3,
      agentsUsed: 0,
      agentsTotal: 0,
      renewalDate: Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ),
    },
    {
      plan: "BASIC",
      isActive: true,
      listingsUsed: formData.subscription.listingsUsed || 0,
      listingsTotal: 10,
      agentsUsed: formData.subscription.agentsUsed || 0,
      agentsTotal: 0,
      renewalDate: Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ),
    },
    {
      plan: "PREMIUM",
      isActive: true,
      listingsUsed: formData.subscription.listingsUsed || 0,
      listingsTotal: 25,
      agentsUsed: formData.subscription.agentsUsed || 0,
      agentsTotal: 0,
      renewalDate: Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ),
    },
    {
      plan: "ENTERPRISE",
      isActive: true,
      listingsUsed: formData.subscription.listingsUsed || 0,
      listingsTotal: 100,
      agentsUsed: formData.subscription.agentsUsed || 0,
      agentsTotal: 0,
      renewalDate: Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ),
    },
  ];

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="w-full h-full">
          <Card className="shadow-lg mx-auto rounded-lg w-full overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center space-y-0 bg-gray-50 p-6">
              <CardTitle className="font-bold text-gray-800 text-2xl">
                Agent Profile
              </CardTitle>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      <X className="mr-2 w-4 h-4" />
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      <Save className="mr-2 w-4 h-4" />
                      Save Changes{" "}
                      {loading && (
                        <>
                          <Loader2 className="mx-1 animate-spin" />{" "}
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="gap-8 grid grid-cols-1 lg:grid-cols-2">
                {/* Company Information */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="companyName"
                        className="font-medium text-gray-700 text-sm"
                      >
                        Company Name
                      </label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Company Name"
                        className="w-full"
                        aria-label="Company Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="businessType"
                        className="font-medium text-gray-700 text-sm"
                      >
                        Business Type
                      </label>
                      <Select
                        value={formData.businessType}
                        onValueChange={handleSelectChange}
                        aria-label="Business Type"
                      >
                        <SelectTrigger id="businessType" className="w-full">
                          <SelectValue placeholder="Business Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REAL_ESTATE">
                            Real Estate
                          </SelectItem>
                          <SelectItem value="PROPERTY_MANAGEMENT">
                            Property Management
                          </SelectItem>
                          <SelectItem value="BROKER">Broker</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="subscription"
                        className="font-medium text-gray-700 text-sm"
                      >
                        Subscription Plan
                      </label>
                      {isEditing && (
                        <Select
                          value={formData.subscription?.plan || ""}
                          onValueChange={(value) => {
                            const selectedPlan = subscriptionPlans.find(
                              (plan) => plan.plan === value
                            );
                            if (selectedPlan) {
                              setFormData((prev) => ({
                                ...prev,
                                subscription: selectedPlan,
                              }));
                            }
                          }}
                          aria-label="Subscription Plan"
                        >
                          <SelectTrigger id="subscription" className="w-full">
                            Select Plan to change
                            <SelectValue placeholder="Select a subscription plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {subscriptionPlans.map((plan) => (
                              <SelectItem
                                key={plan.plan}
                                value={plan.plan}
                                className="flex justify-between items-center"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {plan.plan}
                                  </span>
                                  <span className="text-gray-500 text-sm">
                                    {plan.listingsTotal} Listings,{" "}
                                    {plan.agentsTotal} Agents
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {/* Display current subscription details if one is selected */}
                      {formData.subscription && (
                        <div className="bg-gray-50 mt-4 p-4 rounded-md">
                          <h4 className="mb-2 font-medium text-gray-700 text-sm">
                            Current Subscription Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Plan:</span>
                              <span className="font-medium">
                                {formData.subscription.plan}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span
                                className={`font-medium ${
                                  formData.subscription.isActive
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {formData.subscription.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Listings:</span>
                              <span className="font-medium">
                                {formData.subscription.listingsUsed} /{" "}
                                {formData.subscription.listingsTotal}
                              </span>
                            </div>
                            <div className="bg-gray-200 mt-2 rounded-full w-full h-2.5">
                              <div
                                className="bg-green-600 rounded-full h-2.5"
                                style={{
                                  width: `${
                                    (formData.subscription.listingsUsed /
                                      formData.subscription.listingsTotal) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            {user.userType !== "agents" && (
                              <>
                                <div className="bg-gray-200 mt-2 rounded-full w-full h-2.5">
                                  <div
                                    className="bg-blue-600 rounded-full h-2.5"
                                    style={{
                                      width: `${
                                        (formData.subscription.listingsUsed /
                                          formData.subscription.listingsTotal) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Agents:</span>
                                  <span className="font-medium">
                                    {formData.subscription.agentsUsed} /{" "}
                                    {formData.subscription.agentsTotal}
                                  </span>
                                </div>
                              </>
                            )}

                            <div className="flex justify-between mt-2">
                              <span className="text-gray-600">
                                Renewal Date:
                              </span>
                              <span className="font-medium">
                                {formData.subscription.renewalDate
                                  .toDate()
                                  .toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Description */}
                  <div className="space-y-2">
                    <CompanyCard agencyId={user.agency} />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <div className="bg-white shadow-sm p-6 border rounded-lg">
                    {isEditing ? (
                      // In the Contact Information section:
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="font-medium text-gray-700 text-sm"
                          >
                            Email Address
                          </label>
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            type="email"
                            aria-label="Email Address"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="phone"
                            className="font-medium text-gray-700 text-sm"
                          >
                            Phone Number
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Phone"
                            type="tel"
                            aria-label="Phone Number"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="website"
                            className="font-medium text-gray-700 text-sm"
                          >
                            Website
                          </label>
                          <Input
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleInputChange}
                            placeholder="Website"
                            type="url"
                            aria-label="Website URL"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="linkedin"
                            className="font-medium text-gray-700 text-sm"
                          >
                            LinkedIn Profile
                          </label>
                          <Input
                            id="linkedin"
                            name="social.linkedin"
                            value={formData.social.linkedin}
                            onChange={handleInputChange}
                            placeholder="LinkedIn Profile URL"
                            type="url"
                            aria-label="LinkedIn Profile URL"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700 text-sm">
                            {user?.email}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700 text-sm">
                            {user?.phone}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-gray-500" />
                          <a
                            href={user?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline"
                          >
                            {user?.website}
                          </a>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-gray-500" />
                          <a
                            href={user?.social?.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline"
                          >
                            {user?.social?.linkedin}
                          </a>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-gray-500" />
                          <a
                            href={user?.social?.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline"
                          >
                            {user?.social?.twitter}
                          </a>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="font-medium text-gray-700 text-sm">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {user?.agentType}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Location Information */}
                  <div className="bg-white shadow-sm p-6 border rounded-lg">
                    <h4 className="mb-4 font-medium text-lg">Location</h4>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="address"
                            className="font-medium text-gray-700 text-sm"
                          >
                            Address
                          </label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Address"
                            aria-label="Address"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="city"
                            className="font-medium text-gray-700 text-sm"
                          >
                            City
                          </label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="City"
                            aria-label="City"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <Building className="mt-1 mr-3 w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-gray-700 text-sm">
                            {user?.address}
                          </p>
                          <p className="text-gray-700 text-sm capitalize">
                            {user?.city}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
const AgentPfpAndNameCard = ({
  isEditing,
  formData,
  setFormData,
}: {
  isEditing: boolean;
  formData: USER;
  setFormData: React.Dispatch<React.SetStateAction<USER>>;
}) => {
  const { user, setUser } = useZustand();
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleProfilePicture = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || !e.target.files[0]) return;

    try {
      setUploading(true);
      const file = e.target.files[0];
      console.log(user);
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      // Create a reference to the profile picture with user's ID
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.uid}-${Date.now()}.${fileExt}`;
      const storageRef = ref(
        fireStorage,
        `profile-pictures/${user?.uid}/${fileName}`
      );

      // Upload file
      const uploadTask = await uploadBytes(storageRef, file, {
        customMetadata: {
          uploadedBy: user?.uid, // Add metadata about who uploaded
          uploadedAt: new Date().toISOString(),
        },
      });

      // Get download URL
      const downloadURL = await getDownloadURL(uploadTask.ref);

      // Update user profile in Firestore
      const userRef = doc(fireDataBase, "agents", user?.uid);

      await updateDoc(userRef, {
        pfp: downloadURL,
      });

      // Update local user state
      setUser({
        ...user,
        pfp: downloadURL,
      });
      setFormData({ ...formData, pfp: downloadURL });
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 bg-white p-4 border rounded-lg">
      {/* Profile Picture */}
      <div className="relative">
        <div className="bg-gray-100 rounded-full w-24 h-24 overflow-hidden">
          {formData.pfp ? (
            <img
              src={formData.pfp}
              alt={`${formData.firstName} ${formData.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex justify-center items-center bg-gray-200 w-full h-full">
              <span className="font-semibold text-gray-500 text-2xl">
                {formData.firstName?.[0]}
                {formData.lastName?.[0]}
              </span>
            </div>
          )}

          {/* Upload overlay when editing */}
          {isEditing && (
            <div className="absolute inset-0 flex justify-center items-center">
              <label
                className="bg-black bg-opacity-50 hover:bg-opacity-70 p-2 rounded-full text-white transition-all cursor-pointer"
                htmlFor="profile-picture"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Edit className="w-5 h-5" />
                )}
              </label>
              <input
                type="file"
                id="profile-picture"
                className="hidden"
                accept="image/*"
                onChange={handleProfilePicture}
                disabled={uploading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Name and Title */}
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              className="w-full"
            />
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              className="w-full"
            />
            <Input
              name="agentType"
              value={formData.agentType}
              onChange={handleInputChange}
              placeholder="Agent Type"
              className="w-full"
            />
            <Input
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              placeholder="License Number"
              className="w-full"
            />
          </div>
        ) : (
          <>
            <h2 className="font-semibold text-gray-900 text-xl">
              {formData.firstName} {formData.lastName}
            </h2>
            <p className="mt-1 text-gray-500 text-sm capitalize">
              {formData.agentType?.replace(/_/g, " ")}
            </p>
            <p className="mt-1 text-gray-500 text-sm">
              License No: {formData.licenseNumber}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// Add this component within AgentProfile.tsx
const CompanyCard = ({ agencyId }: { agencyId: string }) => {
  const [agencyData, setAgencyData] = useState<USER | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgencyData = async () => {
      try {
        const agencyRef = await doc(fireDataBase, "agencies", agencyId);
        const agencySnap = await getDoc(agencyRef);
        if (agencySnap.exists()) {
          setAgencyData(agencySnap.data() as USER);
        }
      } catch (error) {
        console.error("Error fetching agency data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (agencyId) {
      fetchAgencyData();
    }
  }, [agencyId]);

  if (loading) {
    return (
      <div className="bg-white shadow-sm p-6 border rounded-lg">
        <div className="space-y-4 animate-pulse">
          <div className="bg-gray-200 rounded w-3/4 h-4"></div>
          <div className="bg-gray-200 rounded w-1/2 h-4"></div>
          <div className="bg-gray-200 rounded w-2/3 h-4"></div>
        </div>
      </div>
    );
  }

  if (!agencyData) {
    return (
      <div className="bg-white shadow-sm p-6 border rounded-lg">
        <p className="text-gray-500">No company information available</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm p-6 border rounded-lg">
      <h1 className="mb-5 font-semibold text-gray-900 text-2xl">Agency</h1>
      <div className="space-y-6">
        {/* Company Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-900 text-xl">
              {agencyData.companyName}
            </h3>
            <p className="mt-1 text-gray-500 text-sm">
              {agencyData.businessType?.replace(/_/g, " ")}
            </p>
          </div>
          <Building2 className="w-6 h-6 text-gray-400" />
        </div>

        {/* Company Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-gray-600 text-sm">
              Reg. No: {agencyData.businessRegistrationNumber}
            </span>
          </div>
          {agencyData.companyDescription && (
            <div className="pt-4 border-t">
              <p className="text-gray-600 text-sm leading-relaxed">
                {agencyData.companyDescription}
              </p>
            </div>
          )}

          {(agencyData.address || agencyData.city) && (
            <div className="flex items-start space-x-3 pt-4 border-t">
              <Building className="mt-0.5 w-5 h-5 text-gray-500" />
              <div className="text-gray-600 text-sm">
                {agencyData.address && <p>{agencyData.address}</p>}
                {agencyData.city && (
                  <p className="capitalize">{agencyData.city}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
