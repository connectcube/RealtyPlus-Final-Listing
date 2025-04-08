import { DocumentReference, Timestamp } from "firebase/firestore";

export type USER = {
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
  myListings?: myListings[];
};
export type LISTING={
 id: string;
  postedBy: string;
  // Add other property fields you expect from Firestore
  title?: string;
  price?: number;
  location?: string; 
}
interface myListings{
  position: string;
  ref: DocumentReference;
}
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
