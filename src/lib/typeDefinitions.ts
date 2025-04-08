import { DocumentReference, Timestamp } from "firebase/firestore";

export type User = {
  // Existing user properties
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

  // Agency-specific properties
  authProvider: string;
  businessRegistrationNumber?: string;
  businessType?: string;
  companyDescription?: string;
  createdAt?: Timestamp;
  isSubcribed?: boolean;
  myAgents?: myAgents[];
  numberOfAgents?: string;
  position?: string;
  website?: string;
};
interface myAgents {
  position: string;
  ref: DocumentReference;
}
export type Subscription = {
  listingsUsed: number;
  plan: string;
  status: string;
  listingsTotal: number;
};
