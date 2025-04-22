import React from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardFooter } from "../ui/card";
import { cn } from "@/lib/utils";
import { Heart, MapPin, Bed, Bath, Grid, ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Link } from "react-router-dom";

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
      className="overflow-hidden transition-all duration-300 hover:shadow-lg bg-white cursor-pointer h-full flex flex-col"
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/80 hover:bg-white"
                  onClick={handleFavoriteClick}
                >
                  <Heart
                    fill={isFavorited ? "#ef4444" : "#ffffff"}
                    className="h-5 w-5 text-gray-600 hover:text-red-500"
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
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-yellow-500 hover:bg-yellow-600">
              Featured
            </Badge>
          </div>
        )}

        <div className="h-40 sm:h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </div>
      </div>

      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
        </div>

        <div className="flex items-center text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
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
            className="text-xs bg-amber-50 text-amber-700 border-amber-200"
          >
            Built {yearBuilt}
          </Badge>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>
              {bedrooms} {bedrooms === 1 ? "Bed" : "Beds"}
            </span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>
              {bathrooms} {bathrooms === 1 ? "Bath" : "Baths"}
            </span>
          </div>
          <div className="flex items-center">
            <Grid className="h-4 w-4 mr-1" />
            <span>{area} m²</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="font-bold text-lg text-primary">
          K{price.toLocaleString()}
        </div>
        <Link to={`/property/${id}`}>
          <Button size="sm" className="gap-1">
            View <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
