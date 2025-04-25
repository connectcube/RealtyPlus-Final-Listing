import { useZustand } from "@/lib/zustand";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { fireDataBase, fireStorage } from "@/lib/firebase";
import { toast } from "react-toastify";
import Header from "../layout/Header";
import { USER } from "@/lib/typeDefinitions";
import { LoadingSpinner } from "../globalScreens/Loader";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function AgentProfile() {
  const { user, setUser } = useZustand();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<USER>({
    status: "Active",
    uid: user?.uid || "",
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
    subscription: null,
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

      setUser({ ...user, ...formData });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
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

  return (
    <div className="w-full h-full">
      <Header />
      <Card className="shadow-lg mx-auto mt-4 rounded-lg w-full max-w-7xl overflow-hidden">
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
                {isEditing ? (
                  <>
                    <Input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Company Name"
                      className="w-full"
                    />
                    <Select
                      value={formData.businessType}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Business Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                        <SelectItem value="PROPERTY_MANAGEMENT">
                          Property Management
                        </SelectItem>
                        <SelectItem value="BROKER">Broker</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* Specialties Section */}
                    <div className="bg-white shadow-sm p-6 border rounded-lg">
                      <h4 className="mb-4 font-medium text-lg">Specialties</h4>
                      {isEditing ? (
                        <div className="space-y-4">
                          <Select onValueChange={handleAddSpecialty}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Add a specialty" />
                            </SelectTrigger>
                            <SelectContent>
                              {specialtyOptions.map((specialty) => (
                                <SelectItem
                                  key={specialty}
                                  value={specialty}
                                  disabled={formData.specialties.includes(
                                    specialty
                                  )}
                                >
                                  {specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <h1 className="w-full font-semibold text-xl">
                              Specialties
                            </h1>
                            {formData.specialties.map((specialty) => (
                              <span
                                key={specialty}
                                className="flex items-center gap-2 bg-slate-400/5 px-3 py-1 rounded"
                              >
                                {specialty}

                                <button
                                  onClick={() =>
                                    handleRemoveSpecialty(specialty)
                                  }
                                  className="text-black hover:text-gray-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {user?.specialties?.map((specialty) => (
                            <Badge key={specialty}>{specialty}</Badge>
                          ))}
                          {(!user?.specialties ||
                            user.specialties.length === 0) && (
                            <p className="text-gray-500 text-sm">
                              No specialties added
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <AgentPfpAndNameCard
                      isEditing={isEditing}
                      formData={formData}
                      setFormData={setFormData}
                    />
                    <div className="flex flex-wrap gap-2 capitalize">
                      Agent Type: {user?.agentType?.replace(/_/g, " ")}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <h1 className="w-full font-semibold text-xl">
                        Specialties
                      </h1>
                      {formData.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="flex items-center gap-2 bg-slate-400/5 px-3 py-1 rounded"
                        >
                          {specialty}

                          {isEditing && (
                            <button
                              onClick={() => handleRemoveSpecialty(specialty)}
                              className="text-black hover:text-gray-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">
                      License No: {user?.licenseNumber}
                    </p>
                  </>
                )}
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
                  <div className="space-y-4">
                    <AgentPfpAndNameCard
                      isEditing={isEditing}
                      formData={formData}
                      setFormData={setFormData}
                    />
                    <Input
                      name="position"
                      value={formData.agentType}
                      onChange={handleInputChange}
                      placeholder="Position"
                    />
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      type="email"
                    />
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone"
                    />
                    <Input
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="Website"
                    />{" "}
                    <Input
                      name="social.linkedin"
                      value={formData.social.linkedin}
                      onChange={handleInputChange}
                      placeholder="LinkedIn Profile URL"
                    />
                    <Input
                      name="social.twitter"
                      value={formData.social.twitter}
                      onChange={handleInputChange}
                      placeholder="Twitter Profile URL"
                    />
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
                      <p className="text-gray-600 text-sm">{user?.agentType}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Information */}
              <div className="bg-white shadow-sm p-6 border rounded-lg">
                <h4 className="mb-4 font-medium text-lg">Location</h4>
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Address"
                    />
                    <Input
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                    />
                  </div>
                ) : (
                  <div className="flex items-start">
                    <Building className="mt-1 mr-3 w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-gray-700 text-sm">{user?.address}</p>
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
