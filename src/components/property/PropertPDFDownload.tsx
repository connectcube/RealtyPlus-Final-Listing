import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

const generateAndDownloadPDF = async (property: any, propertyPostedBy: any) => {
  // Create a temporary container with an ID
  const printContainer = document.createElement("div");
  printContainer.id = "pdf-content"; // Add this ID to match the selector
  printContainer.style.position = "absolute";
  printContainer.style.left = "-9999px";
  printContainer.style.top = "-9999px";
  document.body.appendChild(printContainer);
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
  // Your HTML content generation...
  printContainer.innerHTML = `
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
            color: #e31837;
            font-size: 14px;
            margin-bottom: 16px;
          }
          
          .price-banner {
            background-color: #e31837;
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
          <div class="price-banner">K ${property.price}</div>
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
  `;

  try {
    // Pre-load all images before generating PDF
    const images = Array.from(printContainer.getElementsByTagName("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve, reject) => {
            // Set crossOrigin for external images
            img.crossOrigin = "anonymous";

            if (img.complete) {
              resolve(true);
            } else {
              img.onload = () => resolve(true);
              img.onerror = () => {
                console.warn(`Failed to load image: ${img.src}`);
                // Replace with placeholder or remove the image
                img.remove();
                resolve(true);
              };
            }
          })
      )
    );

    // Create PDF with proper settings
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
      compress: true,
    });

    // Use html2canvas with optimized settings
    const canvas = await html2canvas(printContainer, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable CORS for images
      allowTaint: true, // Allow tainted canvas
      logging: false,
      windowWidth: 1200, // Match your max-width
      backgroundColor: "#ffffff",
      imageTimeout: 15000, // Increase timeout for image loading
      onclone: (document) => {
        // Fix any dynamic content in the cloned document
        const clonedContainer = document.getElementById("pdf-content");
        if (clonedContainer) {
          // Ensure all styles are applied
          clonedContainer.style.width = "1200px";
          clonedContainer.style.margin = "0";
          clonedContainer.style.padding = "40px";
        }
      },
    });

    // Calculate dimensions
    const imgWidth = 595.28; // A4 width in points
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 841.89; // A4 height in points

    // Add first page
    let position = 0;
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 1.0),
      "JPEG",
      0,
      position,
      imgWidth,
      imgHeight,
      "",
      "FAST"
    );

    // Add additional pages if content overflows
    let heightLeft = imgHeight - pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 1.0),
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight,
        "",
        "FAST"
      );
      heightLeft -= pageHeight;
    }

    // Save the PDF
    const fileName = `${property.title
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()}-details.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error; // Rethrow to handle in the component
  } finally {
    // Clean up
    if (printContainer && printContainer.parentNode) {
      printContainer.parentNode.removeChild(printContainer);
    }
  }
};
/* Enhanced version with loading state and error handling
const PropertyDetail: React.FC<{ property: any }> = ({ property }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateAndDownloadPDF(property, propertyPostedBy);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // You might want to show an error toast/notification here
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    // ... rest of your component
    <Button
      onClick={handleDownloadPDF}
      disabled={isGeneratingPDF}
      className="flex items-center gap-2"
    >
      {isGeneratingPDF ? (
        <>
          <span className="animate-spin">⌛</span>
          Generating PDF...
        </>
      ) : (
        <>
          <Download size={18} />
          Download PDF
        </>
      )}
    </Button>
  );
};

// Utility function to handle image loading
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable CORS
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

// Enhanced PDF generation with image optimization
const optimizePDFGeneration = async (element: HTMLElement) => {
  // Pre-load and optimize images
  const images = Array.from(element.getElementsByTagName("img"));
  await Promise.all(
    images.map(async (img) => {
      try {
        const optimizedImg = await loadImage(img.src);
        img.src = optimizedImg.src;
      } catch (error) {
        console.warn(`Failed to optimize image: ${img.src}`, error);
      }
    })
  );

  // Configure html2canvas options for better quality
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    allowTaint: true,
    backgroundColor: "#ffffff",
    windowWidth: 800,
    windowHeight: undefined,
  });

  return canvas;
};*/

// Usage example with loading states and error handling
export const DownloadPDFButton: React.FC<{
  property: any;
  propertyPostedBy: any;
}> = ({ property, propertyPostedBy }) => {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const handleClick = async () => {
    try {
      setStatus("loading");
      await generateAndDownloadPDF(property, propertyPostedBy);
      setStatus("idle");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setStatus("error");
      // Show error notification
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={status === "loading"}
      className={`flex items-center gap-2 ${
        status === "error" ? "bg-red-500" : ""
      }`}
    >
      {status === "loading" ? (
        <>
          <span className="animate-spin">⌛</span>
          Generating PDF...
        </>
      ) : status === "error" ? (
        <>
          <XCircle size={18} />
          Failed to generate PDF
        </>
      ) : (
        <>
          <Download size={18} />
          Download PDF
        </>
      )}
    </Button>
  );
};
