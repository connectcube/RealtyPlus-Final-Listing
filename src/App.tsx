import { Suspense, lazy, useEffect } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import PropertyDetail from "./components/property/PropertyDetail";
import AddProperty from "./components/property/AddProperty";
import routes from "tempo-routes";
import { ToastContainer } from "react-toastify";
import AgencyProfile from "./components/agent/AgencyProfile";
import AgentProfile from "./components/agent/AgentProfile";
// Lazy load agent and subscription components
const AgentSignup = lazy(() => import("./components/auth/AgentSignup"));
const AgencySignup = lazy(() => import("./components/auth/AgencySignup"));
const SubscriptionPage = lazy(
  () => import("./components/subscription/SubscriptionPage")
);
const SubscriptionSuccess = lazy(
  () => import("./components/subscription/SubscriptionSuccess")
);
const AgentDashboard = lazy(() => import("./components/agent/AgentDashboard"));
const AgencyDashboard = lazy(
  () => import("./components/agent/AgencyDashboard")
);
const MortgageCalculator = lazy(
  () => import("./components/mortgage/MortgageCalculator")
);
const AgentsPage = lazy(() => import("./components/agent/AgentsPage"));

// User authentication components
const UserLogin = lazy(() => import("./components/auth/UserLogin"));
const UserSignup = lazy(() => import("./components/auth/UserSignup"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));

// Property listing pages
const RentProperties = lazy(
  () => import("./components/property/RentProperties")
);
const BuyProperties = lazy(() => import("./components/property/BuyProperties"));

// Static pages
const AboutPage = lazy(() => import("./components/about/AboutPage"));
const ContactPage = lazy(() => import("./components/contact/ContactPage"));

// Admin pages
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const UsersPage = lazy(() => import("./components/admin/UsersPage"));
const PropertiesPage = lazy(() => import("./components/admin/PropertiesPage"));
const AdminAgentsPage = lazy(() => import("./components/admin/AgentsPage"));
const AgenciesPage = lazy(() => import("./components/admin/AgenciesPage"));
const AdminManagementPage = lazy(
  () => import("./components/admin/AdminManagementPage")
);

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/list-property" element={<AddProperty />} />
          <Route path="/properties" element={<Home />} />
          <Route path="/buy" element={<BuyProperties />} />
          <Route path="/rent" element={<RentProperties />} />
          <Route path="/mortgage-calculator" element={<MortgageCalculator />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* User authentication routes */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Agent routes */}
          <Route path="/agent/signup" element={<AgentSignup />} />
          <Route path="/agency/signup" element={<AgencySignup />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route
            path="/agent/subscription/success"
            element={<SubscriptionSuccess />}
          />
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
          <Route path="/agent/profile" element={<AgentProfile />} />
          <Route path="/agency/dashboard" element={<AgencyDashboard />} />
          <Route path="/agency/profile" element={<AgencyProfile />} />
          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/properties" element={<PropertiesPage />} />
          <Route path="/admin/agents" element={<AdminAgentsPage />} />
          <Route path="/admin/agencies" element={<AgenciesPage />} />
          <Route
            path="/admin/admin-management"
            element={<AdminManagementPage />}
          />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
