import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ADMIN } from "../../lib/typeDefinitions";
import { doc, getDoc } from "firebase/firestore";
import { fireDataBase } from "../../lib/firebase"; // Assuming you have firebase config

const AdminProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [admin, setAdmin] = useState<ADMIN | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        if (!id) return;
        const adminDoc = await getDoc(doc(fireDataBase, "admins", id));
        if (adminDoc.exists()) {
          setAdmin(adminDoc.data() as ADMIN);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="border-t-2 border-b-2 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-xl">Admin not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="mx-auto max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-realtyplus to-realtyplus/85 px-6 py-8 -600">
            <div className="flex items-center">
              <div className="flex justify-center items-center bg-white rounded-full w-24 h-24 font-bold text-blue-800 text-3xl">
                {admin.firstName[0]}
                {admin.lastName[0]}
              </div>
              <div className="ml-6">
                <h1 className="font-bold text-white text-2xl">
                  {admin.firstName} {admin.lastName}
                </h1>
                <p className="mt-1 text-blue-200 capitalize">
                  {admin.adminType}
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    admin.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : admin.status === "Inactive"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  } mt-2`}
                >
                  {admin.status}
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-6">
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-800 text-xl">
                  Basic Information
                </h2>
                <div className="space-y-3">
                  <InfoItem label="Email" value={admin.email} />
                  <InfoItem
                    label="User Type"
                    value={admin.userType || "admin"}
                  />
                  <InfoItem
                    label="Created At"
                    value={
                      admin.createdAt?.toDate().toLocaleDateString() || "N/A"
                    }
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-800 text-xl">
                  Permissions
                </h2>
                <div className="gap-3 grid grid-cols-2">
                  {Object.entries(admin.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <span
                        className={`h-4 w-4 rounded-full ${
                          value ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span className="text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for displaying information
const InfoItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="text-gray-800">{value}</span>
  </div>
);

export default AdminProfile;
