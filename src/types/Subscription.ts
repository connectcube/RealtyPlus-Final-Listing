export type SubscriptionTier = "free" | "sme" | "elite";

export interface SubscriptionPackage {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  listingsPerMonth: number;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export interface AgentSubscription {
  id: string;
  agentId: string;
  packageId: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  remainingListings: number;
}
