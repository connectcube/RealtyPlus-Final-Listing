import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Home,
  Building2,
  UserCog,
  LogOut,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN } from "@/lib/typeDefinitions";
import { LoadingSpinner } from "../globalScreens/Loader";
import { auth, fireDataBase } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const [admin, setAdmin] = useState<ADMIN | null>(null);

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
      } catch (error) {
        console.error("Error checking admin status:", error);
        await signOut(auth);
        window.location.href = "/";
      }
    };

    const unsubscribe = onAuthStateChanged(auth, checkAdminStatus);
    return () => unsubscribe();
  }, []);

  if (!admin) {
    return <LoadingSpinner />;
  }
  // Simulate current user as Super Admin for this demo
  const currentUser = {
    id: admin.uid || "",
    name: `${admin.firstName} ${admin.lastName}`,
    email: admin.email,
    adminRole: admin.adminType,
    permissions: admin.permissions,
  };

  // Define all possible nav items
  const allNavItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
      toShow: true, // Everyone can access dashboard
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users className="w-5 h-5" />,
      toShow:
        currentUser.permissions.userRead && currentUser.permissions.userWrite,
    },
    {
      name: "Properties",
      path: "/admin/properties",
      icon: <Home className="w-5 h-5" />,
      toShow:
        currentUser.permissions.listingRead &&
        currentUser.permissions.listingWrite,
    },
    {
      name: "Agents",
      path: "/admin/agents",
      icon: <UserCog className="w-5 h-5" />,
      toShow:
        currentUser.permissions.userRead && currentUser.permissions.userWrite,
    },
    {
      name: "Agencies",
      path: "/admin/agencies",
      icon: <Building2 className="w-5 h-5" />,
      toShow:
        currentUser.permissions.userRead && currentUser.permissions.userWrite,
    },
    {
      name: "Admin Management",
      path: "/admin/admin-management",
      icon: <ShieldAlert className="w-5 h-5" />,
      toShow: currentUser.adminRole === "super admin",
      requiredPermission: true,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings className="w-5 h-5" />,
      requiredPermission: true,
    },
  ];
  if (!admin) {
    return <LoadingSpinner />;
  }
  return (
    <div className="flex bg-gray-100 h-screen">
      {/* Sidebar */}
      <div className="bg-white shadow-md w-64">
        <div className="p-4 border-gray-200 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/realtyplus-logo.svg"
              alt="RealtyPlus Logo"
              className="w-8 h-8"
            />
            <span className="font-bold text-blue-600 text-xl">RealtyPlus</span>
          </Link>
          <div className="mt-2 text-gray-500 text-sm">Admin Dashboard</div>
        </div>
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {allNavItems.map(
              (item) =>
                // Check if user has permission to view this item
                item.toShow && (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center p-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors",
                        location.pathname === item.path &&
                          "bg-blue-50 text-blue-700 font-medium"
                      )}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  </li>
                )
            )}
            <li className="mt-4 pt-4 border-gray-200 border-t">
              <Link
                to="/"
                className="flex items-center hover:bg-red-50 p-3 rounded-lg text-gray-700 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-3">Exit Admin</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="flex justify-between items-center bg-white shadow-sm p-4">
          <h1 className="font-semibold text-gray-800 text-xl">
            {allNavItems.find((item) => item.path === location.pathname)
              ?.name || "Admin"}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right">
              <div className="font-medium">{currentUser.name}</div>
              <div className="text-gray-500">{currentUser.email}</div>
              <div className="flex justify-end items-center mt-1 text-blue-600 text-xs capitalize">
                <ShieldAlert className="mr-1 w-3 h-3" />
                {currentUser.adminRole}
              </div>
            </div>
            <div className="flex justify-center items-center bg-blue-500 rounded-full w-10 h-10 font-bold text-white">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
