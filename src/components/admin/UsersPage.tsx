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
  const [newAdminData, setNewAdminData] = useState<Partial<ADMIN>>({
    firstName: "",
    lastName: "",
    email: "",
    adminType: "user admin",
    permissions: {
      userRead: false,
      userWrite: false,
      listingRead: false,
      listingWrite: false,
      agentRead: false,
      agentWrite: false,
      agencyRead: false,
      agencyWrite: false,
      adminManagement: false,
      subscriptionManagement: false,
    },
  });

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

  const handleAddAdmin = () => {
    setIsAddAdminDialogOpen(true);
  };

  const handleEditPermissions = (user) => {
    setSelectedUser(user);
    setIsEditPermissionsDialogOpen(true);
  };

  const saveNewAdmin = () => {
    setIsAddAdminDialogOpen(false);
    setNewAdminData({
      firstName: "",
      email: "",
      adminType: "user admin",
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
    });
  };

  const savePermissions = () => {
    // In a real application, you would make an API call here
    const updatedUsers = users.map((user) => {
      if (user.uid === selectedUser.id) {
        return selectedUser;
      }
      return user;
    });

    setUsers(updatedUsers);
    toast({
      title: "Permissions updated",
      description: `${selectedUser.name}'s permissions have been updated.`,
    });
    setIsEditPermissionsDialogOpen(false);
    setSelectedUser(null);
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
                            className={getRoleColor(
                              user.userType,
                              isAdmin(user) ? user.adminType : undefined
                            )}
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
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              {(user.userType !== "Admin" ||
                                hasPermission(
                                  PERMISSIONS.USERS.MANAGE_ADMINS
                                )) && (
                                <DropdownMenuItem>Edit User</DropdownMenuItem>
                              )}
                              {user.userType === "Admin" &&
                                hasPermission(
                                  PERMISSIONS.USERS.MANAGE_ADMINS
                                ) && (
                                  <DropdownMenuItem
                                    onClick={() => handleEditPermissions(user)}
                                  >
                                    Manage Permissions
                                  </DropdownMenuItem>
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
                                  user.uid !== currentUser.uid)) && (
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

      {/* Add Admin Dialog 
      <Dialog
        open={isAddAdminDialogOpen}
        onOpenChange={setIsAddAdminDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Create a new admin user with specific permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="gap-4 grid py-4">
            <div className="items-center gap-4 grid grid-cols-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newAdminData.firstName}
                onChange={(e) =>
                  setNewAdminData({
                    ...newAdminData,
                    firstName: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="items-center gap-4 grid grid-cols-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newAdminData.email}
                onChange={(e) =>
                  setNewAdminData({ ...newAdminData, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="items-center gap-4 grid grid-cols-4">
              <Label htmlFor="role" className="text-right">
                Admin Role
              </Label>
              <Select
                value={newAdminData.adminType}
                onValueChange={(value) =>
                  setNewAdminData({
                    ...newAdminData,
                    adminType: value as ADMIN["adminType"],
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                  <SelectItem value="Content Admin">Content Admin</SelectItem>
                  <SelectItem value="User Admin">User Admin</SelectItem>
                  <SelectItem value="Custom">Custom Permissions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newAdminData.adminType === "custom" && (
              <div className="gap-4 grid grid-cols-4">
                <div className="pt-2 text-right">
                  <Label>Permissions</Label>
                </div>
                <div className="space-y-4 col-span-3">
                  <div className="space-y-2">
                    <h4 className="font-medium">Users</h4>
                    <div className="gap-2 grid grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="users-view"
                          checked={false}
                          onCheckedChange={(checked) => {
                            console.log(checked);
                          }}
                        />
                        <Label htmlFor="users-view">View</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="users-edit"
                          checked={false}
                          onCheckedChange={(checked) => {
                            console.log(checked);
                          }}
                        />
                        <Label htmlFor="users-edit">Edit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="users-delete"
                          checked={false}
                          onCheckedChange={(checked) => {
                            console.log(checked);
                          }}
                        />
                        <Label htmlFor="users-delete">Delete</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="users-manage-admins"
                          checked={false}
                          onCheckedChange={(checked) => {
                            console.log(checked);
                          }}
                        />
                        <Label htmlFor="users-manage-admins">
                          Manage Admins
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Properties</h4>
                    <div className="gap-2 grid grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="properties-view"
                          checked={false}
                          onCheckedChange={(checked) => {
                            console.log(checked);
                          }}
                        />
                        <Label htmlFor="properties-view">View</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="properties-edit"
                          checked={false}
                          onCheckedChange={(checked) => {
                            console.log(checked);
                          }}
                        />
                        <Label htmlFor="properties-edit">Edit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="properties-delete"
                          checked={false}
                          onCheckedChange={(checked) => {
                            console.log(checked);
                          }}
                        />
                        <Label htmlFor="properties-delete">Delete</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="properties-approve"
                          checked={false}
                          onCheckedChange={(checked) => {
                            console.log(checked);
                          }}
                        />
                        <Label htmlFor="properties-approve">Approve</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={saveNewAdmin}>
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        */}
      {/* Edit Permissions Dialog */}
      {selectedUser && (
        <Dialog
          open={isEditPermissionsDialogOpen}
          onOpenChange={setIsEditPermissionsDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Admin Permissions</DialogTitle>
              <DialogDescription>
                Modify permissions for {selectedUser.name}
              </DialogDescription>
            </DialogHeader>
            <div className="gap-4 grid py-4">
              <div className="items-center gap-4 grid grid-cols-4">
                <Label htmlFor="edit-role" className="text-right">
                  Admin Role
                </Label>
                {/*<Select
                  value={selectedUser.adminRole}
                  onValueChange={(value) => {
                    if (value !== "Custom") {
                      setSelectedUser({
                        ...selectedUser,
                        adminRole: value,
                        permissions:
                          ADMIN_ROLES[value.toUpperCase().replace(" ", "_")]
                            ?.permissions || [],
                      });
                    } else {
                      setSelectedUser({
                        ...selectedUser,
                        adminRole: value,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="Content Admin">Content Admin</SelectItem>
                    <SelectItem value="User Admin">User Admin</SelectItem>
                    <SelectItem value="Custom">Custom Permissions</SelectItem>
                  </SelectContent>
                </Select>*/}
              </div>

              {selectedUser.adminRole === "Custom" && (
                <div className="gap-4 grid grid-cols-4">
                  <div className="pt-2 text-right">
                    <Label>Permissions</Label>
                  </div>
                  <div className="space-y-4 col-span-3">
                    <div className="space-y-2">
                      <h4 className="font-medium">Users</h4>
                      <div className="gap-2 grid grid-cols-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-users-view"
                            checked={selectedUser.permissions.includes(
                              PERMISSIONS.USERS.VIEW
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: [
                                    ...selectedUser.permissions,
                                    PERMISSIONS.USERS.VIEW,
                                  ],
                                });
                              } else {
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: selectedUser.permissions.filter(
                                    (p) => p !== PERMISSIONS.USERS.VIEW
                                  ),
                                });
                              }
                            }}
                          />
                          <Label htmlFor="edit-users-view">View</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-users-edit"
                            checked={selectedUser.permissions.includes(
                              PERMISSIONS.USERS.EDIT
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: [
                                    ...selectedUser.permissions,
                                    PERMISSIONS.USERS.EDIT,
                                  ],
                                });
                              } else {
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: selectedUser.permissions.filter(
                                    (p) => p !== PERMISSIONS.USERS.EDIT
                                  ),
                                });
                              }
                            }}
                          />
                          <Label htmlFor="edit-users-edit">Edit</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-users-delete"
                            checked={selectedUser.permissions.includes(
                              PERMISSIONS.USERS.DELETE
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: [
                                    ...selectedUser.permissions,
                                    PERMISSIONS.USERS.DELETE,
                                  ],
                                });
                              } else {
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: selectedUser.permissions.filter(
                                    (p) => p !== PERMISSIONS.USERS.DELETE
                                  ),
                                });
                              }
                            }}
                          />
                          <Label htmlFor="edit-users-delete">Delete</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-users-manage-admins"
                            checked={selectedUser.permissions.includes(
                              PERMISSIONS.USERS.MANAGE_ADMINS
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: [
                                    ...selectedUser.permissions,
                                    PERMISSIONS.USERS.MANAGE_ADMINS,
                                  ],
                                });
                              } else {
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: selectedUser.permissions.filter(
                                    (p) => p !== PERMISSIONS.USERS.MANAGE_ADMINS
                                  ),
                                });
                              }
                            }}
                          />
                          <Label htmlFor="edit-users-manage-admins">
                            Manage Admins
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Properties</h4>
                      <div className="gap-2 grid grid-cols-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-properties-view"
                            checked={selectedUser.permissions.includes(
                              PERMISSIONS.PROPERTIES.VIEW
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: [
                                    ...selectedUser.permissions,
                                    PERMISSIONS.PROPERTIES.VIEW,
                                  ],
                                });
                              } else {
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: selectedUser.permissions.filter(
                                    (p) => p !== PERMISSIONS.PROPERTIES.VIEW
                                  ),
                                });
                              }
                            }}
                          />
                          <Label htmlFor="edit-properties-view">View</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-properties-edit"
                            checked={selectedUser.permissions.includes(
                              PERMISSIONS.PROPERTIES.EDIT
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: [
                                    ...selectedUser.permissions,
                                    PERMISSIONS.PROPERTIES.EDIT,
                                  ],
                                });
                              } else {
                                setSelectedUser({
                                  ...selectedUser,
                                  permissions: selectedUser.permissions.filter(
                                    (p) => p !== PERMISSIONS.PROPERTIES.EDIT
                                  ),
                                });
                              }
                            }}
                          />
                          <Label htmlFor="edit-properties-edit">Edit</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" onClick={savePermissions}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
