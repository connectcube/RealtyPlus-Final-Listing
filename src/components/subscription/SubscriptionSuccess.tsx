import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { SubscriptionPackage } from "@/types/Subscription";
import { useZustand } from "@/lib/zustand";

// This would typically come from your API or context
const subscriptionPackages: Record<string, SubscriptionPackage> = {
  free: {
    id: "free",
    name: "Free Trial",
    tier: "free",
    price: 0,
    currency: "K",
    listingsPerMonth: 20,
    description: "Perfect for individual agents just getting started",
    features: [
      "20 property listings per month",
      "Basic analytics",
      "Standard support",
      "Property listing for 30 days",
      "First month only",
    ],
  },
  sme: {
    id: "sme",
    name: "SME Package",
    tier: "sme",
    price: 200,
    currency: "K",
    listingsPerMonth: 50,
    description: "Ideal for growing agencies with multiple agents",
    features: [
      "50 property listings per month",
      "Advanced analytics",
      "Priority support",
      "Featured listings",
      "Property listing for 60 days",
      "Social media promotion",
    ],
    isPopular: true,
  },
  elite: {
    id: "elite",
    name: "Elite Package",
    tier: "elite",
    price: 150,
    currency: "K",
    listingsPerMonth: 100,
    description: "For established agencies with high volume listings",
    features: [
      "100 property listings per month",
      "Premium analytics dashboard",
      "24/7 dedicated support",
      "Featured and highlighted listings",
      "Property listing for 90 days",
      "Social media promotion",
      "Email marketing campaigns",
      "Virtual tour integration",
    ],
  },
};

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { user } = useZustand();
  const userType = user.userType === "agent" ? "agent" : "agency";
  const [searchParams] = useSearchParams();
  const [selectedPackage, setSelectedPackage] =
    useState<SubscriptionPackage | null>(null);

  useEffect(() => {
    const packageId = searchParams.get("package");
    if (packageId && subscriptionPackages[packageId]) {
      setSelectedPackage(subscriptionPackages[packageId]);
    }
  }, [searchParams]);

  if (!selectedPackage) {
    return (
      <div className="mx-auto px-4 py-10 text-center container">
        <p>
          No subscription package selected. Please go back and select a package.
        </p>
        <Button
          onClick={() => navigate("/agent/subscription")}
          className="bg-realtyplus hover:bg-realtyplus-dark mt-4"
        >
          Back to Subscription Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 mx-auto px-4 md:px-6 py-10 min-h-screen container">
      <Card className="bg-white shadow-lg mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center bg-green-100 mx-auto mb-4 rounded-full w-16 h-16">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="font-bold text-gray-900 text-2xl">
            Subscription Confirmed!
          </CardTitle>
          <CardDescription>
            Thank you for subscribing to our {selectedPackage.name} plan
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="mb-2 font-medium text-gray-900">
              Subscription Details
            </h3>
            <div className="gap-2 grid grid-cols-2 text-sm">
              <div className="text-gray-500">Plan:</div>
              <div className="font-medium">{selectedPackage.name}</div>

              <div className="text-gray-500">Price:</div>
              <div className="font-medium">
                {selectedPackage.price === 0
                  ? "Free"
                  : `${selectedPackage.currency}${selectedPackage.price}/month`}
              </div>

              <div className="text-gray-500">Listings:</div>
              <div className="font-medium">
                {selectedPackage.listingsPerMonth} per month
              </div>

              <div className="text-gray-500">Status:</div>
              <div className="font-medium text-green-600">Active</div>

              <div className="text-gray-500">Next Billing:</div>
              <div className="font-medium">
                {selectedPackage.tier === "free"
                  ? "N/A (Free Trial)"
                  : new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="text-gray-600 text-center">
            <p>You can now start adding property listings to your account.</p>
            <p className="mt-1">
              Your subscription can be managed from your agent dashboard.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex sm:flex-row flex-col justify-center gap-3">
          <Button
            onClick={() => navigate(`/${userType}/dashboard`)}
            className="bg-realtyplus hover:bg-realtyplus-dark"
          >
            Go to Dashboard
          </Button>
          <Button onClick={() => navigate("/list-property")} variant="outline">
            Add Your First Property
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
