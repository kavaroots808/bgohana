export interface Distributor {
  id: string;
  name: string;
  avatarUrl: string;
  joinDate: string;
  status: 'active' | 'inactive';
  parentId: string | null;
  placementId: string | null;
  position: 'left' | 'right' | null;
  personalVolume: number;
  recruits: number;
  commissions: number;
  children: Distributor[];
  groupVolume: number;
  placementAllowed: boolean;
  level: number;
}
