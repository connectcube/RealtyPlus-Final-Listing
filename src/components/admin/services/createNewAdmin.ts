// src/services/adminService.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const adminService = {
  createAdmin: async (adminData: {
    name: string;
    email: string;
    adminRole: string;
    permissions: string[];
  }) => {
    try {
      const response = await axios.post(`${API_URL}/admin/create`, adminData, {
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if you're using JWT or other auth tokens
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create admin"
      );
    }
  },
};
