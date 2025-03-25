import React from "react";
import { Link, Outlet } from "react-router-dom";
import {
  Home,
  Plus,
  Settings,
  CreditCard,
  BarChart2,
  User,
  LogOut,
  Building,
  Users,
} from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

const AgencyLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow container mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6 flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 mb-4 md:mb-0">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Agency Dashboard</h2>
            <nav className="space-y-1">
              <Link
                to="/agency/dashboard"
                className="flex items-center text-gray-700 hover:text-realtyplus hover:bg-gray-50 rounded-md px-3 py-2"
              >
                <Home className="mr-2 h-4 w-4" /> Dashboard
              </Link>
              <Link
                to="/list-property"
                className="flex items-center text-gray-700 hover:text-realtyplus hover:bg-gray-50 rounded-md px-3 py-2"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Property
              </Link>
              <Link
                to="/agency/agents"
                className="flex items-center text-gray-700 hover:text-realtyplus hover:bg-gray-50 rounded-md px-3 py-2"
              >
                <Users className="mr-2 h-4 w-4" /> Manage Agents
              </Link>
              <Link
                to="/agency/profile"
                className="flex items-center text-gray-700 hover:text-realtyplus hover:bg-gray-50 rounded-md px-3 py-2"
              >
                <Building className="mr-2 h-4 w-4" /> Agency Profile
              </Link>
              <Link
                to="/agent/subscription"
                className="flex items-center text-gray-700 hover:text-realtyplus hover:bg-gray-50 rounded-md px-3 py-2"
              >
                <CreditCard className="mr-2 h-4 w-4" /> Subscription
              </Link>
              <Link
                to="/agency/analytics"
                className="flex items-center text-gray-700 hover:text-realtyplus hover:bg-gray-50 rounded-md px-3 py-2"
              >
                <BarChart2 className="mr-2 h-4 w-4" /> Analytics
              </Link>
              <Link
                to="/agency/settings"
                className="flex items-center text-gray-700 hover:text-realtyplus hover:bg-gray-50 rounded-md px-3 py-2"
              >
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
              <div className="pt-4 mt-4 border-t border-gray-200">
                <Link
                  to="/"
                  className="flex items-center text-gray-700 hover:text-realtyplus hover:bg-gray-50 rounded-md px-3 py-2"
                >
                  <Home className="mr-2 h-4 w-4" /> View Website
                </Link>
                <Link
                  to="/logout"
                  className="flex items-center text-gray-700 hover:text-realtyplus hover:bg-gray-50 rounded-md px-3 py-2"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AgencyLayout;
