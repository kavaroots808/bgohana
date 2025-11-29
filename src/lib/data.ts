

import type { Distributor, DistributorRank, Customer, Purchase, NewDistributorData } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const mockDistributors: Omit<Distributor, 'children' | 'groupVolume' | 'generationalVolume' | 'canRecruit' | 'level' | 'customers' >[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', parentId: null, placementId: null, status: 'active', joinDate: '2023-01-15T09:00:00Z', personalVolume: 150, recruits: 3, commissions: 12000, avatarUrl: 'https://i.pravatar.cc/150?u=1', rank: 'LV6' },
  { id: '2', name: 'Bob', email: 'bob@example.com', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-02-20T10:00:00Z', personalVolume: 200, recruits: 2, commissions: 7500, avatarUrl: 'https://i.pravatar.cc/150?u=2', rank: 'LV4' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-03-10T11:30:00Z', personalVolume: 100, recruits: 2, commissions: 3200, avatarUrl: 'https://i.pravatar.cc/150?u=3', rank: 'LV2' },
  { id: '4', name: 'Diana', email: 'diana@example.com', parentId: '2', placementId: '2', status: 'inactive', joinDate: '2023-04-05T14:00:00Z', personalVolume: 50, recruits: 0, commissions: 500, avatarUrl: 'https://i.pravatar.cc/150?u=4', rank: 'LV0' },
  { id: '5', name: 'Ethan', email: 'ethan@example.com', parentId: '2', placementId: '2', status: 'active', joinDate: '2023-05-12T09:30:00Z', personalVolume: 300, recruits: 1, commissions: 1500, avatarUrl: 'https://i.pravatar.cc/150?u=5', rank: 'LV1' },
  { id: '6', name: 'Fiona', email: 'fiona@example.com', parentId: '3', placementId: '3', status: 'active', joinDate: '2023-06-18T16:00:00Z', personalVolume: 120, recruits: 0, commissions: 800, avatarUrl: 'https://i.pravatar.cc/150?u=6', rank: 'LV1' },
  { id: '7', name: 'George', email: 'george@example.com', parentId: '3', placementId: '3', status: 'active', joinDate: '2023-07-22T11:00:00Z', personalVolume: 180, recruits: 0, commissions: 650, avatarUrl: 'https://i.pravatar.cc/150?u=7', rank: 'LV0' },
  { id: '8', name: 'Hannah', email: 'hannah@example.com', parentId: '5', placementId: '5', status: 'active', joinDate: '2023-08-30T13:45:00Z', personalVolume: 220, recruits: 0, commissions: 950, avatarUrl: 'https://i.pravatar.cc/150?u=8', rank: 'LV0' },
  { id: '9', name: 'Ian', email: 'ian@example.com', parentId: '1', placementId: '3', status: 'active', joinDate: '2023-09-15T10:00:00Z', personalVolume: 250, recruits: 2, commissions: 2800, avatarUrl: 'https://i.pravatar.cc/150?u=9', rank: 'LV1' },
  { id: '10', name: 'Jane', email: 'jane@example.com', parentId: '9', placementId: '9', status: 'active', joinDate: '2023-10-02T11:00:00Z', personalVolume: 180, recruits: 0, commissions: 1100, avatarUrl: 'https://i.pravatar.cc/150?u=10', rank: 'LV0' },
  { id: '11', name: 'Kevin', email: 'kevin@example.com', parentId: '9', placementId: '9', status: 'inactive', joinDate: '2023-11-20T14:30:00Z', personalVolume: 30, recruits: 0, commissions: 200, avatarUrl: 'https://i.pravatar.cc/150?u=11', rank: 'LV0' },
  { id: '12', name: 'Laura', email: 'laura@example.com', parentId: '2', placementId: '4', status: 'active', joinDate: '2023-12-01T09:00:00Z', personalVolume: 400, recruits: 2, commissions: 4200, avatarUrl: 'https://i.pravatar.cc/150?u=12', rank: 'LV2' },
  { id: '13', name: 'Mike', email: 'mike@example.com', parentId: '12', placementId: '12', status: 'active', joinDate: '2024-01-10T18:00:00Z', personalVolume: 150, recruits: 0, commissions: 1300, avatarUrl: 'https://i.pravatar.cc/150?u=13', rank: 'LV0' },
  { id: '14', name: 'Nora', email: 'nora@example.com', parentId: '12', placementId: '12', status: 'active', joinDate: '2024-02-15T12:00:00Z', personalVolume: 220, recruits: 1, commissions: 1800, avatarUrl: 'https://i.pravatar.cc/150?u=14', rank: 'LV1' },
  { id: '15', name: 'Oscar', email: 'oscar@example.com', parentId: '14', placementId: '14', status: 'active', joinDate: '2024-03-01T10:00:00Z', personalVolume: 300, recruits: 0, commissions: 1000, avatarUrl: 'https://i.pravatar.cc/150?u=15', rank: 'LV0' },
];

const mockCustomers: Customer[] = [
  // Customers for Alice
  { id: 'c1', name: 'Customer One', email: 'c1@mail.com', avatarUrl: PlaceHolderImages[0].imageUrl, joinDate: '2023-01-20T10:00:00Z', distributorId: '1', totalPurchases: 1250 },
  { id: 'c2', name: 'Customer Two', email: 'c2@mail.com', avatarUrl: PlaceHolderImages[1].imageUrl, joinDate: '2023-02-10T11:00:00Z', distributorId: '1', totalPurchases: 850 },

  // Customers for Bob
  { id: 'c3', name: 'Customer Three', email: 'c3@mail.com', avatarUrl: PlaceHolderImages[2].imageUrl, joinDate: '2023-03-01T14:00:00Z', distributorId: '2', totalPurchases: 2000 },

  // Customers for Charlie
  { id: 'c4', name: 'Customer Four', email: 'c4@mail.com', avatarUrl: PlaceHolderImages[3].imageUrl, joinDate: '2023-03-15T09:30:00Z', distributorId: '3', totalPurchases: 500 },
  { id: 'c5', name: 'Customer Five', email: 'c5@mail.com', avatarUrl: PlaceHolderImages[4].imageUrl, joinDate: '2023-04-05T16:00:00Z', distributorId: '3', totalPurchases: 750 },
];

const mockPurchases: Purchase[] = [
  { id: 'p1', customerId: 'c1', amount: 300, date: '2023-01-25T10:00:00Z' },
  { id: 'p2', customerId: 'c1', amount: 450, date: '2023-03-15T10:00:00Z' },
  { id: 'p3', customerId: 'c1', amount: 500, date: '2023-05-20T10:00:00Z' },
  { id: 'p4', customerId: 'c2', amount: 850, date: '2023-02-12T11:00:00Z' },
  { id: 'p5', customerId: 'c3', amount: 1000, date: '2023-03-02T14:00:00Z' },
  { id: 'p6', customerId: 'c3', amount: 1000, date: '2023-06-01T14:00:00Z' },
  { id: 'p7', customerId: 'c4', amount: 250, date: '2023-03-16T09:30:00Z' },
  { id: 'p8', customerId: 'c4', amount: 250, date: '2023-05-18T09:30:00Z' },
  { id: 'p9', customerId: 'c5', amount: 750, date: '2023-04-06T16:00:00Z' },
];

const rankRequirements: { 
    level: DistributorRank, 
    teamSize: number, 
    directLV1: number, 
    directReports?: number 
}[] = [
    { level: 'LV7', teamSize: 5000, directLV1: 7 },
    { level: 'LV6', teamSize: 2000, directLV1: 6 },
    { level: 'LV5', teamSize: 1000, directLV1: 5 },
    { level: 'LV4', teamSize: 500,  directLV1: 4 },
    { level: 'LV3', teamSize: 125,  directLV1: 3 },
    { level: 'LV2', teamSize: 25,   directLV1: 2 },
    { level: 'LV1', teamSize: 0, directLV1: 0, directReports: 5 },
    { level: 'LV0', teamSize: 0,    directLV1: 0, directReports: 0 },
];

class GenealogyTreeManager {
    private distributors: Map<string, Distributor> = new Map();
    private customers: Map<string, Customer> = new Map();
    private purchases: Purchase[] = [];
    public root: Distributor | null = null;
    public allDistributorsList: Distributor[] = [];
    private currentUserId: string | null = null;

    constructor() {
        this.initializeWithMockData();
    }
    
    public setCurrentUser(userId: string | null) {
        this.currentUserId = userId;
        this.root = this.findNodeById(userId || '1') || this.distributors.get('1') || null;
        if(this.root) this.root.parentId = null; // Ensure the root has no parent for tree structure
        this.calculateAllMetrics();
    }

    private initializeWithMockData() {
        mockDistributors.forEach(d => {
            const customersOfDistributor = mockCustomers.filter(c => c.distributorId === d.id);
            this.distributors.set(d.id, {
                ...d,
                customers: customersOfDistributor,
                children: [],
                groupVolume: 0,
                generationalVolume: [],
                canRecruit: false,
                level: 0,
            });
        });

        mockCustomers.forEach(c => {
            this.customers.set(c.id, c);
        });
        
        this.purchases = mockPurchases;
        
        this.root = this.distributors.get('1') || null;
        if (this.root) this.root.parentId = null; // Ensure the root has no parent
        this.detectCircularDependencies();
        this.calculateAllMetrics();
        this.allDistributorsList = Array.from(this.distributors.values());
    }

    private buildTree() {
        this.distributors.forEach(distributor => {
            distributor.children = []; // Reset children
        });
        this.distributors.forEach(distributor => {
            const placementId = distributor.placementId || distributor.parentId;
            if (placementId && this.distributors.has(placementId)) {
                if (distributor.id !== placementId) { // Prevent self as parent
                    this.distributors.get(placementId)!.children.push(distributor);
                }
            }
        });

        // Ensure root is correctly set if it exists
        if (this.currentUserId && this.distributors.has(this.currentUserId)) {
            this.root = this.distributors.get(this.currentUserId)!;
            this.root.parentId = null;
        } else if (!this.currentUserId && this.distributors.size > 0) {
            this.root = Array.from(this.distributors.values()).find(d => !d.parentId) || this.distributors.get('1') || null;
            if(this.root) this.root.parentId = null;
        }


        // Sort children by join date
        this.distributors.forEach(d => {
            d.children.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
        });
    }

    public buildTreeFromMap(rootId: string | null = null): Distributor | null {
        this.setCurrentUser(rootId);
        this.calculateAllMetrics();
        return this.root;
    }
    
    private detectCircularDependencies() {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const detect = (nodeId: string): boolean => {
            if (!nodeId || !this.distributors.has(nodeId)) return false;

            if (recursionStack.has(nodeId)) {
                console.error(`Data Integrity Error: Circular dependency detected at distributor #${nodeId}.`);
                return true;
            }
            if (visited.has(nodeId)) {
                return false;
            }

            visited.add(nodeId);
            recursionStack.add(nodeId);

            const node = this.distributors.get(nodeId)!;
            const placementId = node.placementId || node.parentId;
            
            if (placementId && detect(placementId)) {
                 // Attempt to correct by setting parent to root if it's not the root itself
                 const rootNode = this.root || Array.from(this.distributors.values())[0];
                 if(node.id !== rootNode.id) {
                     console.error(`Correcting circular dependency for node #${node.id}. Setting placement to root #${rootNode.id}`);
                     node.placementId = rootNode.id;
                     node.parentId = rootNode.id;
                 }
                return true;
            }

            recursionStack.delete(nodeId);
            return false;
        }
        
        let corrected = false;
        for (const id of this.distributors.keys()) {
           if(detect(id)) {
               corrected = true;
           }
        }

        if(corrected) {
            this.buildTree(); // Rebuild tree if corrections were made
        }
    }
    
    private calculateAllMetrics() {
        if (!this.root) return;
        
        this.calculateLevels(this.root, 0);

        this.distributors.forEach(node => {
            node.canRecruit = node.status === 'active';
            node.groupVolume = this.getDownline(node.id).length;
        });

        // Iteratively update ranks until they stabilize
        let hasChanges: boolean;
        let iteration = 0;
        const maxIterations = this.distributors.size + 5; // Safety break
        
        do {
            hasChanges = this.updateRanks();
            iteration++;
        } while (hasChanges && iteration < maxIterations);

        if (iteration >= maxIterations) {
            console.error("Rank calculation exceeded max iterations, potential infinite loop.");
        }
        
        this.buildTree();
    }
    
    private calculateLevels(node: Distributor, level: number) {
        node.level = level;
        const children = Array.from(this.distributors.values()).filter(d => (d.placementId || d.parentId) === node.id);
        for(const child of children) {
            // Prevent infinite loops on bad data
            if(child.level > level) {
                this.calculateLevels(child, level + 1);
            }
        }
    }
    
    private updateRanks(): boolean {
        let hasChanged = false;
        
        this.distributors.forEach(d => {
            if (d.status === 'inactive') {
                if (d.rank !== 'LV0') {
                    d.rank = 'LV0';
                    hasChanged = true;
                }
                return;
            };

            const newRank = this.getQualifiedRank(d);
            if (d.rank !== newRank) {
                d.rank = newRank;
                hasChanged = true;
            }
        });
        return hasChanged;
    }
    
    private getQualifiedRank(distributor: Distributor): DistributorRank {
        if (distributor.status === 'inactive') return 'LV0';

        const directReports = Array.from(this.distributors.values()).filter(
            d => d.parentId === distributor.id && this.distributors.has(d.id)
        );

        for (const req of rankRequirements) {
            if (req.level === 'LV1') {
                if (directReports.length >= (req.directReports ?? 0)) {
                    return 'LV1';
                }
            } else if (req.level !== 'LV0') {
                const qualifiedDirectReports = directReports.filter(d => d.rank === 'LV1').length;
                const teamSize = this.getDownline(distributor.id).length;
                if (qualifiedDirectReports >= req.directLV1 && teamSize >= req.teamSize) {
                    return req.level;
                }
            }
        }
        
        // Fallback for LV0
        if (directReports.length >= (rankRequirements.find(r => r.level === 'LV0')?.directReports ?? 0)) {
           return 'LV0';
        }

        // Keep current rank if no other rank is met
        return distributor.rank;
    }

    public addDistributor(childData: NewDistributorData, parentId: string) {
        const parent = this.distributors.get(parentId);
        if (!parent) {
            console.error('Parent not found!');
            return;
        }

        const newId = (this.distributors.size + 1).toString();
        const newDistributor: Distributor = {
            id: newId,
            name: childData.name,
            email: childData.email,
            avatarUrl: childData.avatarUrl || `https://i.pravatar.cc/150?u=${newId}`,
            joinDate: new Date().toISOString(),
            status: 'active',
            rank: 'LV0',
            parentId: parentId,
            placementId: parentId, // Simple placement for now
            personalVolume: childData.personalVolume,
            recruits: 0,
            commissions: 0,
            customers: [],
            children: [],
            groupVolume: 0,
            generationalVolume: [],
            canRecruit: true,
            level: 0
        };

        this.distributors.set(newId, newDistributor);
        parent.recruits++;
        
        // Re-calculate everything
        this.calculateAllMetrics();
        this.allDistributorsList = Array.from(this.distributors.values());
    }

    public findNodeById(nodeId: string): Distributor | undefined {
        return this.distributors.get(nodeId);
    }
    
    public getDownline(nodeId: string, depth: number = Infinity): Distributor[] {
        const startNode = this.findNodeById(nodeId);
        if (!startNode) return [];

        const downline: Distributor[] = [];
        const queue: { node: Distributor; level: number }[] = [{ node: startNode, level: 0 }];

        const visited = new Set<string>();
        visited.add(startNode.id);

        while (queue.length > 0) {
            const { node, level } = queue.shift()!;
            
            if (level > 0) { // Exclude the startNode itself from the downline list
              downline.push(node);
            }

            if (level < depth) {
                const children = Array.from(this.distributors.values()).filter(d => (d.placementId || d.parentId) === node.id);
                children.forEach(child => {
                    if(!visited.has(child.id) && child.id !== node.id) { // Added check for self-reference
                        visited.add(child.id);
                        queue.push({ node: child, level: level + 1 });
                    }
                });
            }
        }
        return downline;
    }
}

export const genealogyManager = new GenealogyTreeManager();
export const allDistributors: Distributor[] = genealogyManager.allDistributorsList;
