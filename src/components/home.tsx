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

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section
          className="relative bg-cover bg-center h-[600px]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Find Your Perfect Property in Zambia
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-white">
              Your trusted partner for buying, selling, and renting properties
              across Zambia
            </p>
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <Button className="flex-1 h-12 text-lg bg-emerald-600 hover:bg-emerald-700">
                  <Link
                    to="/buy"
                    className="flex items-center justify-center w-full text-white"
                  >
                    <HomeIcon className="mr-2 h-5 w-5" /> Buy
                  </Link>
                </Button>
                <Button className="flex-1 h-12 text-lg bg-emerald-600 hover:bg-emerald-700">
                  <Link
                    to="/rent"
                    className="flex items-center justify-center w-full text-white"
                  >
                    <Building className="mr-2 h-5 w-5" /> Rent
                  </Link>
                </Button>
                <Button className="flex-1 h-12 text-lg bg-emerald-600 hover:bg-emerald-700">
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

        {/* Featured Properties Section */}
        <FeaturedProperties />

        {/* Property Categories */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Browse Properties by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="relative rounded-lg overflow-hidden group cursor-pointer h-64 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
                  alt="Residential"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Residential
                  </h3>
                  <p className="text-gray-200 mb-4">
                    Find your dream home in prime locations
                  </p>
                  <Link
                    to="/properties?type=residential"
                    className="inline-flex items-center text-white hover:text-emerald-300 transition-colors"
                  >
                    View Properties <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="relative rounded-lg overflow-hidden group cursor-pointer h-64 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80"
                  alt="Commercial"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Commercial
                  </h3>
                  <p className="text-gray-200 mb-4">
                    Office spaces and retail properties
                  </p>
                  <Link
                    to="/properties?type=commercial"
                    className="inline-flex items-center text-white hover:text-emerald-300 transition-colors"
                  >
                    View Properties <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="relative rounded-lg overflow-hidden group cursor-pointer h-64 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"
                  alt="Land"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">Land</h3>
                  <p className="text-gray-200 mb-4">
                    Plots and development opportunities
                  </p>
                  <Link
                    to="/properties?type=land"
                    className="inline-flex items-center text-white hover:text-emerald-300 transition-colors"
                  >
                    View Properties <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="relative rounded-lg overflow-hidden group cursor-pointer h-64 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80"
                  alt="New Developments"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    New Developments
                  </h3>
                  <p className="text-gray-200 mb-4">
                    Brand new properties and developments
                  </p>
                  <Link
                    to="/properties?type=new-developments"
                    className="inline-flex items-center text-white hover:text-emerald-300 transition-colors"
                  >
                    View Properties <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose RealtyZambia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Extensive Property Listings
                </h3>
                <p className="text-gray-600">
                  Access thousands of verified properties across Zambia, updated
                  daily with new listings. Find exactly what you're looking for
                  with our advanced search filters.
                </p>
              </div>

              <div className="text-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Trusted and Secure
                </h3>
                <p className="text-gray-600">
                  All our listings are verified and we ensure secure
                  transactions between buyers and sellers. Our platform provides
                  a safe environment for all your property needs.
                </p>
              </div>

              <div className="text-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Expert Support</h3>
                <p className="text-gray-600">
                  Our team of real estate professionals is always available to
                  assist you with your property needs. Get personalized guidance
                  throughout your property journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Locations */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Popular Locations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Link to="/properties?location=lusaka" className="group">
                <div className="relative rounded-lg overflow-hidden h-40 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1580746738099-75b3b5a43c36?w=800&q=80"
                    alt="Lusaka"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white">Lusaka</h3>
                  </div>
                </div>
              </Link>
              <Link to="/properties?location=kitwe" className="group">
                <div className="relative rounded-lg overflow-hidden h-40 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1580746738099-75b3b5a43c36?w=800&q=80"
                    alt="Kitwe"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white">Kitwe</h3>
                  </div>
                </div>
              </Link>
              <Link to="/properties?location=ndola" className="group">
                <div className="relative rounded-lg overflow-hidden h-40 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1580746738099-75b3b5a43c36?w=800&q=80"
                    alt="Ndola"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white">Ndola</h3>
                  </div>
                </div>
              </Link>
              <Link to="/properties?location=livingstone" className="group">
                <div className="relative rounded-lg overflow-hidden h-40 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1580746738099-75b3b5a43c36?w=800&q=80"
                    alt="Livingstone"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white">
                      Livingstone
                    </h3>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-emerald-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who found their perfect
              property through RealtyZambia
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button className="bg-white text-emerald-700 hover:bg-gray-100 text-lg py-6 px-8">
                <Link to="/properties" className="w-full">
                  Browse Properties
                </Link>
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-800 text-white text-lg py-6 px-8">
                <Link to="/list-property" className="w-full">
                  List Your Property
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                <p className="text-gray-600 mb-8">
                  Have questions about a property or need assistance? Our team
                  is here to help you every step of the way.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-emerald-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold">Our Office</h3>
                      <p className="text-gray-600">
                        123 Cairo Road, Lusaka, Zambia
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-6 w-6 text-emerald-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold">Phone</h3>
                      <p className="text-gray-600">+260 97 1234567</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-6 w-6 text-emerald-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-gray-600">info@realtyzambia.com</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold mb-6">
                  Send us a Message
                </h3>
                <form className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
