import { fireDataBase } from "@/lib/firebase";
import { ADMIN } from "@/lib/typeDefinitions";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { authService } from "./authServices";

const API_URL = "http://localhost:3000/api";
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

// adminService.ts
export const adminService = {
  createAdmin: async (adminData: ADMIN) => {
    const temporaryPassword = "realtyplus@123"; // Temporary password for the new admin
    const headers = await authService.getAuthHeader();
    try {
      // Call backend API to create auth user
      const response = await fetch("http://localhost:3000/api/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({ ...adminData, password: temporaryPassword }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }
      console.log("Backend result", result);
      console.log("Admin DAta", adminData);
      // Add user to Firestore with returned userId
      const generateAdminType = (adminType: string) => {
        switch (adminType) {
          case "super admin":
            return "SUPER_ADMIN";
          case "content admin":
            return "CONTENT_ADMIN";
          case "user admin":
            return "USER_ADMIN";
          default:
            return "USER_ADMIN";
        }
      };
      await setDoc(doc(fireDataBase, "admins", result.userId), {
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        adminType: adminData.adminType.toLowerCase(),
        permissions:
          ADMIN_ROLES[generateAdminType(adminData.adminType)]?.permissions,
        status: "Active",
        isApproved: true,
        createdAt: serverTimestamp(),
      });

      return result;
    } catch (error) {
      throw error;
    }
  },
  deleteAdmin: async (adminId: string) => {
    const headers = await authService.getAuthHeader();
    try {
      const response = await fetch(`${API_URL}/admin/delete/${adminId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      throw error;
    }
  },
};
