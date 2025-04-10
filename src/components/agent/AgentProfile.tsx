import { useZustand } from "@/lib/zustand";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Badge,
  Building,
  Building2,
  Edit,
  Globe,
  Mail,
  Phone,
  Save,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { doc, DocumentReference, getDoc, updateDoc } from "firebase/firestore";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { fireDataBase } from "@/lib/firebase";
import { toast } from "react-toastify";
import Header from "../layout/Header";

export default function AgentProfile() {
  const { user, setUser } = useZustand();
  console.log(user);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    licenseNumber: user?.licenseNumber || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    agentType: user?.agentType || "",
    email: user?.email || "",
    phone: user?.phone || "",
    website: user?.website || "",
    companyName: user?.companyName || "",
    businessType: user?.businessType || "",
    businessRegistrationNumber: user?.businessRegistrationNumber || "",
    social: {
      linkedin: user?.social?.linkedin || "",
      twitter: user?.social?.twitter || "",
    },
    address: user?.address || "",
    city: user?.city || "",
  });

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
      <Card className="w-full max-w-7xl mx-auto shadow-lg rounded-lg overflow-hidden mt-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 bg-gray-50">
          <CardTitle className="text-2xl font-bold text-gray-800">
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
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {`${user?.firstName} ${user?.lastName}`}
                    </h3>
                    <div className="flex flex-wrap gap-2 capitalize">
                      Agent Type: {user?.agentType?.replace(/_/g, " ")}
                    </div>
                    <p className="text-sm text-gray-600">
                      License No: {user?.licenseNumber}
                    </p>
                  </>
                )}
              </div>

              {/* Company Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Company Description
                </label>
                <CompanyCard agencyRef={user.agency} />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-medium text-lg mb-4">
                  Contact Information
                </h4>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                      <Mail className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {user?.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {user?.phone}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <a
                        href={user?.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {user?.website}
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <a
                        href={user?.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {user?.social.linkedin}
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <a
                        href={user?.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {user?.social.twitter}
                      </a>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium text-gray-700">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{user?.agentType}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-medium text-lg mb-4">Location</h4>
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
                    <Building className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-700">{user?.address}</p>
                      <p className="text-sm text-gray-700 capitalize">
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

// Add this interface for agency data
interface AgencyData {
  companyName: string;
  businessType: string;
  buisnessRegistrationNumber: string;
  companyDescription?: string;
  address?: string;
  city?: string;
}

// Add this component within AgentProfile.tsx
const CompanyCard = ({ agencyRef }: { agencyRef: DocumentReference }) => {
  const [agencyData, setAgencyData] = useState<AgencyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgencyData = async () => {
      try {
        //const agencyReference = doc(fireDataBase, "agencies", agencyRef.uid);
        const agencySnap = await getDoc(agencyRef);
        console.log("Is correct type?", agencyRef instanceof DocumentReference);
        if (agencySnap.exists()) {
          setAgencyData(agencySnap.data() as AgencyData);
        }
      } catch (error) {
        console.error("Error fetching agency data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (agencyRef) {
      fetchAgencyData();
    }
  }, [agencyRef]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!agencyData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <p className="text-gray-500">No company information available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="space-y-6">
        {/* Company Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {agencyData.companyName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {agencyData.businessType?.replace(/_/g, " ")}
            </p>
          </div>
          <Building2 className="h-6 w-6 text-gray-400" />
        </div>

        {/* Company Details */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Badge className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              Reg. No: {agencyData.buisnessRegistrationNumber}
            </span>
          </div>

          {agencyData.description && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {agencyData.companyDescription}
              </p>
            </div>
          )}

          {(agencyData.address || agencyData.city) && (
            <div className="flex items-start space-x-3 border-t pt-4">
              <Building className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="text-sm text-gray-600">
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
