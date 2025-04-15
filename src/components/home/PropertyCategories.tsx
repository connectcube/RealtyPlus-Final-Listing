import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CategoryProps {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
}

const Category = ({ title, description, imageUrl, link }: CategoryProps) => {
  return (
    <div className="relative rounded-lg overflow-hidden group cursor-pointer h-64 shadow-md">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-200 mb-4">{description}</p>
        <Link
          to={link}
          className="inline-flex items-center text-white hover:text-realtyplus-light transition-colors"
        >
          View Properties <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

const PropertyCategories = () => {
  const categories = [
    {
      title: "Residential",
      description: "Find your dream home in prime locations",
      imageUrl:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      link: "/properties?propertyCategory=residential",
    },
    {
      title: "Commercial",
      description: "Office spaces and retail properties",
      imageUrl:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80",
      link: "/properties?propertyCategory=commercial",
    },
    {
      title: "Land",
      description: "Plots and development opportunities",
      imageUrl:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
      link: "/properties?propertyCategory=land",
    },
    {
      title: "New Developments",
      description: "Brand new properties and developments",
      imageUrl:
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
      link: "/properties?propertyCategory=new-developments",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Browse Properties by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {categories.map((category, index) => (
            <Category
              key={index}
              title={category.title}
              description={category.description}
              imageUrl={category.imageUrl}
              link={category.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyCategories;
