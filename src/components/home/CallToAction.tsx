import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { useZustand } from "@/lib/zustand";

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
  const { user } = useZustand();
  return (
    <section className="bg-realtyplus py-16 w-[100svw] text-white">
      {" "}
      <div className="mx-auto px-4 text-center container">
        <h2 className="mb-6 font-bold text-3xl">{title}</h2>
        <p className="mx-auto mb-8 max-w-2xl text-xl">{description}</p>
        <div className="flex sm:flex-row flex-col justify-center gap-3 sm:gap-4">
          <Button className="bg-white hover:bg-gray-100 px-8 py-6 text-realtyplus text-lg">
            <Link to={primaryButtonLink} className="w-full">
              {primaryButtonText}
            </Link>
          </Button>
          {user !== null && user.userType !== "users" && (
            <Button className="bg-realtyplus-dark hover:bg-realtyplus/90 px-8 py-6 text-white text-lg">
              <Link to={secondaryButtonLink} className="w-full">
                {secondaryButtonText}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
