import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { HomeIcon, Building, MapPin } from "lucide-react";
import SearchFilters from "../search/SearchFilters";

interface HeroSectionProps {
  backgroundImage?: string;
}

const HeroSection = ({
  backgroundImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80",
}: HeroSectionProps) => {
  return (
    <section
      className="relative bg-cover bg-center h-[600px]"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 text-white">
          Find Your Perfect Property in Zambia
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-10 max-w-3xl mx-auto text-white">
          Your trusted partner for buying, selling, and renting properties
          across Zambia
        </p>
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 mb-4 md:mb-6">
            <Button className="flex-1 h-12 text-lg bg-realtyplus hover:bg-realtyplus-dark">
              <Link
                to="/buy"
                className="flex items-center justify-center w-full text-white"
              >
                <HomeIcon className="mr-2 h-5 w-5" /> Buy
              </Link>
            </Button>
            <Button className="flex-1 h-12 text-lg bg-realtyplus hover:bg-realtyplus-dark">
              <Link
                to="/rent"
                className="flex items-center justify-center w-full text-white"
              >
                <Building className="mr-2 h-5 w-5" /> Rent
              </Link>
            </Button>
            <Button className="flex-1 h-12 text-lg bg-realtyplus hover:bg-realtyplus-dark">
              <Link
                to="/list-property"
                className="flex items-center justify-center w-full text-white"
              >
                <MapPin className="mr-2 h-5 w-5" /> List Property
              </Link>
            </Button>
          </div>
          <SearchFilters className="border-none shadow-none p-0" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
