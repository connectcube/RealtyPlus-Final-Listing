import { DocumentReference, Timestamp } from "firebase/firestore";
export interface ZustandStore {
  user: USER | null;
  setUser: (user: USER | null) => void;
}
export type USER = {
  // Existing user properties
  pfp?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  uid?: string;
  isSubscribed?: boolean;
  savedProperties?: string[];
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
  agency?: string;
specialties?:string[];
languages?:string[];
rating?:number;
company?:string;
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
  social?:SOCIAL;
  totalSales?:string;
};
interface SOCIAL{
  linkedin: string;
  twitter: string;
}
export type LISTING={
  postedBy:DocumentReference;
    uid:string;
    title: string;
    isFeatured:boolean;
    description: string;
    price: string;
    coverPhoto: string;
    images:string[];
    propertyType: "standalone" | "semi-detached" | "apartment" | "house" | "commercial" | "farmhouse" | "townhouse" | "other";
  listingType: "sale" | "rent";
  propertyCategory: "residential" | "commercial" | "land" | "newDevelopment" | "other";
    bedrooms: string;
    bathrooms: string;
    area: string;
    garageSpaces: string;
    yearBuilt: string;
    isFurnished: false,
    province: string;
    city: string;
    neighborhood: string;
    address: string;
    features: FEATURES,
    nearbyPlaces:NearbyPlace[];
    company:string;
    createdAt:Timestamp;
}
export type FEATURES={
  swimmingPool: boolean;
  garden: boolean;
  securitySystem: boolean;
  backupPower: boolean;
  borehole: boolean;
  airConditioning: boolean;
  servantsQuarters: boolean;
  fittedKitchen: boolean;
  parking: boolean;

}
export interface NearbyPlace {
  name: string;
  distance: string;
  type: string;
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
  isActive: boolean;
  listingsTotal: number;
  agentsUsed:number;
  agentsTotal:number;
  renewalDate:Timestamp;
};
