import React from "react";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import FeaturedProperties from "./property/FeaturedProperties";
import SearchFilters from "./search/SearchFilters";
import { Button } from "./ui/button";
import {
  ArrowRight,
  Home as HomeIcon,
  Building,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import HeroSection from "./home/HeroSection";
import PropertyCategories from "./home/PropertyCategories";
import WhyChooseUs from "./home/WhyChooseUs";
import PopularLocations from "./home/PopularLocations";
import CallToAction from "./home/CallToAction";
import ContactSection from "./home/ContactSection";

function Home() {
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen overflow-x-hidden">
      <Header />
      <main className="flex flex-col flex-grow gap-2">
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Properties Section */}
        <FeaturedProperties />

        {/* Property Categories */}
        <PropertyCategories />

        {/* Why Choose Us Section */}
        <WhyChooseUs />

        {/* Featured Locations */}
        <PopularLocations />

        {/* Call to Action */}
        <CallToAction />

        {/* Contact Section */}
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

export default Home;
