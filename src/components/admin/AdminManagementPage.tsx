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
import { Search, MoreVertical, Filter, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminService } from "./services/services";
import { LoadingSpinner } from "../globalScreens/Loader";
import { ADMIN } from "@/lib/typeDefinitions";
import { auth, fireDataBase } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Checkbox } from "../ui/checkbox";

// Update the admin roles accordingly
const ADMIN_ROLES = {
  SUPER_ADMIN: {
    name: "super admin",
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
  },
  CONTENT_ADMIN: {
    name: "content admin",
    permissions: {
      userRead: false,
      userWrite: false,
      listingRead: true,
      listingWrite: true,
      agentRead: false,
      agentWrite: false,
      agencyRead: false,
      agencyWrite: false,
      adminManagement: false,
      subscriptionManagement: false,
    },
  },
  USER_ADMIN: {
    name: "user admin",
    permissions: {
      userRead: true,
      userWrite: true,
      listingRead: false,
      listingWrite: false,
      agentRead: true,
      agentWrite: true,
      agencyRead: true,
      agencyWrite: true,
      adminManagement: false,
      subscriptionManagement: false,
    },
  },
};

export default function AdminManagementPage() {
  const [admin, setAdmin] = useState<ADMIN>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState<ADMIN[]>([]);
  const [adminToDelete, setAdminToDelete] = useState<ADMIN | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<ADMIN | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [isEditPermissionsDialogOpen, setIsEditPermissionsDialogOpen] =
    useState(false);
  const [newAdminData, setNewAdminData] = useState<ADMIN>({
    uid: "",
    firstName: "",
    lastName: "",
    email: "",
    adminType: "user admin",
    status: "Active",
    isApproved: false,
    createdAt: null,
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
  useEffect(() => {
    const checkAdminStatus = async (user: any) => {
      try {
        if (!user) {
          await signOut(auth);
          //  window.location.href = "/";
          // return;
        }
        const adminRef = doc(fireDataBase, "admins", user.uid);
        const adminSnapshot = await getDoc(adminRef);

        if (!adminSnapshot.exists()) {
          await signOut(auth);
          //   window.location.href = "/";
          // return;
        }
        const adminData = adminSnapshot.data() as ADMIN;
        if (!adminData.isApproved) {
          await signOut(auth);
          // window.location.href = "/";
          //  return;
        }
        setAdmin({
          ...adminData,
          uid: adminSnapshot.id,
        });
        const adminsRef = collection(fireDataBase, "admins");
        const adminsSnapshot = await getDocs(adminsRef);
        const adminsList = adminsSnapshot.docs.map(
          (doc) => ({ uid: doc.id, ...doc.data() } as ADMIN)
        );
        setAdmins(adminsList.filter((admin) => admin.uid !== user.uid));
      } catch (error) {
        await signOut(auth);
        // window.location.href = "/";
      }
    };
    const unsubscribe = onAuthStateChanged(auth, checkAdminStatus);
    return () => {
      unsubscribe();
    };
  }, []);
  const handleDeleteAdmin = (admin: ADMIN) => {
    setAdminToDelete(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleEditPermissions = (admin: ADMIN, status: ADMIN["status"]) => {
    const updatedAdmin = { ...admin, status };
    setSelectedAdmin(updatedAdmin);
    setIsEditPermissionsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (adminToDelete) {
      const adminId = adminToDelete.uid;
      const response = await adminService.deleteAdmin(adminId);
      const adminRef = doc(fireDataBase, "admins", adminId);
      await deleteDoc(adminRef);
      if (response.success && response === adminId) {
        setAdmins(
          admins &&
            admins.filter((admin) => admin && admin.uid !== adminToDelete.uid)
        );
      } else {
        setIsDeleteDialogOpen(false);
        setAdminToDelete(null);
      }
    }
  };

  const handleAddAdmin = () => {
    setIsAddAdminDialogOpen(true);
  };

  const saveNewAdmin = async () => {
    try {
      // Validate required fields
      if (!newAdminData.email || !newAdminData.firstName) {
        toast({
          title: "Error",
          description: "Please fill all required fields",
          duration: 5000,
        });
        return;
      }

      const temporaryPassword = "RealtyPlus@123"; // Implement secure password generation
      const response = await adminService.createAdmin(newAdminData);

      if (response.success) {
        toast({
          title: "Success",
          description: `Admin created successfully. Temporary password: ${temporaryPassword}`,
          duration: 5000,
        });
        setIsAddAdminDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin",
        duration: 5000,
      });
    }
  };

  const savePermissions = () => {
    // In a real application, you would make an API call here
    const updatedAdmins = admins.map((admin) => {
      if (admin.uid === selectedAdmin.uid) {
        return selectedAdmin;
      }
      return admin;
    });

    setAdmins(updatedAdmins);
    toast({
      title: "Permissions updated",
      description: `${selectedAdmin.firstName}'s permissions have been updated.`,
    });
    setIsEditPermissionsDialogOpen(false);
    setSelectedAdmin(null);
  };

  const handleUpdateStatus = async (admin: ADMIN, status: ADMIN["status"]) => {
    const updatedAdmin = { ...admin, status };
    const adminRef = doc(fireDataBase, "admins", admin.uid);
    await setDoc(adminRef, updatedAdmin, { merge: true });
    if (status) {
      setAdmins((prevAdmins) =>
        prevAdmins.map((a) => (a.uid === updatedAdmin.uid ? updatedAdmin : a))
      );
    } else {
      console.error("Failed to update status");
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.firstName ||
      "".toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email ||
      "".toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAdminTypeColor = (role) => {
    switch (role) {
      case "super admin":
        return "bg-red-100 text-red-800";
      case "content admin":
        return "bg-purple-100 text-purple-800";
      case "user admin":
        return "bg-blue-100 text-blue-800";
      case "custom":
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
  const handleAdminPermissionUpdate = async (
    adminId: string,
    adminType: ADMIN["adminType"]
  ) => {
    const adminRef = doc(fireDataBase, "admins", adminId);
    switch (adminType) {
      case "super admin":
        const superAdminPermissions = ADMIN_ROLES.SUPER_ADMIN.permissions;
        await setDoc(
          adminRef,
          { permissions: superAdminPermissions, adminType: "super admin" },
          { merge: true }
        );
        console.log(
          "Super Admin selected with permissions:",
          superAdminPermissions
        );
        break;
      case "content admin":
        const contentAdminPermissions = ADMIN_ROLES.CONTENT_ADMIN.permissions;
        await setDoc(
          adminRef,
          { permissions: contentAdminPermissions, adminType: "content admin" },
          { merge: true }
        );
        console.log("Content Admin selected", contentAdminPermissions);
        break;
      case "user admin":
        console.log("User Admin selected");
        const userAdminPermissions = ADMIN_ROLES.USER_ADMIN.permissions;
        await setDoc(
          adminRef,
          { permissions: userAdminPermissions, adminType: "user admin" },
          { merge: true }
        );
        console.log(
          "User Admin selected with permissions:",
          userAdminPermissions
        );
        break;
      default:
        const userContentAdminPermissions = {
          userRead: true,
          userWrite: true,
          listingRead: true,
          listingWrite: true,
          agentRead: true,
          agentWrite: true,
          agencyRead: true,
          agencyWrite: true,
          adminManagement: false,
          subscriptionManagement: false,
        };
        await setDoc(
          adminRef,
          { permissions: userContentAdminPermissions, adminType: "custom" },
          { merge: true }
        );
        console.log(
          "User Admin selected with permissions:",
          userContentAdminPermissions
        );
    }
  };

  if (!admin) {
    return <LoadingSpinner />;
  }
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">
              Admin Management
            </h2>
            <p className="text-muted-foreground">
              Manage admin users and their permissions
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleAddAdmin}>
            <ShieldCheck className="w-4 h-4" />
            Add New Admin
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex sm:flex-row flex-col justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-96">
                <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search admins..."
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
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((adminS) => (
                      <TableRow key={adminS.uid}>
                        <TableCell className="font-medium">
                          {adminS.firstName}
                        </TableCell>
                        <TableCell>{adminS.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={` ${getAdminTypeColor(
                              adminS.adminType
                            )}`}
                          >
                            {adminS.adminType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={` ${getStatusColor(adminS.status)}`}
                          >
                            {adminS.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {adminS.createdAt && "toDate" in adminS.createdAt
                            ? adminS.createdAt.toDate().toLocaleDateString()
                            : ""}
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="p-0 w-8 h-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEditPermissions(adminS, adminS.status)
                                }
                              >
                                Manage Permissions
                              </DropdownMenuItem>

                              {adminS.status === "Active" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(adminS, "Suspended")
                                  }
                                  className="text-amber-600"
                                >
                                  Suspend
                                </DropdownMenuItem>
                              ) : adminS.status === "Suspended" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(adminS, "Active")
                                  }
                                  className="text-green-600"
                                >
                                  Reactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(adminS, "Active")
                                  }
                                  className="text-green-600"
                                >
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {adminS.uid !== admin.uid && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteAdmin(adminS)}
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
                <span className="font-semibold">
                  {" "}
                  {adminToDelete.firstName}{" "}
                </span>
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
          <div className="gap-4 grid py-4">
            <div className="items-center gap-4 grid grid-cols-4">
              <Label htmlFor="name" className="text-right">
                First Name
              </Label>
              <Input
                id="firstName"
                value={newAdminData.firstName}
                onChange={(e) =>
                  setNewAdminData({
                    ...newAdminData,
                    firstName: e.target.value,
                  })
                }
                className="col-span-3"
              />
              <Label htmlFor="name" className="text-right">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={newAdminData.lastName}
                onChange={(e) =>
                  setNewAdminData({ ...newAdminData, lastName: e.target.value })
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
                  <SelectItem value="super admin">Super Admin</SelectItem>
                  <SelectItem value="content admin">Content Admin</SelectItem>
                  <SelectItem value="user admin">User Admin</SelectItem>
                  <SelectItem value="custom">Custom Permissions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/*newAdminData.adminType === "Custom" && (
              <div className="gap-4 grid grid-cols-4">
                <div className="pt-2 text-right">
                  <Label>Permissions</Label>
                </div>
                <div className="space-y-4 col-span-3">
                  <div className="space-y-2">
                    <h4 className="font-medium">User Permissions</h4>
                    <div className="gap-2 grid grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="user-read"
                          checked={newAdminData.permissions.userRead}
                          onCheckedChange={(checked) => {
                            setNewAdminData({
                              ...newAdminData,
                              permissions: {
                                ...newAdminData.permissions,
                                userRead: checked as boolean,
                              },
                            });
                          }}
                        />
                        <Label htmlFor="user-read">Read Users</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="user-write"
                          checked={newAdminData.permissions.userWrite}
                          onCheckedChange={(checked) => {
                            setNewAdminData({
                              ...newAdminData,
                              permissions: {
                                ...newAdminData.permissions,
                                userWrite: checked as boolean,
                              },
                            });
                          }}
                        />
                        <Label htmlFor="user-write">Modify Users</Label>
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
                            if (checked) {
                              setNewAdminData({
                                ...newAdminData,
                                permissions: {
                                  ...newAdminData.permissions,
                                },
                              });
                            } else {
                              setNewAdminData({
                                ...newAdminData,
                                permissions: newAdminData.permissions.filter(
                                  (p) => p !== PERMISSIONS.PROPERTIES.VIEW
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
                            PERMISSIONS.PROPERTIES.EDIT
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
                                    (p) => p !== PERMISSIONS.PROPERTIES.EDIT
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
                            PERMISSIONS.PROPERTIES.DELETE
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
                                    (p) => p !== PERMISSIONS.PROPERTIES.DELETE
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
                            PERMISSIONS.PROPERTIES.APPROVE
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
                                    (p) => p !== PERMISSIONS.PROPERTIES.APPROVE
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
            )*/}
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
                Modify permissions for{" "}
                {`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
              </DialogDescription>
            </DialogHeader>
            <div className="gap-4 grid py-4">
              <div className="items-center gap-4 grid grid-cols-4">
                <Label htmlFor="edit-role" className="text-right">
                  Admin Role
                </Label>
                <Select
                  value={selectedAdmin.adminType}
                  onValueChange={(value) => {
                    setSelectedAdmin({
                      ...selectedAdmin,
                      adminType: value as ADMIN["adminType"],
                    });
                    // Update the admin type in Firestore
                    handleAdminPermissionUpdate(
                      selectedAdmin.uid,
                      value as ADMIN["adminType"]
                    );
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super admin">Super Admin</SelectItem>
                    <SelectItem value="content admin">Content Admin</SelectItem>
                    <SelectItem value="user admin">User Admin</SelectItem>
                    <SelectItem value="custom">Custom Permissions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedAdmin.adminType === "custom" && (
                <div className="gap-4 grid grid-cols-4">
                  <div className="pt-2 text-right">
                    <Label>Permissions</Label>
                  </div>
                  <div className="space-y-4 col-span-3">
                    <h4 className="font-medium">Multi select</h4>
                    <div className="space-y-2">
                      <div className="gap-2 grid grid-cols-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="user admin"
                            checked={selectedAdmin.adminType === "custom"}
                            onCheckedChange={(checked) => {
                              setSelectedAdmin({
                                ...selectedAdmin,
                                adminType: checked ? "custom" : "content admin",
                              });
                              // Update the admin type in Firestore
                              handleAdminPermissionUpdate(
                                selectedAdmin.uid,
                                "custom"
                              );
                            }}
                          />
                          <Label htmlFor="user admin">
                            User Admin and Content Admin
                          </Label>
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
