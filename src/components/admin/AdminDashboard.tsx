import { Card } from "@/components/ui/card";
import {
  Users,
  Home,
  Building2,
  UserCog,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { auth, fireDataBase } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { ADMIN } from "@/lib/typeDefinitions";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { LoadingSpinner } from "../globalScreens/Loader";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<ADMIN>();
  const authentication = auth;

  useEffect(() => {
    const checkAdminStatus = async (user: any) => {
      try {
        if (!user) {
          window.location.href = "/";
          return;
        }

        // Get admin document reference
        const adminRef = doc(fireDataBase, "admins", user.uid);

        // Get admin document
        const adminSnapshot = await getDoc(adminRef);
        const adminData = adminSnapshot.data() as ADMIN;

        // Check admin status
        if (!adminSnapshot.exists() || !adminData.isApproved) {
          await signOut(authentication);
          window.location.href = "/";
        } else {
          setAdmin(adminData);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        await signOut(authentication);
        window.location.href = "/";
      }
    };

    // Set up auth state listener first
    const unsubscribe = onAuthStateChanged(authentication, (user) => {
      if (user) {
        checkAdminStatus(user);
      } else {
        window.location.href = "/";
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Mock data for dashboard stats
  const stats = [
    {
      name: "Total Users",
      value: "2,543",
      icon: <Users className="h-8 w-8" />,
      color: "bg-blue-500",
      path: "/admin/users",
    },
    {
      name: "Properties Listed",
      value: "1,259",
      icon: <Home className="h-8 w-8" />,
      color: "bg-green-500",
      path: "/admin/properties",
    },
    {
      name: "Active Agents",
      value: "156",
      icon: <UserCog className="h-8 w-8" />,
      color: "bg-purple-500",
      path: "/admin/agents",
    },
    {
      name: "Registered Agencies",
      value: "42",
      icon: <Building2 className="h-8 w-8" />,
      color: "bg-orange-500",
      path: "/admin/agencies",
    },
    {
      name: "Monthly Revenue",
      value: "ZMW 248,900",
      icon: <DollarSign className="h-8 w-8" />,
      color: "bg-emerald-500",
      path: "/admin/finance",
    },
    {
      name: "Growth Rate",
      value: "+24%",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "bg-pink-500",
      path: "/admin/analytics",
    },
  ];

  // Mock data for recent activities
  const recentActivities = [
    {
      action: "New property listed",
      user: "James Banda",
      time: "2 hours ago",
      type: "property",
    },
    {
      action: "New agent registered",
      user: "Mulenga Chipimo",
      time: "5 hours ago",
      type: "agent",
    },
    {
      action: "Property sold",
      user: "Lusaka Realty Ltd",
      time: "Yesterday",
      type: "property",
    },
    {
      action: "Subscription renewed",
      user: "Zambia Homes Agency",
      time: "2 days ago",
      type: "subscription",
    },
    {
      action: "User account created",
      user: "Chanda Mutale",
      time: "3 days ago",
      type: "user",
    },
  ];

  return !admin ? (
    <LoadingSpinner />
  ) : (
    <AdminLayout admin={admin}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome to RealtyPlus Admin
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your platform's performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Link to={stat.path} key={stat.name}>
              <Card
                className="p-4 border-l-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{
                  borderLeftColor: stat.color.replace("bg-", "rgb(var(--"),
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.name}
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={`${stat.color} text-white p-3 rounded-full`}>
                    {stat.icon}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start pb-4 border-b last:border-0 last:pb-0"
                >
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      activity.type === "property"
                        ? "bg-blue-100 text-blue-600"
                        : activity.type === "agent"
                        ? "bg-purple-100 text-purple-600"
                        : activity.type === "subscription"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {activity.type === "property" ? (
                      <Home className="h-5 w-5" />
                    ) : activity.type === "agent" ? (
                      <UserCog className="h-5 w-5" />
                    ) : activity.type === "subscription" ? (
                      <DollarSign className="h-5 w-5" />
                    ) : (
                      <Users className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <div className="flex text-sm text-muted-foreground">
                      <span>{activity.user}</span>
                      <span className="mx-2">•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/properties/add"
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg flex flex-col items-center justify-center text-center transition-colors"
              >
                <Home className="h-8 w-8 text-blue-600 mb-2" />
                <span className="font-medium text-blue-700">Add Property</span>
              </Link>
              <Link
                to="/admin/users/add"
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg flex flex-col items-center justify-center text-center transition-colors"
              >
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <span className="font-medium text-purple-700">Add User</span>
              </Link>
              <Link
                to="/admin/agents/add"
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg flex flex-col items-center justify-center text-center transition-colors"
              >
                <UserCog className="h-8 w-8 text-green-600 mb-2" />
                <span className="font-medium text-green-700">Add Agent</span>
              </Link>
              <Link
                to="/admin/agencies/add"
                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg flex flex-col items-center justify-center text-center transition-colors"
              >
                <Building2 className="h-8 w-8 text-orange-600 mb-2" />
                <span className="font-medium text-orange-700">Add Agency</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
