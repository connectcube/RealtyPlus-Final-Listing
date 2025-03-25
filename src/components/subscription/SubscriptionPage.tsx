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
];

const SubscriptionPage = () => {
  const navigate = useNavigate();

  const handleSelectPackage = (packageId: string) => {
    // Here you would typically process the subscription
    // For now, we'll just navigate to a success page or dashboard
    navigate(`/agent/subscription/success?package=${packageId}`);
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Subscription Plan
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your real estate business. Upgrade or
          downgrade anytime as your needs change.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {subscriptionPackages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`flex flex-col h-full ${pkg.isPopular ? "border-realtyplus shadow-lg ring-2 ring-realtyplus" : "border-gray-200"}`}
          >
            <CardHeader
              className={`pb-4 ${pkg.isPopular ? "bg-realtyplus/5" : ""}`}
            >
              {pkg.isPopular && (
                <Badge className="w-fit mx-auto mb-2 bg-realtyplus text-white">
                  Most Popular
                </Badge>
              )}
              <CardTitle className="text-xl font-bold text-center">
                {pkg.name}
              </CardTitle>
              <CardDescription className="text-center">
                {pkg.description}
              </CardDescription>
              <div className="mt-4 text-center">
                <span className="text-3xl font-bold">
                  {pkg.currency}
                  {pkg.price}
                </span>
                <span className="text-gray-500 ml-1">/month per agent</span>
              </div>
              <p className="text-center font-medium mt-2">
                {pkg.listingsPerMonth} listings per month
              </p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              <Button
                onClick={() => handleSelectPackage(pkg.id)}
                className={`w-full ${pkg.isPopular ? "bg-realtyplus hover:bg-realtyplus-dark" : ""}`}
                variant={pkg.isPopular ? "default" : "outline"}
              >
                {pkg.tier === "free" ? "Start Free Trial" : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center text-gray-600">
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
