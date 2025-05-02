import React from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { SubscriptionPackage } from "@/types/Subscription";
import { useZustand } from "@/lib/zustand";

const subscriptionPackages: SubscriptionPackage[] = [
  {
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
  {
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
  {
    id: "elite",
    name: "Elite Package",
    tier: "elite",
    price: 350,
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
];

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useZustand();

  const handleSelectPackage = (packageId: string) => {
    // Here you would typically process the subscription
    // For now, we'll just navigate to a success page or dashboard
    const userType = user.userType === "agent" ? "agent" : "agency";
    navigate(`/${userType}/subscription/success?package=${packageId}`);
  };

  return (
    <div className="bg-gray-50 mx-auto px-4 md:px-6 py-10 min-h-screen container">
      <div className="mx-auto mb-10 max-w-5xl text-center">
        <h1 className="mb-4 font-bold text-gray-900 text-3xl">
          Choose Your Subscription Plan
        </h1>
        <p className="mx-auto max-w-2xl text-gray-600">
          Select the perfect plan for your real estate business. Upgrade or
          downgrade anytime as your needs change.
        </p>
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-3 mx-auto max-w-5xl">
        {subscriptionPackages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`flex flex-col h-full ${
              pkg.isPopular
                ? "border-realtyplus shadow-lg ring-2 ring-realtyplus"
                : "border-gray-200"
            }`}
          >
            <CardHeader
              className={`pb-4 ${pkg.isPopular ? "bg-realtyplus/5" : ""}`}
            >
              {pkg.isPopular && (
                <Badge className="bg-realtyplus mx-auto mb-2 w-fit text-white">
                  Most Popular
                </Badge>
              )}
              <CardTitle className="font-bold text-xl text-center">
                {pkg.name}
              </CardTitle>
              <CardDescription className="text-center">
                {pkg.description}
              </CardDescription>
              <div className="mt-4 text-center">
                <span className="font-bold text-3xl">
                  {pkg.currency}
                  {pkg.price}
                </span>
                <span className="ml-1 text-gray-500">/month per agent</span>
              </div>
              <p className="mt-2 font-medium text-center">
                {pkg.listingsPerMonth} listings per month
              </p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="mt-0.5 mr-2 w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              <Button
                onClick={() => handleSelectPackage(pkg.id)}
                className={`w-full ${
                  pkg.isPopular ? "bg-realtyplus hover:bg-realtyplus-dark" : ""
                }`}
                variant={pkg.isPopular ? "default" : "outline"}
              >
                {pkg.tier === "free" ? "Start Free Trial" : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-gray-600 text-center">
        <p>Have questions about our subscription plans?</p>
        <p className="mt-2">
          <a href="/contact" className="text-realtyplus hover:underline">
            Contact our sales team
          </a>{" "}
          or call us at +260 97 1234567
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPage;
