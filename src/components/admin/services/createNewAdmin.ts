// src/services/adminService.ts
import { ADMIN } from "@/lib/typeDefinitions";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const adminService = {
  createAdmin: async (adminData: ADMIN) => {
    try {
      const response = await axios.post(
        `${API_URL}/admin/create`,
        {
          uid: adminData.uid,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          email: adminData.email,
          adminType: adminData.adminType,
          permissions: adminData.permissions,
          status: adminData.status,
          isApproved: adminData.isApproved,
          createdAt: adminData.createdAt,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create admin"
      );
    }
  },
};
