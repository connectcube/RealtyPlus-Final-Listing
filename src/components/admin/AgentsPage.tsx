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
import { Search, MoreVertical, Filter, UserPlus, Link2 } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { USER } from "@/lib/typeDefinitions";
import { Link } from "react-router-dom";
import AgentEditModal from "./components/editUserModal";
import { toast } from "react-toastify";
import UserEditModal from "./components/editUserModal";

export default function AgentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [agents, setAgents] = useState([]);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [agentToEdit, setAgentToEdit] = useState<USER | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const agentsCollection = collection(fireDataBase, "agents");
        const querySnapshot = await getDocs(agentsCollection);
        const AgentList = querySnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));
        setAgents(AgentList);
        console.log(AgentList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);
  const handleDeleteAgent = (agent) => {
    setAgentToDelete(agent);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (agentToDelete) {
      // In a real application, you would make an API call here
      // For now, we'll just update the local state
      setAgents(agents.filter((agent) => agent.uid !== agentToDelete.uid));
      toast.success(
        `${agentToDelete.firstName} ${agentToDelete.lastName} has been permanently removed from the platform.`
      );
      setIsDeleteDialogOpen(false);
      setAgentToDelete(null);
    }
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 capitalize";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800 capitalize";
    }
  };

  const getSubscriptionColor = (subscription) => {
    switch (subscription) {
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
              Agent Management
            </h2>
            <p className="text-muted-foreground">
              Manage all real estate agents on the platform
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add New Agent
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex sm:flex-row flex-col justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search agents..."
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
                      <TableRow key={agent.uid}>
                        <TableCell className="font-medium">
                          {`${agent.firstName} ${agent.lastName}`}
                        </TableCell>
                        <TableCell>
                          <div>{agent.email}</div>
                          <div className="text-muted-foreground text-sm">
                            {agent.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          {agent.agency ? (
                            <Link
                              to={`/agency/${agent.agency}`}
                              className="flex gap-1 hover:text-blue-600"
                            >
                              View <Link2 />
                            </Link>
                          ) : (
                            "Individual"
                          )}
                        </TableCell>
                        <TableCell>{agent.myListings.length || 0}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`capitalize ${getSubscriptionColor(
                              agent.subscription.plan
                            )}`}
                          >
                            {agent.subscription.plan}
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
                        <TableCell>
                          {agent.createdAt.toDate().toLocaleDateString()}
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
                                <Link to={`/agent/${agent.uid}`}>
                                  View Profile
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <button
                                  onClick={() => setAgentToEdit(agent)}
                                  className="w-full font-normal text-black text-start sparent"
                                >
                                  Edit Agent
                                </button>
                              </DropdownMenuItem>
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
      {agentToEdit && (
        <UserEditModal setUserToEdit={setAgentToEdit} user={agentToEdit} />
      )}
    </AdminLayout>
  );
}
