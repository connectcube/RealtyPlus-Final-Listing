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
import { toast } from "@/components/ui/use-toast";

export default function AgenciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [agencies, setAgencies] = useState([
    {
      id: 1,
      name: "Lusaka Realty Ltd",
      email: "info@lusakarealty.com",
      phone: "+260 211 123456",
      location: "Kabulonga, Lusaka",
      agents: 8,
      properties: 45,
      subscription: "Enterprise",
      status: "Active",
      joined: "Jan 15, 2023",
    },
    {
      id: 2,
      name: "Zambia Homes Agency",
      email: "contact@zambiahomes.com",
      phone: "+260 211 654321",
      location: "Woodlands, Lusaka",
      agents: 12,
      properties: 78,
      subscription: "Enterprise",
      status: "Active",
      joined: "Mar 22, 2023",
    },
    {
      id: 3,
      name: "Copperbelt Properties",
      email: "info@copperbeltproperties.com",
      phone: "+260 212 987654",
      location: "Riverside, Kitwe",
      agents: 6,
      properties: 32,
      subscription: "Premium",
      status: "Active",
      joined: "Feb 10, 2023",
    },
    {
      id: 4,
      name: "Ndola Real Estate",
      email: "contact@ndolarealestate.com",
      phone: "+260 212 456789",
      location: "Itawa, Ndola",
      agents: 4,
      properties: 28,
      subscription: "Premium",
      status: "Inactive",
      joined: "Apr 05, 2023",
    },
    {
      id: 5,
      name: "Livingstone Homes",
      email: "info@livingstonehomes.com",
      phone: "+260 213 789456",
      location: "Maramba, Livingstone",
      agents: 3,
      properties: 15,
      subscription: "Basic",
      status: "Active",
      joined: "May 18, 2023",
    },
    {
      id: 6,
      name: "Kabwe Property Experts",
      email: "info@kabweproperties.com",
      phone: "+260 215 321654",
      location: "Town Center, Kabwe",
      agents: 2,
      properties: 12,
      subscription: "Basic",
      status: "Suspended",
      joined: "Jun 30, 2023",
    },
  ]);
  const [agencyToDelete, setAgencyToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteAgency = (agency) => {
    setAgencyToDelete(agency);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (agencyToDelete) {
      // In a real application, you would make an API call here
      // For now, we'll just update the local state
      setAgencies(agencies.filter((agency) => agency.id !== agencyToDelete.id));
      toast({
        title: "Agency deleted",
        description: `${agencyToDelete.name} has been permanently removed from the platform.`,
      });
      setIsDeleteDialogOpen(false);
      setAgencyToDelete(null);
    }
  };

  const filteredAgencies = agencies.filter(
    (agency) =>
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubscriptionColor = (subscription) => {
    switch (subscription) {
      case "Enterprise":
        return "bg-purple-100 text-purple-800";
      case "Premium":
        return "bg-blue-100 text-blue-800";
      case "Basic":
        return "bg-green-100 text-green-800";
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
              Agency Management
            </h2>
            <p className="text-muted-foreground">
              Manage all real estate agencies on the platform
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Add New Agency
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search agencies..."
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
                      <TableRow key={agency.id}>
                        <TableCell className="font-medium">
                          {agency.name}
                        </TableCell>
                        <TableCell>
                          <div>{agency.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {agency.phone}
                          </div>
                        </TableCell>
                        <TableCell>{agency.location}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{agency.agents}</span>
                          </div>
                        </TableCell>
                        <TableCell>{agency.properties}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getSubscriptionColor(
                              agency.subscription,
                            )}
                          >
                            {agency.subscription}
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
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
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
                <span className="font-semibold"> {agencyToDelete.name} </span>
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
