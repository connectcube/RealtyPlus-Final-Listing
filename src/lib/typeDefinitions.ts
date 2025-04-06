import { SubscriptionPackage } from "@/types/Subscription";

// Define the user interface
export type User = {
  pfp?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  uid?: string;
  userType: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  confirmPassword?: string;
  address?: string;
  city?: string;
  agentType?: string;
  licenseNumber?: string;
  bio?: string;
  termsAccepted: boolean;
  subscription: Subscription;
  enquiries: number;
  views: number;
  experience: string;
  agency: string;
};
export type Subscription = {
  listingsUsed: number;
  plan: string;
  status: string;
  listingsTotal: number;
};
