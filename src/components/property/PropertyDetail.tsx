import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Heart,
  Share2,
  Printer,
  MapPin,
  Bed,
  Bath,
  Grid,
  Calendar,
  Car,
  Home,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Map,
  Download,
  FileText,
} from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import PropertyCard from "./PropertyCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

interface PropertyAgent {
  id: string;
  name: string;
  phone: string;
  email: string;
  photo: string;
  company: string;
}

interface NearbyPlace {
  name: string;
  type: string;
  distance: string;
}

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("details");
  const [showContactForm, setShowContactForm] = useState(false);
  const propertyContentRef = useRef<HTMLDivElement>(null);

  // Mock property data - in a real app, this would be fetched from an API
  const property = {
    id: id || "prop-1",
    title: "Modern 3 Bedroom House in Kabulonga",
    description:
      "This beautiful modern home is located in the heart of Kabulonga, one of Lusaka's most prestigious neighborhoods. The property features spacious living areas, a modern kitchen with high-end appliances, and a landscaped garden with a swimming pool. Perfect for a family looking for comfort and luxury in a secure environment.",
    price: 450000,
    location: "Kabulonga, Lusaka",
    bedrooms: 3,
    bathrooms: 2,
    area: 240,
    garageSpaces: 2,
    yearBuilt: 2020,
    propertyType: "standalone",
    isFurnished: true,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7f34b5063c8?w=800&q=80",
    ],
    features: [
      "Swimming Pool",
      "Garden",
      "Security System",
      "Backup Power",
      "Borehole",
      "Air Conditioning",
      "Servants Quarters",
      "Fitted Kitchen",
      "Parking",
      "Double Glazing",
      "Central Heating",
      "Solar Panels",
      "Fireplace",
      "Balcony/Terrace",
      "Gym",
      "Outdoor Entertainment Area",
    ],
    nearbyPlaces: [
      {
        name: "Kabulonga Primary School",
        type: "school",
        distance: "0.5 miles",
      },
      {
        name: "International School of Lusaka",
        type: "school",
        distance: "1.2 miles",
      },
      {
        name: "Kabulonga Bus Station",
        type: "transport",
        distance: "0.3 miles",
      },
      { name: "Manda Hill Mall", type: "shopping", distance: "1.5 miles" },
      { name: "Lusaka Baptist Church", type: "church", distance: "0.8 miles" },
      { name: "Kabulonga Mosque", type: "mosque", distance: "1.0 miles" },
      {
        name: "Lusaka Trust Hospital",
        type: "hospital",
        distance: "2.3 miles",
      },
      {
        name: "The Misty Restaurant",
        type: "restaurant",
        distance: "0.4 miles",
      },
      { name: "Levy Junction Mall", type: "shopping", distance: "3.1 miles" },
      {
        name: "University Teaching Hospital",
        type: "hospital",
        distance: "4.2 miles",
      },
    ],
    mapLocation:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15461.965147237144!2d28.2833!3d-15.4167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19408b8cfa7a6b7d%3A0x2b5c3a0f0bd2a1be!2sKabulonga%2C%20Lusaka%2C%20Zambia!5e0!3m2!1sen!2sus!4v1625764298760!5m2!1sen!2sus",
  };

  // Mock agent data
  const agent: PropertyAgent = {
    id: "agent-1",
    name: "John Mwanza",
    phone: "+260 97 1234567",
    email: "john.mwanza@realtyzambia.com",
    photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    company: "RealtyZambia",
  };

  // Mock similar properties
  const similarProperties = [
    {
      id: "prop-2",
      title: "Luxury Apartment in Woodlands",
      price: 320000,
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
      id: "prop-3",
      title: "Family Home in Roma",
      price: 550000,
      location: "Roma, Lusaka",
      bedrooms: 4,
      bathrooms: 3,
      area: 320,
      imageUrl:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
      propertyType: "standalone",
      isFeatured: false,
      isFurnished: false,
      yearBuilt: 2019,
    },
    {
      id: "prop-4",
      title: "Semi-Detached House in Olympia",
      price: 380000,
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
  ];

  const handleContactAgent = () => {
    setShowContactForm(!showContactForm);
  };

  const handleFavorite = (id: string) => {
    console.log(`Property ${id} added to favorites`);
  };

  const handlePropertyClick = (id: string) => {
    console.log(`Navigating to property ${id} details`);
  };

  const handlePrintPage = () => {
    // Create a new window with only the property content
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Get the property content
    const propertyContent = propertyContentRef.current?.innerHTML;
    if (!propertyContent) return;

    // Create a simplified version with only the essential property details
    printWindow.document.write(`
      <html>
        <head>
          <title>${property.title} - Print</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            .property-details { margin-bottom: 20px; }
            .property-image { max-width: 100%; height: auto; margin-bottom: 20px; }
            .property-info { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
            .property-info div { flex: 1; min-width: 120px; }
            .features-list { columns: 2; }
            .price { font-size: 22px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .location { margin-bottom: 15px; color: #666; }
            .agent-info { border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px; }
            .image-gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
            .image-gallery img { width: 100%; height: auto; object-fit: cover; }
            .nearby-places { margin-bottom: 20px; }
            .nearby-places h3 { margin-bottom: 10px; }
            .nearby-places-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .nearby-place { display: flex; align-items: center; }
            .nearby-place-icon { margin-right: 8px; width: 16px; height: 16px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${property.title}</h1>
          <div class="location">${property.location}</div>
          <div class="price">K${property.price.toLocaleString()}</div>
          
          <div class="image-gallery">
            ${property.images.map((image, index) => `<img src="${image}" class="property-image" alt="${property.title} - Image ${index + 1}" />`).join("")}
          </div>
          
          <div class="property-info">
            <div><strong>Bedrooms:</strong> ${property.bedrooms}</div>
            <div><strong>Bathrooms:</strong> ${property.bathrooms}</div>
            <div><strong>Area:</strong> ${property.area} m²</div>
            <div><strong>Garage:</strong> ${property.garageSpaces} Cars</div>
            <div><strong>Property Type:</strong> ${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</div>
            <div><strong>Year Built:</strong> ${property.yearBuilt}</div>
            <div><strong>Furnishing:</strong> ${property.isFurnished ? "Furnished" : "Unfurnished"}</div>
          </div>
          
          <div class="property-details">
            <h3>Description</h3>
            <p>${property.description}</p>
          </div>
          
          <div class="property-details">
            <h3>Features</h3>
            <div class="features-list">
              ${property.features.map((feature) => `<div>✓ ${feature}</div>`).join("")}
            </div>
          </div>
          
          <div class="nearby-places">
            <h3>Nearby Places</h3>
            <div class="nearby-places-grid">
              ${
                property.nearbyPlaces
                  ? property.nearbyPlaces
                      .map(
                        (place) =>
                          `<div class="nearby-place"><span>✓ ${place.name}: ${place.distance}</span></div>`,
                      )
                      .join("")
                  : "<div>Information not available</div>"
              }
            </div>
          </div>
          
          <div class="agent-info">
            <h3>Contact Agent</h3>
            <p><strong>${agent.name}</strong> - ${agent.company}</p>
            <p>Phone: ${agent.phone}</p>
            <p>Email: ${agent.email}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
            Property Reference: ${property.id} | Generated from RealtyPlus
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      // Close the window after printing (optional)
      // printWindow.close();
    }, 500);
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate a PDF using a library like jsPDF
    // For now, we'll simulate it with an alert
    console.log("Downloading property details as PDF");
    alert(
      "PDF download functionality would be implemented here with a PDF generation library. The PDF would contain all property listing details including all images and nearby places information.",
    );

    // Note: In a production app, we would use a library like jsPDF to create a PDF with
    // the same content structure as in the print function above, including all images and nearby places
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50"
      ref={propertyContentRef}
    >
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:text-realtyplus">
            Home
          </a>{" "}
          &gt;
          <a href="/properties" className="hover:text-realtyplus">
            Properties
          </a>{" "}
          &gt;
          <span className="text-gray-700">{property.title}</span>
        </div>

        {/* Property Title and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {property.title}
            </h1>
            <div className="flex items-center mt-2">
              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-gray-600">{property.location}</span>
            </div>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => handleFavorite(property.id)}
            >
              <Heart className="h-4 w-4" /> Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handlePrintPage}
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <Carousel className="w-full">
                <CarouselContent>
                  {property.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="h-[250px] sm:h-[300px] md:h-[400px] w-full relative">
                        <img
                          src={image}
                          alt={`${property.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>

            {/* Property Details Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <Tabs defaultValue="details" onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3 md:grid-cols-5 bg-gray-100 overflow-x-auto">
                  <TabsTrigger value="details" className="py-3">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="features" className="py-3">
                    Features
                  </TabsTrigger>
                  <TabsTrigger value="nearby" className="py-3">
                    Nearby Places
                  </TabsTrigger>
                  <TabsTrigger value="location" className="py-3">
                    Location
                  </TabsTrigger>
                  <TabsTrigger value="video" className="py-3">
                    Video Tour
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                      <Bed className="h-6 w-6 text-realtyplus mb-1" />
                      <span className="text-sm text-gray-500">Bedrooms</span>
                      <span className="font-semibold">{property.bedrooms}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                      <Bath className="h-6 w-6 text-realtyplus mb-1" />
                      <span className="text-sm text-gray-500">Bathrooms</span>
                      <span className="font-semibold">
                        {property.bathrooms}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                      <Grid className="h-6 w-6 text-realtyplus mb-1" />
                      <span className="text-sm text-gray-500">Area</span>
                      <span className="font-semibold">{property.area} m²</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                      <Car className="h-6 w-6 text-realtyplus mb-1" />
                      <span className="text-sm text-gray-500">Garage</span>
                      <span className="font-semibold">
                        {property.garageSpaces} Cars
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center">
                      <Home className="h-5 w-5 text-realtyplus mr-2" />
                      <div>
                        <span className="text-sm text-gray-500 block">
                          Type
                        </span>
                        <span className="font-medium">
                          {property.propertyType.charAt(0).toUpperCase() +
                            property.propertyType.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-realtyplus mr-2" />
                      <div>
                        <span className="text-sm text-gray-500 block">
                          Year Built
                        </span>
                        <span className="font-medium">
                          {property.yearBuilt}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-realtyplus mr-2" />
                      <div>
                        <span className="text-sm text-gray-500 block">
                          Furnishing
                        </span>
                        <span className="font-medium">
                          {property.isFurnished ? "Furnished" : "Unfurnished"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Description</h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Property Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 border rounded-lg p-4">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-realtyplus mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col md:flex-row gap-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handlePrintPage}
                    >
                      <Printer className="h-4 w-4" /> Print Features
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handleDownloadPDF}
                    >
                      <FileText className="h-4 w-4" /> Download Property Sheet
                    </Button>
                  </div>
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="nearby" className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Nearby Places</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {property.nearbyPlaces.map((place, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        {place.type === "school" && (
                          <FileText className="h-5 w-5 text-blue-500 mr-3" />
                        )}
                        {place.type === "transport" && (
                          <MapPin className="h-5 w-5 text-red-500 mr-3" />
                        )}
                        {place.type === "shopping" && (
                          <Grid className="h-5 w-5 text-purple-500 mr-3" />
                        )}
                        {place.type === "church" && (
                          <Home className="h-5 w-5 text-green-500 mr-3" />
                        )}
                        {place.type === "mosque" && (
                          <Home className="h-5 w-5 text-green-500 mr-3" />
                        )}
                        {place.type === "hospital" && (
                          <CheckCircle2 className="h-5 w-5 text-red-500 mr-3" />
                        )}
                        {place.type === "restaurant" && (
                          <Calendar className="h-5 w-5 text-orange-500 mr-3" />
                        )}
                        <div>
                          <span className="font-medium">{place.name}</span>
                          <span className="text-sm text-gray-500 block">
                            {place.distance}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="location" className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Location</h3>
                  <div className="aspect-video w-full rounded-lg overflow-hidden">
                    <iframe
                      src={property.mapLocation}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Property Location"
                    ></iframe>
                  </div>
                </TabsContent>

                {/* Video Tour Tab */}
                <TabsContent value="video" className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Video Tour</h3>
                  <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Video tour coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Price Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-realtyplus mb-2">
                  K{property.price.toLocaleString()}
                </div>
                <div className="flex items-center text-gray-500 mb-6">
                  <Grid className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {property.area} m² (K
                    {Math.round(
                      property.price / property.area,
                    ).toLocaleString()}
                    /m²)
                  </span>
                </div>
                <Button className="w-full bg-realtyplus hover:bg-realtyplus-dark mb-3">
                  Request Viewing
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleContactAgent}
                >
                  Contact Agent
                </Button>
              </CardContent>
            </Card>

            {/* Contact Form */}
            {showContactForm && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Contact Agent</h3>
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-realtyplus focus:border-realtyplus"
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-realtyplus focus:border-realtyplus"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-realtyplus focus:border-realtyplus"
                        placeholder="Enter your phone number"
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-realtyplus focus:border-realtyplus"
                        placeholder="I'm interested in this property..."
                        defaultValue={`I'm interested in ${property.title} (Ref: ${property.id}). Please contact me with more information.`}
                      ></textarea>
                    </div>
                    <Button className="w-full bg-realtyplus hover:bg-realtyplus-dark">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Agent Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Listed By</h3>
                <div className="flex items-center mb-4">
                  <img
                    src={agent.photo}
                    alt={agent.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-medium">{agent.name}</h4>
                    <p className="text-sm text-gray-500">{agent.company}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href={`tel:${agent.phone}`}
                    className="flex items-center text-gray-700 hover:text-realtyplus"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {agent.phone}
                  </a>
                  <a
                    href={`mailto:${agent.email}`}
                    className="flex items-center text-gray-700 hover:text-realtyplus"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {agent.email}
                  </a>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={handleContactAgent}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" /> Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Properties */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {similarProperties.map((property) => (
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
