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
      <div className="container mx-auto py-10 px-4 text-center">
        <p>
          No subscription package selected. Please go back and select a package.
        </p>
        <Button
          onClick={() => navigate("/agent/subscription")}
          className="mt-4 bg-realtyplus hover:bg-realtyplus-dark"
        >
          Back to Subscription Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 bg-gray-50 min-h-screen">
      <Card className="max-w-2xl mx-auto bg-white shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Subscription Confirmed!
          </CardTitle>
          <CardDescription>
            Thank you for subscribing to our {selectedPackage.name} plan
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Subscription Details
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
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
                      Date.now() + 30 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="text-center text-gray-600">
            <p>You can now start adding property listings to your account.</p>
            <p className="mt-1">
              Your subscription can be managed from your agent dashboard.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate("/agent/dashboard")}
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
