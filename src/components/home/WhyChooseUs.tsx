import React from "react";
import { Search, Shield, Users } from "lucide-react";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature = ({ icon, title, description }: FeatureProps) => {
  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="bg-realtyplus/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const WhyChooseUs = () => {
  const features = [
    {
      icon: <Search className="h-10 w-10 text-realtyplus" />,
      title: "Extensive Property Listings",
      description:
        "Access thousands of verified properties across Zambia, updated daily with new listings. Find exactly what you're looking for with our advanced search filters.",
    },
    {
      icon: <Shield className="h-10 w-10 text-realtyplus" />,
      title: "Trusted and Secure",
      description:
        "All our listings are verified and we ensure secure transactions between buyers and sellers. Our platform provides a safe environment for all your property needs.",
    },
    {
      icon: <Users className="h-10 w-10 text-realtyplus" />,
      title: "Expert Support",
      description:
        "Our team of real estate professionals is always available to assist you with your property needs. Get personalized guidance throughout your property journey.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose RealtyPlus
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
