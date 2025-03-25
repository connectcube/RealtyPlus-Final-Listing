import React, { useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import SearchFilters from "../search/SearchFilters";
import PropertyCard from "./PropertyCard";
import { Button } from "../ui/button";
import { Grid, List, MapPin } from "lucide-react";

// Mock properties for sale data
const mockPropertiesForSale = [
  {
    id: "sale-1",
    title: "Modern 3 Bedroom House in Kabulonga",
    price: 2500000,
    location: "Kabulonga, Lusaka",
    bedrooms: 3,
    bathrooms: 2,
    area: 240,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    propertyType: "standalone",
    isFeatured: true,
    isFurnished: true,
    yearBuilt: 2020,
  },
  {
    id: "sale-2",
    title: "Luxury Apartment in Woodlands",
    price: 1800000,
    location: "Woodlands, Lusaka",
    bedrooms: 2,
    bathrooms: 2,
    area: 180,
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    propertyType: "apartment",
    isFeatured: false,
    isFurnished: true,
    yearBuilt: 2021,
  },
  {
    id: "sale-3",
    title: "Family Home in Roma",
    price: 3200000,
    location: "Roma, Lusaka",
    bedrooms: 4,
    bathrooms: 3,
    area: 320,
    imageUrl:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    propertyType: "standalone",
    isFeatured: true,
    isFurnished: false,
    yearBuilt: 2019,
  },
  {
    id: "sale-4",
    title: "Semi-Detached House in Olympia",
    price: 1950000,
    location: "Olympia, Lusaka",
    bedrooms: 3,
    bathrooms: 2,
    area: 210,
    imageUrl:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    propertyType: "semi-detached",
    isFeatured: false,
    isFurnished: true,
    yearBuilt: 2022,
  },
  {
    id: "sale-5",
    title: "Executive 5 Bedroom House with Pool",
    price: 4500000,
    location: "Ibex Hill, Lusaka",
    bedrooms: 5,
    bathrooms: 4,
    area: 450,
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    propertyType: "standalone",
    isFeatured: true,
    isFurnished: true,
    yearBuilt: 2021,
  },
  {
    id: "sale-6",
    title: "Commercial Property in Cairo Road",
    price: 8500000,
    location: "Cairo Road, Lusaka",
    bedrooms: 0,
    bathrooms: 2,
    area: 500,
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
    propertyType: "commercial",
    isFeatured: false,
    isFurnished: false,
    yearBuilt: 2018,
  },
];

const BuyProperties = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [properties, setProperties] = useState(mockPropertiesForSale);

  const handleFavorite = (id: string) => {
    console.log(`Property ${id} added to favorites`);
  };

  const handlePropertyClick = (id: string) => {
    console.log(`Navigating to property ${id} details`);
    window.location.href = `/property/${id}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Properties for Sale
          </h1>
          <p className="text-gray-600">
            Browse our selection of properties available for purchase in Zambia
          </p>
        </div>

        <SearchFilters />

        <div className="flex justify-between items-center my-6">
          <div className="text-gray-600">
            <p>
              <span className="font-semibold">{properties.length}</span>{" "}
              properties found
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                price={property.price}
                location={property.location}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                area={property.area}
                imageUrl={property.imageUrl}
                propertyType={property.propertyType}
                isFeatured={property.isFeatured}
                isFurnished={property.isFurnished}
                yearBuilt={property.yearBuilt}
                onFavorite={handleFavorite}
                onClick={handlePropertyClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row"
              >
                <div className="md:w-1/3 h-48 md:h-auto relative">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {property.isFeatured && (
                    <div className="absolute top-2 left-2 bg-realtyplus text-white text-xs font-semibold px-2 py-1 rounded">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3
                      className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-realtyplus"
                      onClick={() => handlePropertyClick(property.id)}
                    >
                      {property.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.location}</span>
                    </div>
                    <p className="text-2xl font-bold text-realtyplus mb-4">
                      K{property.price.toLocaleString()}
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-500 text-xs">Bedrooms</p>
                        <p className="font-semibold">
                          {property.bedrooms > 0 ? property.bedrooms : "N/A"}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-500 text-xs">Bathrooms</p>
                        <p className="font-semibold">{property.bathrooms}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-gray-500 text-xs">Area</p>
                        <p className="font-semibold">{property.area} m²</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${property.isFurnished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {property.isFurnished ? "Furnished" : "Unfurnished"}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {property.propertyType.charAt(0).toUpperCase() +
                          property.propertyType.slice(1)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePropertyClick(property.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No properties found matching your criteria.
            </p>
            <Button variant="link" className="mt-2">
              Clear all filters
            </Button>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button variant="outline" className="mr-2">
            Load More
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BuyProperties;
