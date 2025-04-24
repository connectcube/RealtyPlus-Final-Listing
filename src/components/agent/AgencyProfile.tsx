import { useZustand } from "@/lib/zustand";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Badge,
  Building,
  Edit,
  Globe,
  Loader2,
  Mail,
  Phone,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
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
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function AgencyProfile() {
  const { user, setUser } = useZustand();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: user?.companyName || "",
    businessType: user?.businessType || "",
    companyDescription: user?.companyDescription || "",
    businessRegistrationNumber: user?.businessRegistrationNumber || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    position: user?.position || "",
    email: user?.email || "",
    phone: user?.phone || "",
    website: user?.website || "",
    address: user?.address || "",
    city: user?.city || "",
    numberOfAgents: user?.numberOfAgents || "",
    pfp: user?.pfp || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      const agencyRef = doc(fireDataBase, "agencies", user?.uid);
      await updateDoc(agencyRef, formData);

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

  return (
    <div className="w-full h-full">
      <Header />
      <Card className="shadow-lg mx-auto mt-4 rounded-lg w-full max-w-7xl overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-center space-y-0 bg-gray-50 p-6">
          <CardTitle className="font-bold text-gray-800 text-2xl">
            Agency Profile
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
                  Save Changes
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
                    <Input
                      name="businessRegistrationNumber"
                      value={formData.businessRegistrationNumber}
                      onChange={handleInputChange}
                      placeholder="Business Registration Number"
                      className="w-full"
                    />
                    <Select
                      value={formData.numberOfAgents}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          numberOfAgents: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Number of Agents" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 Agents</SelectItem>
                        <SelectItem value="6-10">6-10 Agents</SelectItem>
                        <SelectItem value="11-20">11-20 Agents</SelectItem>
                        <SelectItem value="20+">20+ Agents</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-gray-900 text-2xl">
                      {user?.companyName}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="text-sm"></Badge>
                      {user?.businessType?.replace(/_/g, " ")}
                      <Badge className="text-sm"></Badge>
                      {user?.numberOfAgents} Agents
                    </div>
                    <p className="text-gray-600 text-sm">
                      Reg. No: {user?.businessRegistrationNumber}
                    </p>
                  </>
                )}
              </div>
              <AgencyLogoUpload
                pfp={formData.pfp}
                companyName={formData.companyName}
                isEditing={isEditing}
                onImageUpload={(url) =>
                  setFormData((prev) => ({ ...prev, pfp: url }))
                }
              />
              {/* Company Description */}
              <div className="space-y-2">
                <label className="font-medium text-gray-600 text-sm">
                  Company Description
                </label>
                {isEditing ? (
                  <Textarea
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleInputChange}
                    className="min-h-[100px]"
                    placeholder="Enter company description"
                  />
                ) : (
                  <p className="text-gray-700 text-sm">
                    {user?.companyDescription}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white shadow-sm p-6 border rounded-lg">
                <h4 className="mb-4 font-medium text-lg">
                  Contact Information
                </h4>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="gap-4 grid grid-cols-2">
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                      />
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                      />
                    </div>
                    <Input
                      name="position"
                      value={formData.position}
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
                    <div className="pt-2 border-t">
                      <p className="font-medium text-gray-700 text-sm">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-gray-600 text-sm">{user?.position}</p>
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
const AgencyLogoUpload = ({
  pfp,
  companyName,
  isEditing,
  onImageUpload,
}: {
  pfp: string;
  companyName: string;
  isEditing: boolean;
  onImageUpload: (url: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    try {
      setUploading(true);
      const file = e.target.files[0];

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

      const fileExt = file.name.split(".").pop();
      const fileName = `agency-logos/${Date.now()}-${file.name}`;
      const storageRef = ref(fireStorage, fileName);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      onImageUpload(downloadURL);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative mx-auto mb-4 w-32 h-32">
      <div className="border-2 border-gray-200 rounded-lg w-full h-full overflow-hidden">
        {pfp ? (
          <img
            src={pfp}
            alt={`${companyName} logo`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex justify-center items-center bg-gray-50 w-full h-full">
            <Building className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
          <label
            className="bg-white shadow-lg p-2 rounded-full cursor-pointer"
            htmlFor="company-logo"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
            ) : (
              <Edit className="w-5 h-5 text-gray-600" />
            )}
          </label>
          <input
            type="file"
            id="company-logo"
            className="hidden"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={uploading}
          />
        </div>
      )}
    </div>
  );
};
