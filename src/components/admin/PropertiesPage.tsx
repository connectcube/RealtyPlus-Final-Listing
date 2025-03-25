import { useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, MoreVertical, Filter, Plus } from "lucide-react";

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock property data
  const properties = [
    {
      id: 1,
      title: "Modern 3 Bedroom House",
      location: "Kabulonga, Lusaka",
      type: "For Sale",
      price: "$250,000",
      status: "Active",
      owner: "James Banda",
      listed: "May 12, 2023",
    },
    {
      id: 2,
      title: "Luxury Apartment",
      location: "Woodlands, Lusaka",
      type: "For Rent",
      price: "$1,200/mo",
      status: "Active",
      owner: "Lusaka Realty Ltd",
      listed: "Jun 23, 2023",
    },
    {
      id: 3,
      title: "Commercial Office Space",
      location: "Cairo Road, Lusaka",
      type: "For Rent",
      price: "$3,500/mo",
      status: "Pending",
      owner: "Zambia Homes Agency",
      listed: "Feb 05, 2023",
    },
    {
      id: 4,
      title: "4 Bedroom Villa with Pool",
      location: "Ibex Hill, Lusaka",
      type: "For Sale",
      price: "$450,000",
      status: "Active",
      owner: "Mulenga Chipimo",
      listed: "Apr 18, 2023",
    },
    {
      id: 5,
      title: "Studio Apartment",
      location: "Northmead, Lusaka",
      type: "For Rent",
      price: "$600/mo",
      status: "Sold/Rented",
      owner: "Natasha Zulu",
      listed: "Jan 30, 2023",
    },
    {
      id: 6,
      title: "Vacant Land 2 Acres",
      location: "Makeni, Lusaka",
      type: "For Sale",
      price: "$120,000",
      status: "Active",
      owner: "Chilufya Bowa",
      listed: "Jul 14, 2023",
    },
    {
      id: 7,
      title: "3 Bedroom Townhouse",
      location: "Roma, Lusaka",
      type: "For Sale",
      price: "$180,000",
      status: "Inactive",
      owner: "Thandiwe Phiri",
      listed: "Aug 02, 2023",
    },
    {
      id: 8,
      title: "Retail Shop Space",
      location: "Manda Hill, Lusaka",
      type: "For Rent",
      price: "$2,800/mo",
      status: "Active",
      owner: "Zambia Homes Agency",
      listed: "Mar 11, 2023",
    },
  ];

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Sold/Rented":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "For Sale":
        return "bg-purple-100 text-purple-800";
      case "For Rent":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Property Management
            </h2>
            <p className="text-muted-foreground">
              Manage all properties listed on the platform
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Property
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Listed Date</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">
                          {property.title}
                        </TableCell>
                        <TableCell>{property.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getTypeColor(property.type)}
                          >
                            {property.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{property.price}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(property.status)}
                          >
                            {property.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{property.owner}</TableCell>
                        <TableCell>{property.listed}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Property</DropdownMenuItem>
                              {property.status === "Active" ? (
                                <DropdownMenuItem className="text-amber-600">
                                  Mark as Inactive
                                </DropdownMenuItem>
                              ) : property.status === "Inactive" ? (
                                <DropdownMenuItem className="text-green-600">
                                  Mark as Active
                                </DropdownMenuItem>
                              ) : null}
                              {property.status !== "Sold/Rented" && (
                                <DropdownMenuItem className="text-blue-600">
                                  Mark as Sold/Rented
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No properties found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
