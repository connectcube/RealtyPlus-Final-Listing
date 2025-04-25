import { useState, useRef, useEffect, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  FileText,
  XCircle,
  EyeIcon,
} from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { LISTING, USER } from "@/lib/typeDefinitions";
import { LoadingSpinner } from "../globalScreens/Loader";
import { ErrorMessage } from "../globalScreens/Error";
import { NotFound } from "../globalScreens/Message";
import { DownloadPDFButton } from "./PropertPDFDownload";
import formatViewCount from "@/helpers/formatViewCount";
import updateViewCount from "@/services/listingViewCountUpdate";
import { useZustand } from "@/lib/zustand";
import { toast } from "react-toastify";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}
const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, setUser } = useZustand();
  const [activeTab, setActiveTab] = useState("details");
  const [showContactForm, setShowContactForm] = useState(false);
  const propertyContentRef = useRef<HTMLDivElement>(null);
  const [property, setProperty] = useState<LISTING | null>(null);
  const [propertyPostedBy, setPropertyPostedBy] = useState<USER | null>(null);
  const [loadingPoster, setLoadingPoster] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleContactFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Compile the email body
    const emailBody = `
Hello,

${formData.message}

Contact Details:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

Best regards,
${formData.name}
    `.trim();

    // Create mailto URL with encoded parameters
    const mailtoLink = `mailto:${
      propertyPostedBy.email
    }?subject=Property Inquiry: ${encodeURIComponent(
      property.title
    )}&body=${encodeURIComponent(emailBody)}`;

    // Open default email client
    window.location.href = mailtoLink;
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!id) return;
      try {
        await updateViewCount(id);
      } catch (error) {
        // Do nothing as it is not critical to the app.l;lvl;lvfpbj
      }
      try {
        setLoading(true);
        const propertyRef = doc(fireDataBase, "listings", id);
        const propertySnap = await getDoc(propertyRef);

        if (!propertySnap.exists()) {
          setError("Property not found");
          return;
        }

        const propertyData = propertySnap.data() as LISTING;
        const propertyWithId = {
          ...propertyData,
          uid: propertySnap.id,
        };

        // Only proceed if component is still mounted
        if (!isMounted) return;

        setProperty(propertyWithId);

        // If we have a postedBy reference, fetch user data immediately
        if (propertyData.postedBy) {
          setLoadingPoster(true);
          try {
            const userSnap = await getDoc(propertyData.postedBy);
            if (userSnap.exists() && isMounted) {
              const userData = userSnap.data() as USER;
              setPropertyPostedBy({
                uid: userSnap.id,
                ...userData,
              });
            }
          } catch (err) {
            console.error("Error fetching property poster:", err);
          } finally {
            if (isMounted) {
              setLoadingPoster(false);
              setFormData({
                ...formData,
                message: `I'm interested in ${property?.title} (Ref: ${id}). Please contact me with more information.`,
              });
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Error fetching property details");
          console.error("Error fetching property:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent setting state on unmounted component
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ErrorMessage message={error} />
      </div>
    );
  }
  if (!property) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <NotFound message="Property doe not exist" />
      </div>
    );
  }
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

  const handleFavClick = (propertyId: string) => {
    try {
      if (!user) {
        console.log("User not logged in");
        toast.error("Please log in to save properties.");
        return;
      }

      // Check if property is already saved
      const isAlreadySaved = user.savedProperties?.includes(propertyId);

      let updatedSavedProperties;
      if (isAlreadySaved) {
        // Remove from favorites
        updatedSavedProperties =
          user.savedProperties?.filter((savedId) => savedId !== propertyId) ||
          [];
      } else {
        // Add to favorites
        updatedSavedProperties = [...(user.savedProperties || []), propertyId];
      }

      // Update local state
      setUser({
        ...user,
        savedProperties: updatedSavedProperties,
      });

      // If you're using Firebase, update the database
      const userRef = doc(fireDataBase, user.userType, user.uid);
      updateDoc(userRef, {
        savedProperties: updatedSavedProperties,
      });
    } catch (error) {
      console.error("Error handling favorite:", error);
    }
  };

  // And the isFavorite check would be simpler too:
  const handleCheckFav = (propertyId: string) => {
    if (!user || !user.savedProperties) return false;
    return user.savedProperties.includes(propertyId);
  };
  const handlePropertyClick = (id: string) => {
    console.log(`Navigating to property ${id} details`);
  };
  const generatePropertyPDF = (property: any, propertyPostedBy: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formatPrice = (price: number) => {
      return `K ${price.toLocaleString("en-US")}`;
    };

    const featureLabels = {
      airConditioning: "Air Conditioning",
      backupPower: "Backup Power",
      borehole: "Borehole",
      fittedKitchen: "Fitted Kitchen",
      garden: "Garden",
      parking: "Parking",
      securitySystem: "Security System",
      servantsQuarters: "Servants Quarters",
      swimmingPool: "Swimming Pool",
    };

    printWindow.document.write(`
    <html>
      <head>
        <title>${property.title} - Property Details</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            padding: 40px;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e31837;
          }
          
          .logo {
            max-width: 200px;
            margin-bottom: 20px;
          }
          
          .property-title {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
          }
          
          .property-ref {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 16px;
          }
          
          .price-banner {
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 24px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 24px;
          }
          
          .main-image {
            width: 100%;
            height: 400px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 24px;
          }
          
          .image-gallery {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 32px;
          }
          
          .gallery-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 8px;
          }
          
          .property-overview {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-bottom: 32px;
            padding: 24px;
            background-color: #f9fafb;
            border-radius: 12px;
          }
          
          .overview-item {
            text-align: center;
          }
          
          .overview-label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          
          .overview-value {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
          }
          
          .section {
            margin-bottom: 32px;
          }
          
          .section-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #1f2937;
          }
          
          .description {
            color: #4b5563;
            white-space: pre-line;
          }
          
          .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 32px;
          }
          
          .feature-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            background-color: #f9fafb;
            border-radius: 6px;
          }
          
          .feature-check {
            color: #e31837;
            font-weight: bold;
          }
          
          .agent-card {
            background-color: #f9fafb;
            border-radius: 12px;
            padding: 24px;
            margin-top: 32px;
          }
          
          .agent-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #1f2937;
          }
          
          .agent-info {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          
          .agent-detail {
            display: flex;
            flex-direction: column;
          }
          
          .agent-label {
            font-size: 14px;
            color: #6b7280;
          }
          
          .agent-value {
            font-weight: 500;
            color: #1f2937;
          }
          
          .footer {
            margin-top: 48px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
          }
          
          @media print {
            body {
              padding: 20px;
            }
            
            .main-image, .gallery-image {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            
            @page {
              margin: 20px;
              size: A4;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/logo.png" alt="RealtyPlus Logo" class="logo" />
          <h1 class="property-title">${property.title}</h1>
          <div class="property-ref">Reference: ${property.uid}</div>
          <div class="price-banner">${formatPrice(property.price)}</div>
        </div>
        
        <img src="${
          property.images[0]
        }" alt="Main Property Image" class="main-image" />
        
        <div class="image-gallery">
          ${property.images
            .slice(1, 4)
            .map(
              (image) => `
            <img src="${image}" alt="Property Image" class="gallery-image" />
          `
            )
            .join("")}
        </div>
        
        <div class="property-overview">
          <div class="overview-item">
            <div class="overview-label">Bedrooms</div>
            <div class="overview-value">${property.bedrooms}</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Bathrooms</div>
            <div class="overview-value">${property.bathrooms}</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Area</div>
            <div class="overview-value">${property.area} m²</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Garage Spaces</div>
            <div class="overview-value">${property.garageSpaces}</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Property Type</div>
            <div class="overview-value">${
              property.propertyType.charAt(0).toUpperCase() +
              property.propertyType.slice(1)
            }</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Year Built</div>
            <div class="overview-value">${property.yearBuilt}</div>
          </div>
        </div>
        
        <div class="section">
          <h2 class="section-title">Description</h2>
          <div class="description">${property.description}</div>
        </div>
        
        <div class="section">
          <h2 class="section-title">Features</h2>
          <div class="features-grid">
            ${Object.entries(property.features)
              .filter(([_, value]) => value === true)
              .map(
                ([key, _]) => `
                <div class="feature-item">
                  <span class="feature-check">✓</span>
                  <span>${featureLabels[key]}</span>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
        
        ${
          property.nearbyPlaces
            ? `
          <div class="section">
            <h2 class="section-title">Nearby Places</h2>
            <div class="features-grid">
              ${property.nearbyPlaces
                .map(
                  (place) => `
                <div class="feature-item">
                  <span class="feature-check">📍</span>
                  <span>${place.name} - ${place.distance}</span>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
        
        <div class="agent-card">
          <h3 class="agent-title">Contact Agent</h3>
          <div class="agent-info">
            <div class="agent-detail">
              <span class="agent-label">Agent Name</span>
              <span class="agent-value">${propertyPostedBy.firstName} ${
      propertyPostedBy.lastName
    }</span>
            </div>
            <div class="agent-detail">
              <span class="agent-label">Company</span>
              <span class="agent-value">${propertyPostedBy.company}</span>
            </div>
            <div class="agent-detail">
              <span class="agent-label">Phone</span>
              <span class="agent-value">${propertyPostedBy.phone}</span>
            </div>
            <div class="agent-detail">
              <span class="agent-label">Email</span>
              <span class="agent-value">${propertyPostedBy.email}</span>
            </div>
          </div>
        </div>
        
        <div class="footer">
          Generated by RealtyPlus | Property Reference: ${
            property.uid
          } | Date: ${new Date().toLocaleDateString()}
        </div>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };

  const handlePrintPage = () => {
    generatePropertyPDF(property, propertyPostedBy);
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate a PDF using a library like jsPDF
    // For now, we'll simulate it with an alert
    console.log("Downloading property details as PDF");
    alert(
      "PDF download functionality would be implemented here with a PDF generation library. The PDF would contain all property listing details including all images and nearby places information."
    );

    // Note: In a production app, we would use a library like jsPDF to create a PDF with
    // the same content structure as in the print function above, including all images and nearby places
  };

  return (
    <div
      className="flex flex-col bg-gray-50 min-h-screen"
      ref={propertyContentRef}
    >
      <Header />
      <main className="flex-grow mx-auto px-4 py-8 container">
        {/* Breadcrumb */}
        <div className="mb-4 text-gray-500 text-sm">
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
        <div className="flex md:flex-row flex-col justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="font-bold text-gray-900 text-2xl md:text-3xl">
              {property.title}
            </h1>
            <div className="flex items-center mt-2">
              <MapPin className="mr-1 w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                {property.neighborhood}, {property.city}, {property.province}
              </span>
            </div>
            <div className="flex items-center mt-2">
              <EyeIcon className="mr-1 w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                {formatViewCount(property.viewCount)} views
              </span>
            </div>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 py-1"
              onClick={() => handleFavClick(property.uid)}
            >
              <Heart
                className={`size-4 ${
                  handleCheckFav(property.uid)
                    ? "text-red-600 fill-red-400"
                    : "text-black"
                }`}
              />{" "}
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 py-1"
            >
              <Share2 className="size-4" /> Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 py-1"
              onClick={handlePrintPage}
            >
              <Printer className="size-4" /> Print
            </Button>
            <DownloadPDFButton
              property={property}
              propertyPostedBy={propertyPostedBy}
            />
          </div>
        </div>

        <div className="gap-6 lg:gap-8 grid grid-cols-1 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white shadow-sm mb-8 rounded-lg overflow-hidden">
              <Carousel className="w-full">
                <CarouselContent>
                  <CarouselItem key={property.coverPhotoIndex}>
                    <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px]">
                      <img
                        src={property.images[property.coverPhotoIndex]}
                        alt={`${property.title} - Image ${property.coverPhotoIndex}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                  {property.images.map(
                    (image, index) =>
                      property.coverPhotoIndex !== index && (
                        <CarouselItem key={index}>
                          <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px]">
                            <img
                              src={image}
                              alt={`${property.title} - Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </CarouselItem>
                      )
                  )}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>

            {/* Property Details Tabs */}
            <div className="bg-white shadow-sm mb-8 rounded-lg overflow-hidden">
              <Tabs defaultValue="details" onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 md:grid-cols-5 bg-gray-100 w-full overflow-x-auto">
                  <TabsTrigger value="details" className="py-1">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="features" className="py-1">
                    Features
                  </TabsTrigger>
                  <TabsTrigger value="nearby" className="py-1">
                    Nearby Places
                  </TabsTrigger>
                  <TabsTrigger value="location" className="py-1">
                    Location
                  </TabsTrigger>
                  <TabsTrigger value="video" className="py-1">
                    Video Tour
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="p-6">
                  {/* Property Details */}
                  <div className="gap-3 md:gap-4 grid grid-cols-2 md:grid-cols-4 mb-6">
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Bed className="mb-1 w-6 h-6 text-realtyplus" />
                      <span className="text-gray-500 text-sm">Bedrooms</span>
                      <span className="font-semibold">{property.bedrooms}</span>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Bath className="mb-1 w-6 h-6 text-realtyplus" />
                      <span className="text-gray-500 text-sm">Bathrooms</span>
                      <span className="font-semibold">
                        {property.bathrooms}
                      </span>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Grid className="mb-1 w-6 h-6 text-realtyplus" />
                      <span className="text-gray-500 text-sm">Area</span>
                      <span className="font-semibold">{property.area} m²</span>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 p-3 rounded-lg">
                      <Car className="mb-1 w-6 h-6 text-realtyplus" />
                      <span className="text-gray-500 text-sm">Garage</span>
                      <span className="font-semibold">
                        {property.garageSpaces} Cars
                      </span>
                    </div>
                  </div>

                  <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6">
                    <div className="flex items-center">
                      <Home className="mr-2 w-5 h-5 text-realtyplus" />
                      <div>
                        <span className="block text-gray-500 text-sm">
                          Type
                        </span>
                        <span className="font-medium">
                          {property.propertyType.charAt(0).toUpperCase() +
                            property.propertyType.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 w-5 h-5 text-realtyplus" />
                      <div>
                        <span className="block text-gray-500 text-sm">
                          Year Built
                        </span>
                        <span className="font-medium">
                          {property.yearBuilt}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="mr-2 w-5 h-5 text-realtyplus" />
                      <div>
                        <span className="block text-gray-500 text-sm">
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
                    <h3 className="mb-4 font-semibold text-xl">Description</h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="p-6">
                  <h3 className="mb-4 font-semibold text-xl">
                    Property Features
                  </h3>
                  <div className="gap-y-4 grid grid-cols-1 md:grid-cols-2 p-4 border rounded-lg">
                    {/* Air Conditioning */}
                    <span className="flex items-center gap-2">
                      {property.features.airConditioning ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                      <h1>Air Conditioning</h1>
                    </span>

                    {/* Backup Power */}
                    <span className="flex items-center gap-2">
                      {property.features.backupPower ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                      <h1>Backup Power</h1>
                    </span>

                    {/* Borehole */}
                    <span className="flex items-center gap-2">
                      {property.features.borehole ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                      <h1>Borehole</h1>
                    </span>

                    {/* Fitted Kitchen */}
                    <span className="flex items-center gap-2">
                      {property.features.fittedKitchen ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                      <h1>Fitted Kitchen</h1>
                    </span>

                    {/* Garden */}
                    <span className="flex items-center gap-2">
                      {property.features.garden ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                      <h1>Garden</h1>
                    </span>

                    {/* Parking */}
                    <span className="flex items-center gap-2">
                      {property.features.parking ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                      <h1>Parking</h1>
                    </span>

                    {/* Security System */}
                    <span className="flex items-center gap-2">
                      {property.features.securitySystem ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                      <h1>Security System</h1>
                    </span>

                    {/* Servants Quarters */}
                    <span className="flex items-center gap-2">
                      {property.features.servantsQuarters ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                      <h1>Servants Quarters</h1>
                    </span>

                    {/* Swimming Pool */}
                    <span className="flex items-center gap-2">
                      {property.features.swimmingPool ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                      <h1>Swimming Pool</h1>
                    </span>
                  </div>

                  <div className="flex md:flex-row flex-col gap-4 mt-6">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handlePrintPage}
                    >
                      <Printer className="w-4 h-4" /> Print Features
                    </Button>
                  </div>
                </TabsContent>

                {/* Location Tab */}
                <TabsContent value="nearby" className="p-6">
                  <h3 className="mb-4 font-semibold text-xl">Nearby Places</h3>
                  <div className="gap-3 md:gap-4 grid grid-cols-1 sm:grid-cols-2">
                    {property.nearbyPlaces &&
                      property.nearbyPlaces.map((place, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-gray-50 p-3 rounded-lg"
                        >
                          {place.type === "school" && (
                            <FileText className="mr-3 w-5 h-5 text-blue-500" />
                          )}
                          {place.type === "transport" && (
                            <MapPin className="mr-3 w-5 h-5 text-red-500" />
                          )}
                          {place.type === "shopping" && (
                            <Grid className="mr-3 w-5 h-5 text-purple-500" />
                          )}
                          {place.type === "church" && (
                            <Home className="mr-3 w-5 h-5 text-green-500" />
                          )}
                          {place.type === "mosque" && (
                            <Home className="mr-3 w-5 h-5 text-green-500" />
                          )}
                          {place.type === "hospital" && (
                            <CheckCircle2 className="mr-3 w-5 h-5 text-red-500" />
                          )}
                          {place.type === "restaurant" && (
                            <Calendar className="mr-3 w-5 h-5 text-orange-500" />
                          )}
                          <div>
                            <span className="font-medium">{place.name}</span>
                            <span className="block text-gray-500 text-sm">
                              {place.distance}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="location" className="p-6">
                  <h3 className="mb-4 font-semibold text-xl">Location</h3>
                  <div className="rounded-lg w-full aspect-video overflow-hidden">
                    <iframe
                      src={property.address}
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
                  <h3 className="mb-4 font-semibold text-xl">Video Tour</h3>
                  <div className="flex justify-center items-center bg-gray-100 rounded-lg w-full aspect-video">
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
                <div className="mb-2 font-bold text-realtyplus text-3xl">
                  K{property.price.toLocaleString()}
                </div>
                <div className="flex items-center mb-6 text-gray-500">
                  <Grid className="mr-1 w-4 h-4" />
                  <span className="text-sm">
                    {property.area} m² (K
                    {Math.round(
                      Number(property.price) / Number(property.area)
                    ).toLocaleString()}
                    /m²)
                  </span>
                </div>
                <Button className="bg-realtyplus hover:bg-realtyplus-dark mb-3 w-full">
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
                  <h3 className="mb-4 font-semibold text-lg">Contact Agent</h3>
                  <form
                    className="space-y-4"
                    onSubmit={handleContactFormSubmit}
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="block mb-1 font-medium text-gray-700 text-sm"
                      >
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="p-2 border border-gray-300 focus:border-realtyplus rounded-md focus:ring-realtyplus w-full"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block mb-1 font-medium text-gray-700 text-sm"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="p-2 border border-gray-300 focus:border-realtyplus rounded-md focus:ring-realtyplus w-full"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block mb-1 font-medium text-gray-700 text-sm"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="p-2 border border-gray-300 focus:border-realtyplus rounded-md focus:ring-realtyplus w-full"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="block mb-1 font-medium text-gray-700 text-sm"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="p-2 border border-gray-300 focus:border-realtyplus rounded-md focus:ring-realtyplus w-full"
                        placeholder="I'm interested in this property..."
                      ></textarea>
                    </div>

                    <Button
                      type="submit"
                      disabled={false}
                      className="bg-realtyplus hover:bg-realtyplus-dark w-full"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Agent Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold text-lg">Listed By</h3>
                <div className="flex items-center mb-4">
                  <img
                    src={propertyPostedBy?.pfp || ""}
                    alt={`${propertyPostedBy?.firstName} ${propertyPostedBy?.lastName}`}
                    className="mr-4 rounded-full w-16 h-16"
                  />
                  <div>
                    <h4 className="font-medium">{`${propertyPostedBy?.firstName} ${propertyPostedBy?.lastName}`}</h4>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href={`tel:${propertyPostedBy.phone}`}
                    className="flex items-center text-gray-700 hover:text-realtyplus"
                  >
                    <Phone className="mr-2 w-4 h-4" />
                    {propertyPostedBy.phone}
                  </a>
                  <a
                    href={`mailto:${propertyPostedBy.email}`}
                    className="flex items-center text-gray-700 hover:text-realtyplus"
                  >
                    <Mail className="mr-2 w-4 h-4" />
                    {propertyPostedBy.email}
                  </a>
                  <Button
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={handleContactAgent}
                  >
                    <MessageSquare className="mr-2 w-4 h-4" /> Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Properties 
        <div className="mt-12">
          <h2 className="mb-6 font-bold text-2xl">Similar Properties</h2>
          <div className="gap-4 sm:gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                propertyType={
                  property.propertyType as
                    | "standalone"
                    | "semi-detached"
                    | "apartment"
                    | "other"
                }
                isFeatured={property.isFeatured}
                isFurnished={property.isFurnished}
                yearBuilt={property.yearBuilt}
                onFavorite={handleFavorite}
                onClick={handlePropertyClick}
              />
            ))}
          </div>
        </div>*/}
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
