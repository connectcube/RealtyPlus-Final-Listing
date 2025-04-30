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
import { Search, MoreVertical, Filter, Building, Users } from "lucide-react";
import { USER } from "@/lib/typeDefinitions";
import { collection, getDocs } from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { toast } from "react-toastify";

export default function AgenciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [agencies, setAgencies] = useState<USER[]>([]);
  const [agencyToDelete, setAgencyToDelete] = useState<USER | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const handleDeleteAgency = (agency) => {
    setAgencyToDelete(agency);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (agencyToDelete) {
      // In a real application, you would make an API call here
      // For now, we'll just update the local state
      setAgencies(
        agencies.filter((agency) => agency.uid !== agencyToDelete.uid)
      );
      toast(
        `${agencyToDelete.firstName} has been permanently removed from the platform.`
      );
      setIsDeleteDialogOpen(false);
      setAgencyToDelete(null);
    }
  };

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const agenciesCollection = collection(fireDataBase, "agencies");
        const querySnapshot = await getDocs(agenciesCollection);
        const agencyList = querySnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })) as USER[];
        setAgencies(agencyList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching agencies:", error);
        toast.error("Failed to fetch agencies");
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);
  const filteredAgencies = agencies.filter(
    (agency) =>
      agency.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription.toUpperCase()) {
      case "PREMIUM":
        return "bg-purple-100 text-purple-800";
      case "BASIC":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">
              Agency Management
            </h2>
            <p className="text-muted-foreground">
              Manage all real estate agencies on the platform
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Add New Agency
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex sm:flex-row flex-col justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search agencies..."
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
                    <TableHead>Agency</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Agents</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgencies.length > 0 ? (
                    filteredAgencies.map((agency) => (
                      <TableRow key={agency.uid}>
                        <TableCell className="font-medium">
                          {agency.firstName}
                        </TableCell>
                        <TableCell>
                          <div>{agency.email}</div>
                          <div className="text-muted-foreground text-sm">
                            {agency.phone}
                          </div>
                        </TableCell>
                        <TableCell>{agency.address}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{agency.myAgents.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>{agency.myListings.length}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getSubscriptionColor(
                              agency.subscription.plan
                            )}
                          >
                            {agency.subscription.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(agency.status)}
                          >
                            {agency.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="p-0 w-8 h-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>View Agents</DropdownMenuItem>
                              <DropdownMenuItem>
                                View Properties
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit Agency</DropdownMenuItem>
                              {agency.status === "Active" ? (
                                <DropdownMenuItem className="text-amber-600">
                                  Suspend
                                </DropdownMenuItem>
                              ) : agency.status === "Suspended" ? (
                                <DropdownMenuItem className="text-green-600">
                                  Reactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600">
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteAgency(agency)}
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
                        No agencies found.
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
              agency
              {agencyToDelete && (
                <span className="font-semibold">
                  {" "}
                  {agencyToDelete.firstName}{" "}
                </span>
              )}
              and remove all associated data from our servers. All agents and
              property listings associated with this agency will also be
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
