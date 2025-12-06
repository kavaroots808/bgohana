
export type DistributorRank = 
  | 'LV0' | 'LV1' | 'LV2' | 'LV3' | 'LV4' | 'LV5' 
  | 'LV6' | 'LV7' | 'LV8' | 'LV9' | 'LV10' | 'LV11' | 'LV12';

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  joinDate: string;
  distributorId: string;
  totalPurchases: number;
}

export interface Purchase {
  id: string;
  customerId: string;
  amount: number;
  date: string;
}

export interface Distributor {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  joinDate: string;
  status: 'funded' | 'not-funded';
  rank: DistributorRank;
  parentId: string | null;
  placementId: string | null;
  personalVolume: number;
  recruits: number;
  commissions: number;
  children?: Distributor[];
  sponsorSelected: boolean;
  referralCode: string;
  registrationCode?: string | null;
}

export interface NewDistributorData {
  name: string;
  email: string;
  personalVolume: number;
  avatarUrl: string;
}

export interface PerformanceMetric {
    id: string;
    distributorId: string;
    salesVolume: number;
    recruitmentCount: number;
    commissionEarnings: number;
    metricDate: string;
}

export interface LibraryAsset {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'image' | 'video';
  fileUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
}
