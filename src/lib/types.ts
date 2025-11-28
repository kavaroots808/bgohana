export type DistributorRank = 'Distributor' | 'Manager' | 'Director' | 'Presidential';

export interface Distributor {
  id: string;
  name: string;
  avatarUrl: string;
  joinDate: string;
  status: 'active' | 'inactive';
  rank: DistributorRank;
  parentId: string | null;
  placementId: string | null;
  position: 'left' | 'right' | null;
  personalVolume: number;
  recruits: number;
  commissions: number;
  children: Distributor[];
  groupVolume: number;
  generationalVolume: number[];
  placementAllowed: boolean;
  level: number;
}
