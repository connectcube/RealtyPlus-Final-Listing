import { fireDataBase } from "@/lib/firebase";
import { ADMIN } from "@/lib/typeDefinitions";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ADMIN_ROLES } from "../AdminManagementPage";

const API_URL = "http://localhost:3000/api";

// adminService.ts
export const adminService = {
  createAdmin: async (adminData: ADMIN) => {
    const temporaryPassword = "realtyplus@123"; // Temporary password for the new admin
    try {
      // Call backend API to create auth user
      const response = await fetch("http://localhost:3000/api/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        adminType: adminData.adminType,
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
};
