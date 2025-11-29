

import type { Distributor, DistributorRank, Customer, Purchase, NewDistributorData } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const mockDistributors: Omit<Distributor, 'children' | 'groupVolume' | 'generationalVolume' | 'canRecruit' | 'level' | 'customers' | 'commissions' | 'recruits' >[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', parentId: null, placementId: null, status: 'active', joinDate: '2023-01-15T09:00:00Z', personalVolume: 150, avatarUrl: 'https://i.pravatar.cc/150?u=1', rank: 'LV6' },
  { id: '2', name: 'Bob', email: 'bob@example.com', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-02-20T10:00:00Z', personalVolume: 200, avatarUrl: 'https://i.pravatar.cc/150?u=2', rank: 'LV4' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-03-10T11:30:00Z', personalVolume: 100, avatarUrl: 'https://i.pravatar.cc/150?u=3', rank: 'LV2' },
  { id: '4', name: 'Diana', email: 'diana@example.com', parentId: '2', placementId: '2', status: 'inactive', joinDate: '2023-04-05T14:00:00Z', personalVolume: 50, avatarUrl: 'https://i.pravatar.cc/150?u=4', rank: 'LV0' },
  { id: '5', name: 'Ethan', email: 'ethan@example.com', parentId: '2', placementId: '2', status: 'active', joinDate: '2023-05-12T09:30:00Z', personalVolume: 300, avatarUrl: 'https://i.pravatar.cc/150?u=5', rank: 'LV1' },
  { id: '6', name: 'Fiona', email: 'fiona@example.com', parentId: '3', placementId: '3', status: 'active', joinDate: '2023-06-18T16:00:00Z', personalVolume: 120, avatarUrl: 'https://i.pravatar.cc/150?u=6', rank: 'LV1' },
  { id: '7', name: 'George', email: 'george@example.com', parentId: '3', placementId: '3', status: 'active', joinDate: '2023-07-22T11:00:00Z', personalVolume: 180, avatarUrl: 'https://i.pravatar.cc/150?u=7', rank: 'LV0' },
  { id: '8', name: 'Hannah', email: 'hannah@example.com', parentId: '5', placementId: '5', status: 'active', joinDate: '2023-08-30T13:45:00Z', personalVolume: 220, avatarUrl: 'https://i.pravatar.cc/150?u=8', rank: 'LV0' },
  { id: '9', name: 'Ian', email: 'ian@example.com', parentId: '1', placementId: '3', status: 'active', joinDate: '2023-09-15T10:00:00Z', personalVolume: 250, avatarUrl: 'https://i.pravatar.cc/150?u=9', rank: 'LV1' },
  { id: '10', name: 'Jane', email: 'jane@example.com', parentId: '9', placementId: '9', status: 'active', joinDate: '2023-10-02T11:00:00Z', personalVolume: 180, avatarUrl: 'https://i.pravatar.cc/150?u=10', rank: 'LV0' },
  { id: '11', name: 'Kevin', email: 'kevin@example.com', parentId: '9', placementId: '9', status: 'inactive', joinDate: '2023-11-20T14:30:00Z', personalVolume: 30, avatarUrl: 'https://i.pravatar.cc/150?u=11', rank: 'LV0' },
  { id: '12', name: 'Laura', email: 'laura@example.com', parentId: '2', placementId: '4', status: 'active', joinDate: '2023-12-01T09:00:00Z', personalVolume: 400, avatarUrl: 'https://i.pravatar.cc/150?u=12', rank: 'LV2' },
  { id: '13', name: 'Mike', email: 'mike@example.com', parentId: '12', placementId: '12', status: 'active', joinDate: '2024-01-10T18:00:00Z', personalVolume: 150, avatarUrl: 'https://i.pravatar.cc/150?u=13', rank: 'LV0' },
  { id: '14', name: 'Nora', email: 'nora@example.com', parentId: '12', placementId: '12', status: 'active', joinDate: '2024-02-15T12:00:00Z', personalVolume: 220, avatarUrl: 'https://i.pravatar.cc/150?u=14', rank: 'LV1' },
  { id: '15', name: 'Oscar', email: 'oscar@example.com', parentId: '14', placementId: '14', status: 'active', joinDate: '2024-03-01T10:00:00Z', personalVolume: 300, avatarUrl: 'https://i.pravatar.cc/150?u=15', rank: 'LV0' },
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

export class GenealogyTreeManager {
    private distributors: Map<string, Distributor> = new Map();
    private customers: Map<string, Customer> = new Map();
    private purchases: Purchase[] = [];
    public root: Distributor | null = null;
    public allDistributorsList: Distributor[] = [];

    constructor() {}

    public initializeWithData(
        distributorsData: Distributor[],
        currentUserId?: string
    ) {
        this.distributors.clear();
        this.customers.clear(); // Assuming customers might come from DB too later
        this.root = null;
        this.allDistributorsList = [];

        // Initialize distributors from passed data
        distributorsData.forEach(d => {
            this.distributors.set(d.id, {
                ...d,
                customers: d.customers || [],
                children: [],
                groupVolume: 0,
                generationalVolume: [],
                canRecruit: false,
                level: 0,
            });
        });

        if (this.distributors.size === 0) return;
        
        let rootNode = this.distributors.get(currentUserId || '');
        
        if (!rootNode) {
            // If the current user isn't in the data, or isn't specified, find a default root.
            rootNode = distributorsData.find(d => !d.parentId) || distributorsData[0];
        }

        if (rootNode) {
            this.root = rootNode;
            this.root.parentId = null; // Ensure the root has no parent.
        }
        
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
                if (distributor.id !== placementId) {
                    this.distributors.get(placementId)!.children.push(distributor);
                }
            }
        });

        // The root is determined by initializeWithData, but we re-sort children for consistency
        this.distributors.forEach(d => {
            d.children.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
        });
    }

    public buildTreeFromMap(): Distributor | null {
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
        if (this.distributors.size === 0) return;
        
        // This is now done recursively from the root to calculate levels correctly
        if (this.root) {
            this.calculateLevelsAndRecruits(this.root, 0);
        } else {
             // Handle case where root is not set (e.g. empty DB)
             this.distributors.forEach(node => {
                node.level = 0;
                node.recruits = 0;
             });
        }
        
        this.distributors.forEach(node => {
            node.canRecruit = node.status === 'active';
            node.groupVolume = this.getDownline(node.id).length;
        });

        let hasChanges: boolean;
        let iteration = 0;
        const maxIterations = this.distributors.size + 5;
        
        do {
            hasChanges = this.updateRanks();
            iteration++;
        } while (hasChanges && iteration < maxIterations);

        if (iteration >= maxIterations) {
            console.error("Rank calculation exceeded max iterations, potential infinite loop.");
        }
        
        this.buildTree();
    }
    
    private calculateLevelsAndRecruits(node: Distributor, level: number) {
        node.level = level;
        const children = Array.from(this.distributors.values()).filter(d => d.parentId === node.id);
        node.recruits = children.length;

        const placementChildren = Array.from(this.distributors.values()).filter(d => (d.placementId || d.parentId) === node.id);
        for(const child of placementChildren) {
            if(child.level > level) { // Prevent infinite loops in case of bad data
                this.calculateLevelsAndRecruits(child, level + 1);
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
        
        if (directReports.length >= (rankRequirements.find(r => r.level === 'LV0')?.directReports ?? 0)) {
           return 'LV0';
        }

        return distributor.rank;
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
            
            if (level > 0) {
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
// allDistributors is now dynamically populated via the hook, so we export an empty array as a fallback.
export const allDistributors: Distributor[] = [];
