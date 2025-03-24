import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

interface CallToActionProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const CallToAction = ({
  title = "Ready to Find Your Dream Property?",
  description = "Join thousands of satisfied customers who found their perfect property through RealtyZambia",
  primaryButtonText = "Browse Properties",
  primaryButtonLink = "/properties",
  secondaryButtonText = "List Your Property",
  secondaryButtonLink = "/list-property",
}: CallToActionProps) => {
  return (
    <section className="py-16 bg-realtyplus text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">{title}</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button className="bg-white text-realtyplus hover:bg-gray-100 text-lg py-6 px-8">
            <Link to={primaryButtonLink} className="w-full">
              {primaryButtonText}
            </Link>
          </Button>
          <Button className="bg-realtyplus-dark hover:bg-realtyplus/90 text-white text-lg py-6 px-8">
            <Link to={secondaryButtonLink} className="w-full">
              {secondaryButtonText}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
