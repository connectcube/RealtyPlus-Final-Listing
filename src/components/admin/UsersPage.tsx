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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MoreVertical,
  Filter,
  UserPlus,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADMIN, USER } from "@/lib/typeDefinitions";
import { collection, getDocs, serverTimestamp } from "firebase/firestore";
import { fireDataBase } from "@/lib/firebase";
import { useZustand } from "@/lib/zustand";
import { Link } from "react-router-dom";

// Define permission types for admin roles
const PERMISSIONS = {
  USERS: {
    VIEW: "users:view",
    EDIT: "users:edit",
    DELETE: "users:delete",
    MANAGE_ADMINS: "users:manage_admins",
  },
  PROPERTIES: {
    VIEW: "properties:view",
    EDIT: "properties:edit",
    DELETE: "properties:delete",
    APPROVE: "properties:approve",
  },
  AGENTS: {
    VIEW: "agents:view",
    EDIT: "agents:edit",
    DELETE: "agents:delete",
    APPROVE: "agents:approve",
  },
  AGENCIES: {
    VIEW: "agencies:view",
    EDIT: "agencies:edit",
    DELETE: "agencies:delete",
    APPROVE: "agencies:approve",
  },
  SETTINGS: {
    VIEW: "settings:view",
    EDIT: "settings:edit",
  },
};

export default function UsersPage() {
  const { user } = useZustand();
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [isEditPermissionsDialogOpen, setIsEditPermissionsDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<(USER | ADMIN)[]>([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setIsLoading(true);

        const [usersSnap, agentsSnap, agenciesSnap, adminsSnap] =
          await Promise.all([
            getDocs(collection(fireDataBase, "users")),
            getDocs(collection(fireDataBase, "agents")),
            getDocs(collection(fireDataBase, "agencies")),
            getDocs(collection(fireDataBase, "admins")),
          ]);

        const allUsers: (USER | ADMIN)[] = [];

        // Process regular users
        usersSnap.forEach((doc) => {
          const userData = doc.data();
          allUsers.push({
            uid: doc.id,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            userType: "user",
            status: userData.status || "Active",
            createdAt: userData.createdAt || null,
          } as USER);
        });

        // Process agents
        agentsSnap.forEach((doc) => {
          const agentData = doc.data();
          allUsers.push({
            uid: doc.id,
            firstName: agentData.firstName || "",
            lastName: agentData.lastName || "",
            email: agentData.email || "",
            userType: "agent",
            status: agentData.status || "Active",
            createdAt: agentData.createdAt || null,
          } as USER);
        });

        // Process agencies
        agenciesSnap.forEach((doc) => {
          const agencyData = doc.data();
          allUsers.push({
            uid: doc.id,
            firstName: agencyData.firstName || "",
            lastName: agencyData.lastName || "",
            email: agencyData.email || "",
            userType: "agency",
            status: agencyData.status || "Active",
            createdAt: agencyData.createdAt || null,
          } as USER);
        });

        // Process admins
        adminsSnap.forEach((doc) => {
          const adminData = doc.data();
          allUsers.push({
            uid: doc.id,
            firstName: adminData.firstName || "",
            lastName: adminData.lastName || "",
            email: adminData.email || "",
            userType: "admin",
            adminType: adminData.adminType || "custom",
            status: adminData.status || "Active",
            permissions: {
              userRead: adminData.permissions?.userRead || false,
              userWrite: adminData.permissions?.userWrite || false,
              listingRead: adminData.permissions?.listingRead || false,
              listingWrite: adminData.permissions?.listingWrite || false,
              agentRead: adminData.permissions?.agentRead || false,
              agentWrite: adminData.permissions?.agentWrite || false,
              agencyRead: adminData.permissions?.agencyRead || false,
              agencyWrite: adminData.permissions?.agencyWrite || false,
              adminManagement: adminData.permissions?.adminManagement || false,
              subscriptionManagement:
                adminData.permissions?.subscriptionManagement || false,
            },
            createdAt: adminData.createdAt || null,
            isApproved: adminData.isApproved || false,
          } as ADMIN);
        });

        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.firstName || ""} ${
      user.lastName || ""
    }`.toLowerCase();
    const email = (user.email || "").toLowerCase();

    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      (user.userType || "").toLowerCase().includes(searchLower)
    );
  });
  // Simulate current user as Super Admin for this demo
  const currentUser: ADMIN = {
    uid: "",
    firstName: "",
    lastName: "",
    email: "",
    adminType: "super admin",
    userType: "admin",
    permissions: {
      userRead: true,
      userWrite: true,
      listingRead: true,
      listingWrite: true,
      agentRead: true,
      agentWrite: true,
      agencyRead: true,
      agencyWrite: true,
      adminManagement: true,
      subscriptionManagement: true,
    },
    createdAt: null,
    isApproved: true,
    status: "Active",
  };

  // Check if current user has a specific permission
  const hasPermission = (permission) => {
    return true; //currentUser.permissions.includes(permission);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };
  const isAdmin = (user: USER | ADMIN): user is ADMIN => {
    return user.userType === "admin";
  };

  const confirmDelete = () => {
    if (userToDelete) {
      // In a real application, you would make an API call here
      // For now, we'll just update the local state
      setUsers(users.filter((user) => user.uid !== userToDelete.uid));
      toast({
        title: "User deleted",
        description: `${userToDelete.name} has been permanently removed from the platform.`,
      });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getRoleColor = (role: string, adminType?: ADMIN["adminType"]) => {
    // First check if it's an admin with specific type
    if (role === "admin" && adminType) {
      // Changed from "Admin" to "admin"
      switch (adminType.toLowerCase()) {
        case "super admin":
          return "bg-red-100 text-red-800";
        case "content admin":
          return "bg-emerald-100 text-emerald-800";
        case "user admin":
          return "bg-indigo-100 text-indigo-800";
        case "custom":
          return "bg-cyan-100 text-cyan-800";
        default:
          return "bg-blue-100 text-blue-800";
      }
    }

    // For non-admin roles
    switch (role) {
      case "agent":
        return "bg-purple-100 text-purple-800";
      case "agency":
        return "bg-orange-100 text-orange-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      default: // user
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">
              User Management
            </h2>
            <p className="text-muted-foreground">
              Manage all users registered on the platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="flex items-center gap-2" disabled={true}>
              <UserPlus className="w-4 h-4" />
              Add New User
            </Button>
          </div>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex sm:flex-row flex-col justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search users..."
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
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell className="font-medium">
                          {`${user.firstName} ${user.lastName}`}
                          {isAdmin(user) && (
                            <div className="flex items-center mt-1">
                              <Shield className="mr-1 w-3 h-3 text-blue-600" />
                              <span className="text-blue-600 text-xs capitalize">
                                {user.adminType}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getRoleColor(
                              user.userType,
                              isAdmin(user) ? user.adminType : undefined
                            )} capitalize`}
                          >
                            {isAdmin(user)
                              ? `${user.userType} (${user.adminType})`
                              : user.userType}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(user.status)}
                          >
                            {user.status || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt.toDate().toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="p-0 w-8 h-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {user.userType !== "user" && (
                                <DropdownMenuItem>
                                  <Link to={`/agent/${user.uid}`}>
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                              )}

                              {(user.userType !== "Admin" ||
                                hasPermission(
                                  PERMISSIONS.USERS.MANAGE_ADMINS
                                )) &&
                                user.userType === "user" && (
                                  <DropdownMenuItem>Edit User</DropdownMenuItem>
                                )}

                              {(user.userType !== "Admin" ||
                                hasPermission(
                                  PERMISSIONS.USERS.MANAGE_ADMINS
                                )) && (
                                <>
                                  {user.status === "Active" ? (
                                    <DropdownMenuItem className="text-amber-600">
                                      Suspend
                                    </DropdownMenuItem>
                                  ) : user.status === "Suspended" ? (
                                    <DropdownMenuItem className="text-green-600">
                                      Reactivate
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem className="text-green-600">
                                      Activate
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              {(user.userType !== "Admin" ||
                                (hasPermission(
                                  PERMISSIONS.USERS.MANAGE_ADMINS
                                ) &&
                                  user.uid !== currentUser.uid)) &&
                                user.userType === "user" && (
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteUser(user)}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found.
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
              user account
              {userToDelete && (
                <span className="font-semibold"> {userToDelete.name} </span>
              )}
              and remove their data from our servers.
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
