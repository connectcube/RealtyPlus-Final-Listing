import React from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter } from "../ui/card";
import { cn } from "@/lib/utils";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Grid,
  ArrowUpRight,
  Eye,
  EyeIcon,
  EyeOff,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Link } from "react-router-dom";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import formatViewCount from "@/helpers/formatViewCount";

interface PropertyCardProps {
  id?: string;
  title?: string;
  price?: number | string;
  location?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  area?: number | string;
  imageUrl?: string;
  propertyType?:
    | "standalone"
    | "semi-detached"
    | "apartment"
    | "house"
    | "commercial"
    | "farmhouse"
    | "townhouse"
    | "other";
  isFeatured?: boolean;
  isFurnished?: boolean;
  isFavorite: () => boolean;
  yearBuilt?: number | string;
  onFavorite?: (id: string) => void;
  onClick?: (id: string) => void;
  viewCount?: number;
  isActive?: boolean;
  status?: string;
}

const PropertyCard = ({
  id,
  title = "Modern 3 Bedroom House in Kabulonga",
  price = 450000,
  location = "Kabulonga, Lusaka",
  bedrooms = 3,
  bathrooms = 2,
  area = 240,
  imageUrl = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  propertyType = "standalone",
  isFeatured = false,
  isFurnished = true,
  isFavorite = () => false,
  yearBuilt = 2020,
  onFavorite = () => {},
  onClick = () => {},
  viewCount = 0,
  isActive = false,
  status = "active",
}: PropertyCardProps) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite(id);
  };

  const handleCardClick = () => {
    onClick(id);
  };
  const isFavorited = isFavorite();
  return (
    <Card
      className={`relative flex flex-col bg-white hover:shadow-lg h-full overflow-hidden transition-all duration-300 ${
        status === "active" ? "cursor-pointer" : "grayscale filter"
      } `}
      onClick={status === "active" && handleCardClick}
    >
      {status !== "active" && (
        <div className="top-0 z-[999] absolute grayscale w-full h-full filter"></div>
      )}
      <div className="relative">
        <div className="top-2 right-2 z-10 absolute">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/80 hover:bg-white rounded-full"
                  onClick={handleFavoriteClick}
                >
                  <Heart
                    fill={isFavorited ? "#ef4444" : "#ffffff"}
                    className="w-5 h-5 text-gray-600 hover:text-red-500"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add to favorites</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {isFeatured && (
          <div className="top-2 left-2 z-10 absolute">
            <Badge className="bg-yellow-500 hover:bg-yellow-600">
              Featured
            </Badge>
          </div>
        )}

        <div className="right-2 bottom-2 z-10 absolute flex justify-center items-center gap-3 font-semibold text-xs">
          <Badge className="flex justify-center items-center gap-2 bg-black/30 backdrop-blur px-2 py-1 rounded-2xl text-white">
            <EyeOpenIcon /> {formatViewCount(viewCount)} views
          </Badge>
        </div>
        <div className="h-40 sm:h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          />
        </div>
      </div>

      <CardContent className="flex-grow p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
        </div>

        <div className="flex items-center mb-3 text-gray-500">
          <MapPin className="mr-1 w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>

        <div className="flex justify-between mb-3">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              propertyType === "standalone" &&
                "bg-blue-50 text-blue-700 border-blue-200",
              propertyType === "semi-detached" &&
                "bg-green-50 text-green-700 border-green-200",
              propertyType === "apartment" &&
                "bg-purple-50 text-purple-700 border-purple-200",
              propertyType === "other" &&
                "bg-gray-50 text-gray-700 border-gray-200"
            )}
          >
            {propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}
          </Badge>

          <Badge
            variant={isFurnished ? "default" : "outline"}
            className={cn(
              "text-xs",
              isFurnished
                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                : "text-gray-600"
            )}
          >
            {isFurnished ? "Furnished" : "Unfurnished"}
          </Badge>

          <Badge
            variant="outline"
            className="bg-amber-50 border-amber-200 text-amber-700 text-xs"
          >
            Built {yearBuilt}
          </Badge>
        </div>

        <div className="flex justify-between text-gray-600 text-sm">
          <div className="flex items-center">
            <Bed className="mr-1 w-4 h-4" />
            <span>
              {bedrooms} {bedrooms === 1 ? "Bed" : "Beds"}
            </span>
          </div>
          <div className="flex items-center">
            <Bath className="mr-1 w-4 h-4" />
            <span>
              {bathrooms} {bathrooms === 1 ? "Bath" : "Baths"}
            </span>
          </div>
          <div className="flex items-center">
            <Grid className="mr-1 w-4 h-4" />
            <span>{area} m²</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center p-4 pt-3 border-gray-100 border-t">
        <div className="font-bold text-primary text-lg">
          K{price.toLocaleString()}
        </div>
        <Link to={`/property/${id}`}>
          <Button size="sm" className="gap-1">
            View <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
