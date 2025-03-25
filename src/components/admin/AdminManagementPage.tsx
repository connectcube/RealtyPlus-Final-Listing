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

// Admin role definitions
const ADMIN_ROLES = {
  SUPER_ADMIN: {
    name: "Super Admin",
    permissions: [
      ...Object.values(PERMISSIONS.USERS),
      ...Object.values(PERMISSIONS.PROPERTIES),
      ...Object.values(PERMISSIONS.AGENTS),
      ...Object.values(PERMISSIONS.AGENCIES),
      ...Object.values(PERMISSIONS.SETTINGS),
    ],
  },
  CONTENT_ADMIN: {
    name: "Content Admin",
    permissions: [
      PERMISSIONS.USERS.VIEW,
      PERMISSIONS.PROPERTIES.VIEW,
      PERMISSIONS.PROPERTIES.EDIT,
      PERMISSIONS.PROPERTIES.APPROVE,
      PERMISSIONS.AGENTS.VIEW,
      PERMISSIONS.AGENCIES.VIEW,
    ],
  },
  USER_ADMIN: {
    name: "User Admin",
    permissions: [
      PERMISSIONS.USERS.VIEW,
      PERMISSIONS.USERS.EDIT,
      PERMISSIONS.AGENTS.VIEW,
      PERMISSIONS.AGENTS.EDIT,
      PERMISSIONS.AGENCIES.VIEW,
    ],
  },
};

export default function AdminManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState([
    {
      id: 1,
      name: "Mwamba Tembo",
      email: "mwamba@realtyplus.com",
      adminRole: "Super Admin",
      permissions: ADMIN_ROLES.SUPER_ADMIN.permissions,
      status: "Active",
      joined: "Jan 01, 2023",
    },
    {
      id: 2,
      name: "Lubinda Habeenzu",
      email: "lubinda@realtyplus.com",
      adminRole: "Content Admin",
      permissions: ADMIN_ROLES.CONTENT_ADMIN.permissions,
      status: "Active",
      joined: "Feb 15, 2023",
    },
    {
      id: 3,
      name: "Namakau Mulwanda",
      email: "namakau@realtyplus.com",
      adminRole: "User Admin",
      permissions: ADMIN_ROLES.USER_ADMIN.permissions,
      status: "Active",
      joined: "Mar 22, 2023",
    },
    {
      id: 4,
      name: "Chimwemwe Banda",
      email: "chimwemwe@realtyplus.com",
      adminRole: "Custom",
      permissions: [
        PERMISSIONS.USERS.VIEW,
        PERMISSIONS.PROPERTIES.VIEW,
        PERMISSIONS.PROPERTIES.APPROVE,
      ],
      status: "Inactive",
      joined: "Apr 10, 2023",
    },
  ]);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [isEditPermissionsDialogOpen, setIsEditPermissionsDialogOpen] =
    useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newAdminData, setNewAdminData] = useState({
    name: "",
    email: "",
    adminRole: "User Admin",
    customPermissions: [],
  });

  // Simulate current user as Super Admin for this demo
  const currentUser = {
    id: 1,
    name: "Mwamba Tembo",
    email: "mwamba@realtyplus.com",
    adminRole: "Super Admin",
    permissions: ADMIN_ROLES.SUPER_ADMIN.permissions,
  };

  // Check if current user has a specific permission
  const hasPermission = (permission) => {
    return currentUser.permissions.includes(permission);
  };

  const handleDeleteAdmin = (admin) => {
    setAdminToDelete(admin);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (adminToDelete) {
      // In a real application, you would make an API call here
      // For now, we'll just update the local state
      setAdmins(admins.filter((admin) => admin.id !== adminToDelete.id));
      toast({
        title: "Admin deleted",
        description: `${adminToDelete.name} has been permanently removed as an admin.`,
      });
      setIsDeleteDialogOpen(false);
      setAdminToDelete(null);
    }
  };

  const handleAddAdmin = () => {
    setIsAddAdminDialogOpen(true);
  };

  const handleEditPermissions = (admin) => {
    setSelectedAdmin(admin);
    setIsEditPermissionsDialogOpen(true);
  };

  const saveNewAdmin = () => {
    // In a real application, you would make an API call here
    const newAdmin = {
      id: admins.length + 1,
      name: newAdminData.name,
      email: newAdminData.email,
      adminRole: newAdminData.adminRole,
      permissions:
        newAdminData.adminRole === "Custom"
          ? newAdminData.customPermissions
          : ADMIN_ROLES[newAdminData.adminRole.toUpperCase().replace(" ", "_")]
              ?.permissions || [],
      status: "Active",
      joined: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    setAdmins([...admins, newAdmin]);
    toast({
      title: "Admin created",
      description: `${newAdmin.name} has been added as a ${newAdmin.adminRole}.`,
    });
    setIsAddAdminDialogOpen(false);
    setNewAdminData({
      name: "",
      email: "",
      adminRole: "User Admin",
      customPermissions: [],
    });
  };

  const savePermissions = () => {
    // In a real application, you would make an API call here
    const updatedAdmins = admins.map((admin) => {
      if (admin.id === selectedAdmin.id) {
        return selectedAdmin;
      }
      return admin;
    });

    setAdmins(updatedAdmins);
    toast({
      title: "Permissions updated",
      description: `${selectedAdmin.name}'s permissions have been updated.`,
    });
    setIsEditPermissionsDialogOpen(false);
    setSelectedAdmin(null);
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getAdminRoleColor = (role) => {
    switch (role) {
      case "Super Admin":
        return "bg-red-100 text-red-800";
      case "Content Admin":
        return "bg-purple-100 text-purple-800";
      case "User Admin":
        return "bg-blue-100 text-blue-800";
      case "Custom":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Admin Management
            </h2>
            <p className="text-muted-foreground">
              Manage admin users and their permissions
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleAddAdmin}>
            <ShieldCheck className="h-4 w-4" />
            Add New Admin
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search admins..."
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
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">
                          {admin.name}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getAdminRoleColor(admin.adminRole)}
                          >
                            {admin.adminRole}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(admin.status)}
                          >
                            {admin.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{admin.joined}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditPermissions(admin)}
                              >
                                Manage Permissions
                              </DropdownMenuItem>
                              {admin.status === "Active" ? (
                                <DropdownMenuItem className="text-amber-600">
                                  Suspend
                                </DropdownMenuItem>
                              ) : admin.status === "Suspended" ? (
                                <DropdownMenuItem className="text-green-600">
                                  Reactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600">
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {admin.id !== currentUser.id && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteAdmin(admin)}
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
                        No admins found.
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
              This action cannot be undone. This will permanently remove
              {adminToDelete && (
                <span className="font-semibold"> {adminToDelete.name} </span>
              )}
              as an admin and revoke all their admin privileges.
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

      {/* Add Admin Dialog */}
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newAdminData.name}
                onChange={(e) =>
                  setNewAdminData({ ...newAdminData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Admin Role
              </Label>
              <Select
                value={newAdminData.adminRole}
                onValueChange={(value) =>
                  setNewAdminData({ ...newAdminData, adminRole: value })
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

            {newAdminData.adminRole === "Custom" && (
              <div className="grid grid-cols-4 gap-4">
                <div className="text-right pt-2">
                  <Label>Permissions</Label>
                </div>
                <div className="col-span-3 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Users</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="users-view"
                          checked={newAdminData.customPermissions.includes(
                            PERMISSIONS.USERS.VIEW,
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions: [
                                  ...newAdminData.customPermissions,
                                  PERMISSIONS.USERS.VIEW,
                                ],
                              });
                            } else {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions:
                                  newAdminData.customPermissions.filter(
                                    (p) => p !== PERMISSIONS.USERS.VIEW,
                                  ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="users-view">View</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="users-edit"
                          checked={newAdminData.customPermissions.includes(
                            PERMISSIONS.USERS.EDIT,
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions: [
                                  ...newAdminData.customPermissions,
                                  PERMISSIONS.USERS.EDIT,
                                ],
                              });
                            } else {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions:
                                  newAdminData.customPermissions.filter(
                                    (p) => p !== PERMISSIONS.USERS.EDIT,
                                  ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="users-edit">Edit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="users-delete"
                          checked={newAdminData.customPermissions.includes(
                            PERMISSIONS.USERS.DELETE,
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions: [
                                  ...newAdminData.customPermissions,
                                  PERMISSIONS.USERS.DELETE,
                                ],
                              });
                            } else {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions:
                                  newAdminData.customPermissions.filter(
                                    (p) => p !== PERMISSIONS.USERS.DELETE,
                                  ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="users-delete">Delete</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="users-manage-admins"
                          checked={newAdminData.customPermissions.includes(
                            PERMISSIONS.USERS.MANAGE_ADMINS,
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions: [
                                  ...newAdminData.customPermissions,
                                  PERMISSIONS.USERS.MANAGE_ADMINS,
                                ],
                              });
                            } else {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions:
                                  newAdminData.customPermissions.filter(
                                    (p) =>
                                      p !== PERMISSIONS.USERS.MANAGE_ADMINS,
                                  ),
                              });
                            }
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
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="properties-view"
                          checked={newAdminData.customPermissions.includes(
                            PERMISSIONS.PROPERTIES.VIEW,
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions: [
                                  ...newAdminData.customPermissions,
                                  PERMISSIONS.PROPERTIES.VIEW,
                                ],
                              });
                            } else {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions:
                                  newAdminData.customPermissions.filter(
                                    (p) => p !== PERMISSIONS.PROPERTIES.VIEW,
                                  ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="properties-view">View</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="properties-edit"
                          checked={newAdminData.customPermissions.includes(
                            PERMISSIONS.PROPERTIES.EDIT,
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions: [
                                  ...newAdminData.customPermissions,
                                  PERMISSIONS.PROPERTIES.EDIT,
                                ],
                              });
                            } else {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions:
                                  newAdminData.customPermissions.filter(
                                    (p) => p !== PERMISSIONS.PROPERTIES.EDIT,
                                  ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="properties-edit">Edit</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="properties-delete"
                          checked={newAdminData.customPermissions.includes(
                            PERMISSIONS.PROPERTIES.DELETE,
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions: [
                                  ...newAdminData.customPermissions,
                                  PERMISSIONS.PROPERTIES.DELETE,
                                ],
                              });
                            } else {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions:
                                  newAdminData.customPermissions.filter(
                                    (p) => p !== PERMISSIONS.PROPERTIES.DELETE,
                                  ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor="properties-delete">Delete</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="properties-approve"
                          checked={newAdminData.customPermissions.includes(
                            PERMISSIONS.PROPERTIES.APPROVE,
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions: [
                                  ...newAdminData.customPermissions,
                                  PERMISSIONS.PROPERTIES.APPROVE,
                                ],
                              });
                            } else {
                              setNewAdminData({
                                ...newAdminData,
                                customPermissions:
                                  newAdminData.customPermissions.filter(
                                    (p) => p !== PERMISSIONS.PROPERTIES.APPROVE,
                                  ),
                              });
                            }
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

      {/* Edit Permissions Dialog */}
      {selectedAdmin && (
        <Dialog
          open={isEditPermissionsDialogOpen}
          onOpenChange={setIsEditPermissionsDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Admin Permissions</DialogTitle>
              <DialogDescription>
                Modify permissions for {selectedAdmin.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Admin Role
                </Label>
                <Select
                  value={selectedAdmin.adminRole}
                  onValueChange={(value) => {
                    if (value !== "Custom") {
                      setSelectedAdmin({
                        ...selectedAdmin,
                        adminRole: value,
                        permissions:
                          ADMIN_ROLES[value.toUpperCase().replace(" ", "_")]
                            ?.permissions || [],
                      });
                    } else {
                      setSelectedAdmin({
                        ...selectedAdmin,
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
                </Select>
              </div>

              {selectedAdmin.adminRole === "Custom" && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-right pt-2">
                    <Label>Permissions</Label>
                  </div>
                  <div className="col-span-3 space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Users</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-users-view"
                            checked={selectedAdmin.permissions.includes(
                              PERMISSIONS.USERS.VIEW,
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: [
                                    ...selectedAdmin.permissions,
                                    PERMISSIONS.USERS.VIEW,
                                  ],
                                });
                              } else {
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: selectedAdmin.permissions.filter(
                                    (p) => p !== PERMISSIONS.USERS.VIEW,
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
                            checked={selectedAdmin.permissions.includes(
                              PERMISSIONS.USERS.EDIT,
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: [
                                    ...selectedAdmin.permissions,
                                    PERMISSIONS.USERS.EDIT,
                                  ],
                                });
                              } else {
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: selectedAdmin.permissions.filter(
                                    (p) => p !== PERMISSIONS.USERS.EDIT,
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
                            checked={selectedAdmin.permissions.includes(
                              PERMISSIONS.USERS.DELETE,
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: [
                                    ...selectedAdmin.permissions,
                                    PERMISSIONS.USERS.DELETE,
                                  ],
                                });
                              } else {
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: selectedAdmin.permissions.filter(
                                    (p) => p !== PERMISSIONS.USERS.DELETE,
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
                            checked={selectedAdmin.permissions.includes(
                              PERMISSIONS.USERS.MANAGE_ADMINS,
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: [
                                    ...selectedAdmin.permissions,
                                    PERMISSIONS.USERS.MANAGE_ADMINS,
                                  ],
                                });
                              } else {
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: selectedAdmin.permissions.filter(
                                    (p) =>
                                      p !== PERMISSIONS.USERS.MANAGE_ADMINS,
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
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-properties-view"
                            checked={selectedAdmin.permissions.includes(
                              PERMISSIONS.PROPERTIES.VIEW,
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: [
                                    ...selectedAdmin.permissions,
                                    PERMISSIONS.PROPERTIES.VIEW,
                                  ],
                                });
                              } else {
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: selectedAdmin.permissions.filter(
                                    (p) => p !== PERMISSIONS.PROPERTIES.VIEW,
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
                            checked={selectedAdmin.permissions.includes(
                              PERMISSIONS.PROPERTIES.EDIT,
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: [
                                    ...selectedAdmin.permissions,
                                    PERMISSIONS.PROPERTIES.EDIT,
                                  ],
                                });
                              } else {
                                setSelectedAdmin({
                                  ...selectedAdmin,
                                  permissions: selectedAdmin.permissions.filter(
                                    (p) => p !== PERMISSIONS.PROPERTIES.EDIT,
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
