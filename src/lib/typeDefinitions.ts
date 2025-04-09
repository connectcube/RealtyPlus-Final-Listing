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
 title: string;
    description: string;
    price: string;
    propertyType: string;
    listingType: string;
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
    nearby_places:NearbyPlace[]
}
interface FEATURES{
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
};
