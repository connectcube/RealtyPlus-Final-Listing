import { useZustand } from "@/lib/zustand";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Badge,
  Building,
  Edit,
  Globe,
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
import { fireDataBase } from "@/lib/firebase";
import { toast } from "react-toastify";
import Header from "../layout/Header";

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
      <Card className="w-full max-w-7xl mx-auto shadow-lg rounded-lg overflow-hidden mt-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 bg-gray-50">
          <CardTitle className="text-2xl font-bold text-gray-800">
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
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {user?.companyName}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="text-sm"></Badge>
                      {user?.businessType?.replace(/_/g, " ")}
                      <Badge className="text-sm"></Badge>
                      {user?.numberOfAgents} Agents
                    </div>
                    <p className="text-sm text-gray-600">
                      Reg. No: {user?.businessRegistrationNumber}
                    </p>
                  </>
                )}
              </div>

              {/* Company Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
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
                  <p className="text-sm text-gray-700">
                    {user?.companyDescription}
                  </p>
                )}
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
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium text-gray-700">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{user?.position}</p>
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
