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
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { ADMIN } from "@/lib/typeDefinitions";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { LoadingSpinner } from "../globalScreens/Loader";

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<ADMIN | null>(null);
  const [counts, setCounts] = useState({
    users: 0,
    properties: 0,
    agents: 0,
    agencies: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";

    const date = timestamp.toDate();
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 172800) return "Yesterday";

    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  useEffect(() => {
    const checkAdminStatus = async (user: any) => {
      try {
        if (!user) {
          window.location.href = "/";
          return;
        }

        const adminRef = doc(fireDataBase, "admins", user.uid);
        const adminSnapshot = await getDoc(adminRef);

        if (!adminSnapshot.exists()) {
          await signOut(auth);
          window.location.href = "/";
          return;
        }

        const adminData = adminSnapshot.data() as ADMIN;
        if (!adminData.isApproved) {
          await signOut(auth);
          window.location.href = "/";
          return;
        }

        setAdmin({
          ...adminData,
          uid: adminSnapshot.id,
        });
        const fetchCollectionCounts = async () => {
          try {
            // Create references to your collections
            const usersCol = collection(fireDataBase, "users");
            const propertiesCol = collection(fireDataBase, "listings");
            const agentsCol = collection(fireDataBase, "agents");
            const agenciesCol = collection(fireDataBase, "agencies");
            // With query and limit

            // Get the count from each collection
            const [
              usersSnapshot,
              propertiesSnapshot,
              agentsSnapshot,
              agenciesSnapshot,
            ] = await Promise.all([
              getCountFromServer(usersCol),
              getCountFromServer(propertiesCol),
              getCountFromServer(agentsCol),
              getCountFromServer(agenciesCol),
            ]);

            setCounts({
              users: usersSnapshot.data().count,
              properties: propertiesSnapshot.data().count,
              agents: agentsSnapshot.data().count,
              agencies: agenciesSnapshot.data().count,
            });
          } catch (error) {
            console.error("Error fetching collection counts:", error);
          }
        };
        fetchCollectionCounts();
      } catch (error) {
        console.error("Error checking admin status:", error);
        await signOut(auth);
        window.location.href = "/";
      }
    };

    const unsubscribe = onAuthStateChanged(auth, checkAdminStatus);
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const recentActivitiesRef = collection(
          fireDataBase,
          "recentActivities"
        );
        const q = query(
          recentActivitiesRef,
          orderBy("doneAt", "desc"),
          limit(10) // Get last 10 activities
        );
        const recentActivitiesSnapshot = await getDocs(q);

        const activities = recentActivitiesSnapshot.docs.map((doc) => ({
          uid: doc.id,
          action: doc.data().activity.action,
          user: doc.data().activity.doer,
          time: formatTimestamp(doc.data().doneAt),
          type: doc.data().type,
        }));

        setRecentActivities(activities);
        console.log(activities);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      }
    };
    fetchRecentActivities();
  }, []);
  const stats = [
    {
      name: "Total Users",
      value: counts.users.toLocaleString(),
      icon: <Users className="w-8 h-8" />,
      color: "bg-blue-500",
      path: "/admin/users",
    },
    {
      name: "Properties Listed",
      value: counts.properties.toLocaleString(),
      icon: <Home className="w-8 h-8" />,
      color: "bg-green-500",
      path: "/admin/properties",
    },
    {
      name: "Total Agents",
      value: counts.agents.toLocaleString(),
      icon: <UserCog className="w-8 h-8" />,
      color: "bg-purple-500",
      path: "/admin/agents",
    },
    {
      name: "Registered Agencies",
      value: counts.agencies.toLocaleString(),
      icon: <Building2 className="w-8 h-8" />,
      color: "bg-orange-500",
      path: "/admin/agencies",
    },
    {
      name: "Monthly Revenue",
      value: "ZMW 248,900",
      icon: <DollarSign className="w-8 h-8" />,
      color: "bg-emerald-500",
      path: "/admin/finance",
    },
    {
      name: "Growth Rate",
      value: "+24%",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "bg-pink-500",
      path: "/admin/analytics",
    },
  ];

  return !admin ? (
    <LoadingSpinner />
  ) : (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">
            Welcome to RealtyPlus Admin
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your platform's performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Link to={stat.path} key={stat.name}>
              <Card
                className="hover:shadow-md p-4 border-l-4 transition-shadow cursor-pointer"
                style={{
                  borderLeftColor: stat.color.replace("bg-", "rgb(var(--"),
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-muted-foreground text-sm">
                      {stat.name}
                    </p>
                    <h3 className="mt-1 font-bold text-2xl">{stat.value}</h3>
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
        <div className="gap-4 grid md:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-lg">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start pb-4 last:pb-0 last:border-0 border-b"
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
                      <Home className="w-5 h-5" />
                    ) : activity.type === "agent" ? (
                      <UserCog className="w-5 h-5" />
                    ) : activity.type === "subscription" ? (
                      <DollarSign className="w-5 h-5" />
                    ) : (
                      <Users className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <div className="flex text-muted-foreground text-sm">
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
            <h3 className="mb-4 font-semibold text-lg">Quick Actions</h3>
            <div className="gap-3 grid grid-cols-2">
              <Link
                to={`/admin/list-property/${admin.uid}`}
                className="flex flex-col justify-center items-center bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors"
              >
                <Home className="mb-2 w-8 h-8 text-blue-600" />
                <span className="font-medium text-blue-700">Add Property</span>
              </Link>
              <Link
                to="/admin/users/add"
                className="flex flex-col justify-center items-center bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors"
              >
                <Users className="mb-2 w-8 h-8 text-purple-600" />
                <span className="font-medium text-purple-700">Add User</span>
              </Link>
              <Link
                to="/admin/agents/add"
                className="flex flex-col justify-center items-center bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors"
              >
                <UserCog className="mb-2 w-8 h-8 text-green-600" />
                <span className="font-medium text-green-700">Add Agent</span>
              </Link>
              <Link
                to="/admin/agencies/add"
                className="flex flex-col justify-center items-center bg-orange-50 hover:bg-orange-100 p-4 rounded-lg text-center transition-colors"
              >
                <Building2 className="mb-2 w-8 h-8 text-orange-600" />
                <span className="font-medium text-orange-700">Add Agency</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
