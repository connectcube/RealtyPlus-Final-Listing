import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import PropertyDetail from "./components/property/PropertyDetail";
import AddProperty from "./components/property/AddProperty";
import routes from "tempo-routes";

// Lazy load agent and subscription components
const AgentSignup = lazy(() => import("./components/auth/AgentSignup"));
const AgencySignup = lazy(() => import("./components/agent/AgencySignup"));
const SubscriptionPage = lazy(
  () => import("./components/subscription/SubscriptionPage"),
);
const SubscriptionSuccess = lazy(
  () => import("./components/subscription/SubscriptionSuccess"),
);
const AgentDashboard = lazy(() => import("./components/agent/AgentDashboard"));
const AgencyDashboard = lazy(
  () => import("./components/agent/AgencyDashboard"),
);
const MortgageCalculator = lazy(
  () => import("./components/mortgage/MortgageCalculator"),
);
const AgentsPage = lazy(() => import("./components/agent/AgentsPage"));

// User authentication components
const UserLogin = lazy(() => import("./components/auth/UserLogin"));
const UserSignup = lazy(() => import("./components/auth/UserSignup"));

// Property listing pages
const RentProperties = lazy(
  () => import("./components/property/RentProperties"),
);
const BuyProperties = lazy(() => import("./components/property/BuyProperties"));

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/list-property" element={<AddProperty />} />
          <Route path="/properties" element={<Home />} />
          <Route path="/buy" element={<BuyProperties />} />
          <Route path="/rent" element={<RentProperties />} />
          <Route path="/mortgage-calculator" element={<MortgageCalculator />} />
          <Route path="/agents" element={<AgentsPage />} />

          {/* User authentication routes */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserSignup />} />

          {/* Agent routes */}
          <Route path="/agent/signup" element={<AgentSignup />} />
          <Route path="/agency/signup" element={<AgencySignup />} />
          <Route path="/agent/subscription" element={<SubscriptionPage />} />
          <Route
            path="/agent/subscription/success"
            element={<SubscriptionSuccess />}
          />
          <Route path="/agent/dashboard" element={<AgentDashboard />} />
          <Route path="/agency/dashboard" element={<AgencyDashboard />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
