import type { Distributor } from './types';
import { PlaceHolderImages } from './placeholder-images';

const flatDistributors: Omit<Distributor, 'children' | 'groupVolume' | 'placementAllowed' | 'level'>[] = [
    { id: '1', name: 'Alice', parentId: null, placementId: null, position: null, status: 'active', joinDate: '2023-01-15', personalVolume: 1500, recruits: 5, commissions: 750, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl ?? '' },
    { id: '2', name: 'Bob', parentId: '1', placementId: '1', position: 'left', status: 'active', joinDate: '2023-02-20', personalVolume: 1200, recruits: 3, commissions: 500, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl ?? '' },
    { id: '3', name: 'Charlie', parentId: '1', placementId: '1', position: 'right', status: 'active', joinDate: '2023-03-10', personalVolume: 1800, recruits: 4, commissions: 900, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar3')?.imageUrl ?? '' },
    { id: '4', name: 'David', parentId: '2', placementId: '2', position: 'left', status: 'active', joinDate: '2023-04-05', personalVolume: 900, recruits: 2, commissions: 300, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl ?? '' },
    { id: '5', name: 'Eve', parentId: '2', placementId: '2', position: 'right', status: 'inactive', joinDate: '2023-04-12', personalVolume: 300, recruits: 0, commissions: 50, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar5')?.imageUrl ?? '' },
    { id: '6', name: 'Frank', parentId: '3', placementId: '3', position: 'left', status: 'active', joinDate: '2023-05-18', personalVolume: 2000, recruits: 5, commissions: 1000, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar6')?.imageUrl ?? '' },
    { id: '7', name: 'Grace', parentId: '3', placementId: '3', position: 'right', status: 'active', joinDate: '2023-06-22', personalVolume: 1600, recruits: 3, commissions: 800, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar7')?.imageUrl ?? '' },
    { id: '8', name: 'Heidi', parentId: '4', placementId: '4', position: 'left', status: 'active', joinDate: '2023-07-30', personalVolume: 1100, recruits: 1, commissions: 400, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar8')?.imageUrl ?? '' },
    { id: '9', name: 'Ivan', parentId: '6', placementId: '6', position: 'left', status: 'active', joinDate: '2023-08-11', personalVolume: 1300, recruits: 2, commissions: 600, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar9')?.imageUrl ?? '' },
    { id: '10', name: 'Judy', parentId: '6', placementId: '6', position: 'right', status: 'inactive', joinDate: '2023-08-19', personalVolume: 400, recruits: 0, commissions: 100, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar10')?.imageUrl ?? '' },
    { id: '11', name: 'Mallory', parentId: '7', placementId: '7', position: 'left', status: 'active', joinDate: '2023-09-01', personalVolume: 1700, recruits: 3, commissions: 850, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar11')?.imageUrl ?? '' },
];

export class GenealogyTreeManager {
    private distributors: Map<string, Distributor> = new Map();
    public root: Distributor | null = null;
    public allDistributorsList: Distributor[] = [];

    constructor(flatData: Omit<Distributor, 'children' | 'groupVolume' | 'placementAllowed' | 'level'>[]) {
        this.buildTree(flatData);
        this.calculateMetrics();
        this.allDistributorsList = Array.from(this.distributors.values());
    }

    private buildTree(flatData: Omit<Distributor, 'children' | 'groupVolume' | 'placementAllowed' | 'level'>[]) {
        // Initialize map with all distributors
        flatData.forEach(d => {
            this.distributors.set(d.id, {
                ...d,
                children: [],
                groupVolume: 0,
                placementAllowed: false,
                level: 0,
            });
        });

        const roots: Distributor[] = [];
        this.distributors.forEach(distributor => {
            if (distributor.placementId && this.distributors.has(distributor.placementId)) {
                const parent = this.distributors.get(distributor.placementId)!;
                
                // Enforce binary placement validation
                const hasLeft = parent.children.some(c => c.position === 'left');
                const hasRight = parent.children.some(c => c.position === 'right');

                if ((distributor.position === 'left' && !hasLeft) || (distributor.position === 'right' && !hasRight)) {
                    parent.children.push(distributor);
                }
            } else if (!distributor.placementId) {
                roots.push(distributor);
            }
        });
        
        // Assuming a single root for this tree structure
        this.root = roots.length > 0 ? roots[0] : null;
    }
    
    private calculateMetrics() {
        if (!this.root) return;

        const calculate = (node: Distributor, level: number): number => {
            // Apply compression: inactive nodes don't contribute their personal volume to the group total
            const effectivePersonalVolume = node.status === 'active' ? node.personalVolume : 0;
            
            // Children's volume is calculated recursively
            const childrenVolume = node.children.reduce((sum, child) => sum + calculate(child, level + 1), 0);
            
            node.groupVolume = effectivePersonalVolume + childrenVolume;

            const hasLeft = node.children.some(c => c.position === 'left');
            const hasRight = node.children.some(c => c.position === 'right');
            node.placementAllowed = node.status === 'active' && (!hasLeft || !hasRight);
            node.level = level;

            return node.groupVolume;
        };

        calculate(this.root, 0);
    }
    
    public findNodeById(nodeId: string): Distributor | undefined {
        return this.distributors.get(nodeId);
    }

    public getDownline(nodeId: string, depth: number = Infinity): Distributor[] {
        const startNode = this.findNodeById(nodeId);
        if (!startNode) return [];

        const downline: Distributor[] = [];
        const queue: { node: Distributor; level: number }[] = [{ node: startNode, level: 0 }];

        while (queue.length > 0) {
            const { node, level } = queue.shift()!;
            
            if (level > 0) {
              downline.push(node);
            }

            if (level < depth) {
                node.children.forEach(child => {
                    queue.push({ node: child, level: level + 1 });
                });
            }
        }
        return downline;
    }
}


const treeManager = new GenealogyTreeManager(flatDistributors);

export const genealogyTree = treeManager.root;
export const allDistributors = treeManager.allDistributorsList;
export const genealogyManager = treeManager;
