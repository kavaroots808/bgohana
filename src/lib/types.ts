export type DistributorRank = 
  | 'Level 0' | 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' 
  | 'Level 5' | 'Level 6' | 'Level 7' | 'Level 8' | 'Level 9' 
  | 'Level 10' | 'Level 11' | 'Level 12';

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
  avatarUrl: string;
  joinDate: string;
  status: 'active' | 'inactive';
  rank: DistributorRank;
  parentId: string | null;
  placementId: string | null;
  personalVolume: number;
  recruits: number;
  commissions: number;
  children: Distributor[];
  groupVolume: number;
  generationalVolume: number[];
  canRecruit: boolean;
  level: number;
  customers: Customer[];
}

export interface NewDistributorData {
  name: string;
  email: string;
  personalVolume: number;
  avatarUrl: string;
}
