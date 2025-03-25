import React from "react";
import { Link } from "react-router-dom";

interface LocationProps {
  name: string;
  imageUrl: string;
  link: string;
}

const LocationCard = ({ name, imageUrl, link }: LocationProps) => {
  return (
    <Link to={link} className="group">
      <div className="relative rounded-lg overflow-hidden h-40 shadow-md">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold text-white">{name}</h3>
        </div>
      </div>
    </Link>
  );
};

const PopularLocations = () => {
  const locations = [
    {
      name: "Lusaka",
      imageUrl:
        "https://images.unsplash.com/photo-1580746738099-75b3b5a43c36?w=800&q=80",
      link: "/properties?location=lusaka",
    },
    {
      name: "Kitwe",
      imageUrl:
        "https://images.unsplash.com/photo-1580746738099-75b3b5a43c36?w=800&q=80",
      link: "/properties?location=kitwe",
    },
    {
      name: "Ndola",
      imageUrl:
        "https://images.unsplash.com/photo-1580746738099-75b3b5a43c36?w=800&q=80",
      link: "/properties?location=ndola",
    },
    {
      name: "Livingstone",
      imageUrl:
        "https://images.unsplash.com/photo-1580746738099-75b3b5a43c36?w=800&q=80",
      link: "/properties?location=livingstone",
    },
    {
      name: "Kabwe",
      imageUrl:
        "https://images.unsplash.com/photo-1580746738099-75b3b5a43c36?w=800&q=80",
      link: "/properties?location=kabwe",
    },
    {
      name: "Chingola",
      imageUrl:
        "https://images.unsplash.com/photo-1580746738099-75b3b5a43c36?w=800&q=80",
      link: "/properties?location=chingola",
    },
    {
      name: "Mufulira",
      imageUrl:
        "https://images.unsplash.com/photo-1580746738099-75b3b5a43c36?w=800&q=80",
      link: "/properties?location=mufulira",
    },
    {
      name: "Chipata",
      imageUrl:
        "https://images.unsplash.com/photo-1580746738099-75b3b5a43c36?w=800&q=80",
      link: "/properties?location=chipata",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Popular Locations
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {locations.slice(0, 8).map((location, index) => (
            <LocationCard
              key={index}
              name={location.name}
              imageUrl={location.imageUrl}
              link={location.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularLocations;
