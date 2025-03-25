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
import { Search, MoreVertical, Filter, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: "Mulenga Chipimo",
      email: "mulenga@example.com",
      phone: "+260 97 1234567",
      agency: "Lusaka Realty Ltd",
      listings: 12,
      subscription: "Premium",
      status: "Active",
      joined: "May 12, 2023",
    },
    {
      id: 2,
      name: "James Banda",
      email: "james@example.com",
      phone: "+260 96 7654321",
      agency: "Independent",
      listings: 8,
      subscription: "Basic",
      status: "Active",
      joined: "Jun 23, 2023",
    },
    {
      id: 3,
      name: "Natasha Zulu",
      email: "natasha@example.com",
      phone: "+260 95 9876543",
      agency: "Zambia Homes Agency",
      listings: 15,
      subscription: "Premium",
      status: "Inactive",
      joined: "Feb 05, 2023",
    },
    {
      id: 4,
      name: "Bwalya Mwamba",
      email: "bwalya@example.com",
      phone: "+260 97 8765432",
      agency: "Independent",
      listings: 5,
      subscription: "Basic",
      status: "Active",
      joined: "Apr 18, 2023",
    },
    {
      id: 5,
      name: "Thandiwe Phiri",
      email: "thandiwe@example.com",
      phone: "+260 96 5432109",
      agency: "Lusaka Realty Ltd",
      listings: 10,
      subscription: "Premium",
      status: "Suspended",
      joined: "Jan 30, 2023",
    },
    {
      id: 6,
      name: "Kapambwe Mwila",
      email: "kapambwe@example.com",
      phone: "+260 95 3456789",
      agency: "Zambia Homes Agency",
      listings: 7,
      subscription: "Basic",
      status: "Active",
      joined: "Jul 14, 2023",
    },
  ]);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteAgent = (agent) => {
    setAgentToDelete(agent);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (agentToDelete) {
      // In a real application, you would make an API call here
      // For now, we'll just update the local state
      setAgents(agents.filter((agent) => agent.id !== agentToDelete.id));
      toast({
        title: "Agent deleted",
        description: `${agentToDelete.name} has been permanently removed from the platform.`,
      });
      setIsDeleteDialogOpen(false);
      setAgentToDelete(null);
    }
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agency.toLowerCase().includes(searchTerm.toLowerCase()),
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
      case "Premium":
        return "bg-purple-100 text-purple-800";
      case "Basic":
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
            <h2 className="text-2xl font-bold tracking-tight">
              Agent Management
            </h2>
            <p className="text-muted-foreground">
              Manage all real estate agents on the platform
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add New Agent
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search agents..."
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
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Listings</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.length > 0 ? (
                    filteredAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">
                          {agent.name}
                        </TableCell>
                        <TableCell>
                          <div>{agent.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {agent.phone}
                          </div>
                        </TableCell>
                        <TableCell>{agent.agency}</TableCell>
                        <TableCell>{agent.listings}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getSubscriptionColor(agent.subscription)}
                          >
                            {agent.subscription}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(agent.status)}
                          >
                            {agent.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{agent.joined}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>View Listings</DropdownMenuItem>
                              <DropdownMenuItem>Edit Agent</DropdownMenuItem>
                              {agent.status === "Active" ? (
                                <DropdownMenuItem className="text-amber-600">
                                  Suspend
                                </DropdownMenuItem>
                              ) : agent.status === "Suspended" ? (
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
                                onClick={() => handleDeleteAgent(agent)}
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
                        No agents found.
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
              agent account
              {agentToDelete && (
                <span className="font-semibold"> {agentToDelete.name} </span>
              )}
              and remove their data from our servers. All property listings
              associated with this agent will also be removed.
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
