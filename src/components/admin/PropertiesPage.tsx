import { useEffect, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Search, MoreVertical, Filter, Plus, Link2 } from "lucide-react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { fireDataBase, fireStorage } from "@/lib/firebase";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteObject, ref } from "firebase/storage";

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const listingCollection = collection(fireDataBase, "listings");
        const querySnapshot = await getDocs(listingCollection);
        const propertyList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProperties(propertyList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Filter properties based on search term
  const filteredProperties = properties.filter(
    (property) =>
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sold/rented":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "sale":
        return "bg-purple-100 text-purple-800";
      case "rent":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getCategoryColor = (category) => {
    switch (category) {
      case "residential":
        return "bg-blue-100 text-blue-800";
      case "commercial":
        return "bg-green-100 text-green-800";
      case "land":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getPosterPath = (posterRef) => {
    const collectionPath = posterRef.path.split("/")[0];
    console.log("collection path", collectionPath);
    const id = posterRef.id;
    let publicPath = collectionPath === "agents" ? "agent" : "agency";
    publicPath = collectionPath === "agencies" ? "agency" : "agent";
    console.log("Public path", publicPath);
    return `/${publicPath}/${id}`;
  };

  const handleStatusChange = async (propertyId) => {
    const propertyRef = doc(fireDataBase, "listings", propertyId);
    await setDoc(propertyRef, { status: "sold/rented" });

    const updatedProperties = properties.map((property) =>
      property.id === propertyId
        ? { ...property, status: "sold/rented" }
        : property
    );
    setProperties(updatedProperties);
  };

  const confirmDelete = async (property) => {
    try {
      console.log("Deleting property with ID:", property.id);

      // 1. Delete all images from Storage
      if (property.images && property.images.length > 0) {
        const deleteImagePromises = property.images.map(async (imageUrl) => {
          try {
            // Convert full URL to storage reference path
            // Example: from "https://firebasestorage.googleapis.com/v0/b/your-app.appspot.com/o/properties%2Fimage.jpg"
            // to "properties/image.jpg"
            const storageRef = ref(
              fireStorage,
              decodeURIComponent(imageUrl.split("/o/")[1].split("?")[0])
            );
            await deleteObject(storageRef);
          } catch (error) {
            console.error(`Failed to delete image: ${imageUrl}`, error);
            // Continue with other deletions even if one fails
          }
        });

        // Wait for all image deletions to complete
        await Promise.all(deleteImagePromises);
      }

      // 2. Delete the property document from Firestore
      const propertyRef = doc(fireDataBase, "listings", property.id);
      await deleteDoc(propertyRef);

      // 3. Update local state
      const updatedProperties = properties.filter((p) => p.id !== property.id);
      setProperties(updatedProperties);

      // Optional: Show success message
      toast.success("Property deleted successfully");
    } catch (error) {
      console.error("Error deleting property:", error);
      // Optional: Show error message
      toast.error("Failed to delete property");
      throw error;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="border-gray-900 border-b-2 rounded-full w-8 h-8 animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">
              Property Management
            </h2>
            <p className="text-muted-foreground">
              Manage all properties listed on the platform
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Property
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex sm:flex-row flex-col justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            <div className="border rounded-md">
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
                        <TableCell>{property.address}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getTypeColor(property.listingType)}
                          >
                            {property.listingType}
                          </Badge>
                        </TableCell>
                        <TableCell>K {property.price}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(property.status)}
                          >
                            {property.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link
                            className="flex items-center gap-2 text-blue-600"
                            to={getPosterPath(property.postedBy)}
                          >
                            View
                            <Link2 />
                          </Link>
                        </TableCell>

                        <TableCell>
                          {property.createdAt.toDate().toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="p-0 w-8 h-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link to={`/property/${property.id}`}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
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
                                <DropdownMenuItem
                                  onClick={() => {
                                    handleStatusChange(property.id);
                                  }}
                                  className="text-blue-600"
                                >
                                  Mark as Sold/Rented
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  setPropertyToDelete(property);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
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
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              property
              {propertyToDelete && (
                <span className="font-semibold">
                  {" "}
                  {propertyToDelete.title}{" "}
                </span>
              )}
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete(propertyToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
