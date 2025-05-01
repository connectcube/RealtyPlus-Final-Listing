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
  onSnapshot,
  orderBy,
  query,
  startAfter,
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
          <RecentActivities admin={admin} />

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
              <button
                disabled
                className="flex flex-col justify-center items-center bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors"
              >
                <Users className="mb-2 w-8 h-8 text-purple-600" />
                <span className="font-medium text-purple-700">Add User</span>
              </button>
              <button
                disabled
                className="flex flex-col justify-center items-center bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors"
              >
                <UserCog className="mb-2 w-8 h-8 text-green-600" />
                <span className="font-medium text-green-700">Add Agent</span>
              </button>
              <button
                disabled
                className="flex flex-col justify-center items-center bg-orange-50 hover:bg-orange-100 p-4 rounded-lg text-center transition-colors"
              >
                <Building2 className="mb-2 w-8 h-8 text-orange-600" />
                <span className="font-medium text-orange-700">Add Agency</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
const RecentActivities = ({ admin }: { admin: ADMIN }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const ITEMS_PER_PAGE = 5;

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
    let unsubscribe: () => void;

    const fetchRecentActivities = async () => {
      try {
        setIsLoading(true);
        const recentActivitiesRef = collection(
          fireDataBase,
          "recentActivities"
        );

        // First get total count for pagination
        const totalSnapshot = await getCountFromServer(recentActivitiesRef);
        const totalItems = totalSnapshot.data().count;
        setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));

        // Set up real-time listener
        const q = query(
          recentActivitiesRef,
          orderBy("doneAt", "desc"),
          limit(ITEMS_PER_PAGE)
        );

        // Replace getDocs with onSnapshot for real-time updates
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (snapshot.empty) {
              setRecentActivities([]);
              return;
            }

            const activities = snapshot.docs.map((doc) => ({
              uid: doc.id,
              action: doc.data().activity.action,
              user: doc.data().activity.doer,
              time: formatTimestamp(doc.data().doneAt),
              type: doc.data().type,
            }));

            setRecentActivities(activities);
            setIsLoading(false);
          },
          (error) => {
            console.error("Error fetching recent activities:", error);
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error("Error fetching recent activities:", error);
        setRecentActivities([]);
        setIsLoading(false);
      }
    };

    fetchRecentActivities();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentPage]);

  const PaginationControls = () => (
    <div className="flex justify-between items-center bg-white mt-4 px-4 sm:px-6 py-3 border-gray-200 border-t">
      <div className="sm:hidden flex flex-1 justify-between">
        <button
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1}
          className="inline-flex relative items-center bg-white hover:bg-gray-50 disabled:opacity-50 px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 text-sm disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
          disabled={currentPage === totalPages}
          className="inline-flex relative items-center bg-white hover:bg-gray-50 disabled:opacity-50 ml-3 px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 text-sm disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:justify-between sm:items-center">
        <div>
          <p className="text-gray-700 text-sm">
            Showing page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="inline-flex isolate -space-x-px shadow-sm rounded-md"
            aria-label="Pagination"
          >
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="inline-flex focus:z-20 relative items-center hover:bg-gray-50 disabled:opacity-50 px-2 py-2 rounded-l-md focus:outline-offset-0 ring-1 ring-gray-300 ring-inset text-gray-400 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {/* Current page number */}
            <span className="inline-flex relative items-center px-4 py-2 focus:outline-offset-0 ring-1 ring-gray-300 ring-inset font-semibold text-gray-900 text-sm">
              {currentPage}
            </span>
            <button
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className="inline-flex focus:z-20 relative items-center hover:bg-gray-50 disabled:opacity-50 px-2 py-2 rounded-r-md focus:outline-offset-0 ring-1 ring-gray-300 ring-inset text-gray-400 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
  const filterResults = () => {
    switch (admin.adminType) {
      case "super admin": {
        return recentActivities.filter(
          (activity) =>
            activity.type === "property" ||
            activity.type === "agent" ||
            activity.type === "subscription"
        );
      }
      case "content admin": {
        return recentActivities.filter(
          (activity) => activity.type === "property"
        );
      }
      case "user admin": {
        return recentActivities.filter(
          (activity) =>
            activity.type === "agent" || activity.type === "subscription"
        );
      }
      case "custom": {
        return recentActivities.filter(
          (activity) =>
            activity.type === "property" || activity.type === "agent"
        );
      }
      default: {
        return recentActivities.filter(
          (activity) =>
            activity.type === "property" ||
            activity.type === "agent" ||
            activity.type === "subscription"
        );
      }
    }
  };
  return (
    <Card className="p-6">
      <h3 className="mb-4 font-semibold text-lg">Recent Activity</h3>
      <div className="space-y-4">
        {isLoading ? (
          // Add loading state UI
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner />
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="py-8 text-muted-foreground text-center">
            No recent activities found
          </div>
        ) : (
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
        )}
      </div>
      {!isLoading && recentActivities.length > 0 && <PaginationControls />}
    </Card>
  );
};
