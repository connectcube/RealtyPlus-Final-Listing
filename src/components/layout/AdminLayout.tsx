import { ReactNode } from "react";
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

// Define permission types for admin roles
const PERMISSIONS = {
  USERS: {
    VIEW: "users:view",
    EDIT: "users:edit",
    DELETE: "users:delete",
    MANAGE_ADMINS: "users:manage_admins",
  },
  PROPERTIES: {
    VIEW: "properties:view",
    EDIT: "properties:edit",
    DELETE: "properties:delete",
    APPROVE: "properties:approve",
  },
  AGENTS: {
    VIEW: "agents:view",
    EDIT: "agents:edit",
    DELETE: "agents:delete",
    APPROVE: "agents:approve",
  },
  AGENCIES: {
    VIEW: "agencies:view",
    EDIT: "agencies:edit",
    DELETE: "agencies:delete",
    APPROVE: "agencies:approve",
  },
  SETTINGS: {
    VIEW: "settings:view",
    EDIT: "settings:edit",
  },
};

interface AdminLayoutProps {
  children: ReactNode;
  admin: ADMIN;
}

export default function AdminLayout({ children, admin }: AdminLayoutProps) {
  const location = useLocation();

  // Simulate current user as Super Admin for this demo
  const currentUser = {
    id: 9,
    name: `${admin.firstName} ${admin.lastName}`,
    email: admin.email,
    adminRole: admin.adminType,
    permissions: [
      ...Object.values(PERMISSIONS.USERS),
      ...Object.values(PERMISSIONS.PROPERTIES),
      ...Object.values(PERMISSIONS.AGENTS),
      ...Object.values(PERMISSIONS.AGENCIES),
      ...Object.values(PERMISSIONS.SETTINGS),
    ],
  };

  // Check if current user has a specific permission
  const hasPermission = (permission) => {
    return currentUser.permissions.includes(permission);
  };

  // Define all possible nav items
  const allNavItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      requiredPermission: null, // Everyone can access dashboard
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      requiredPermission: PERMISSIONS.USERS.VIEW,
    },
    {
      name: "Properties",
      path: "/admin/properties",
      icon: <Home className="h-5 w-5" />,
      requiredPermission: PERMISSIONS.PROPERTIES.VIEW,
    },
    {
      name: "Agents",
      path: "/admin/agents",
      icon: <UserCog className="h-5 w-5" />,
      requiredPermission: PERMISSIONS.AGENTS.VIEW,
    },
    {
      name: "Agencies",
      path: "/admin/agencies",
      icon: <Building2 className="h-5 w-5" />,
      requiredPermission: PERMISSIONS.AGENCIES.VIEW,
    },
    {
      name: "Admin Management",
      path: "/admin/admin-management",
      icon: <ShieldAlert className="h-5 w-5" />,
      requiredPermission: PERMISSIONS.USERS.MANAGE_ADMINS,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      requiredPermission: PERMISSIONS.SETTINGS.VIEW,
    },
  ];

  // Filter nav items based on user permissions
  const navItems = allNavItems.filter(
    (item) =>
      item.requiredPermission === null || hasPermission(item.requiredPermission)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/realtyplus-logo.svg"
              alt="RealtyPlus Logo"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-blue-600">RealtyPlus</span>
          </Link>
          <div className="mt-2 text-sm text-gray-500">Admin Dashboard</div>
        </div>
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
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
            ))}
            <li className="pt-4 mt-4 border-t border-gray-200">
              <Link
                to="/"
                className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-3">Exit Admin</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {navItems.find((item) => item.path === location.pathname)?.name ||
              "Admin"}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right">
              <div className="font-medium">{currentUser.name}</div>
              <div className="text-gray-500">{currentUser.email}</div>
              <div className="text-xs text-blue-600 flex items-center justify-end mt-1 capitalize">
                <ShieldAlert className="h-3 w-3 mr-1" />
                {currentUser.adminRole}
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
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
