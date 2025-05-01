import { DocumentReference, FieldValue, Timestamp } from "firebase/firestore";
export interface ZustandStore {
  user: USER | null;
  setUser: (user: USER | null) => void;
}
export type USER = {
  status: "Active" | "Inactive" | "Suspended";
  pfp?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  uid?: string;
  isSubscribed?: boolean;
  savedProperties?: string[];
  userType?: "admin" | "agent" | "agency" | "user" | string;
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
  enquiries?: number;
  views?: number;
  experience?: string;
  agency?: string;
  specialties?: string[];
  languages?: string[];
  rating?: number;
  company?: string;
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
  social?: SOCIAL;
  totalSales?: string;
};
export type ADMIN = {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  adminType: "super admin" | "content admin" | "user admin" | "custom";
  userType?: "admin" | "agent" | "agency" | "user";
  createdAt: Timestamp | null;
  isApproved: boolean;
  permissions: ADMINPERMISSIONS;
  status: "Active" | "Inactive" | "Suspended";
  myListings: myListings[];
};

interface ADMINPERMISSIONS {
  userRead: boolean;
  userWrite: boolean;
  listingRead: boolean;
  listingWrite: boolean;
  agentRead: boolean;
  agentWrite: boolean;
  agencyRead: boolean;
  agencyWrite: boolean;
  adminManagement: boolean;
  subscriptionManagement: boolean;
}
interface SOCIAL {
  linkedin: string;
  twitter: string;
}
export type LISTING = {
  postedBy: DocumentReference;
  uid: string;
  title: string;
  isFeatured: boolean;
  description: string;
  price: number;
  coverPhotoIndex: number;
  images: string[];
  propertyType:
    | "standalone"
    | "semi-detached"
    | "apartment"
    | "house"
    | "commercial"
    | "farmhouse"
    | "townhouse"
    | "other";
  listingType: "sale" | "rent";
  propertyCategory:
    | "residential"
    | "commercial"
    | "land"
    | "newDevelopment"
    | "other";
  bedrooms: number;
  bathrooms: number;
  area: number;
  garageSpaces: number;
  yearBuilt: number;
  viewCount: number;
  isFurnished: false;
  province: string;
  city: string;
  neighborhood: string;
  address: string;
  features: FEATURES;
  nearbyPlaces: NearbyPlace[];
  company?: string;
  createdAt: Timestamp | null;
};
export type FEATURES = {
  swimmingPool: boolean;
  garden: boolean;
  securitySystem: boolean;
  backupPower: boolean;
  borehole: boolean;
  airConditioning: boolean;
  servantsQuarters: boolean;
  fittedKitchen: boolean;
  parking: boolean;
};
export interface NearbyPlace {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
  distance?: number; // Optional since it may not always be present
}

interface myListings {
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
  agentsUsed: number;
  agentsTotal: number;
  renewalDate: Timestamp;
};
export type SearchFiltersProps = {
  address: string;
  province: string;
  priceRange: [number, number];
  propertyType: string;
  isFurnished: boolean;
  yearBuilt: number;
  bedrooms: number;
  bathrooms: number;
  garage: number;
  amenities: string[];
  listingType: string;
  propertyCategory: string;
};
