import type { Distributor, DistributorRank } from './types';
import { PlaceHolderImages } from './placeholder-images';

const flatDistributors: Omit<Distributor, 'children' | 'groupVolume' | 'placementAllowed' | 'level' | 'generationalVolume'>[] = [
    { id: '1', name: 'Alice', parentId: null, placementId: null, position: null, status: 'active', joinDate: '2023-01-15', personalVolume: 1500, recruits: 5, commissions: 750, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '2', name: 'Bob', parentId: '1', placementId: '1', position: 'left', status: 'active', joinDate: '2023-02-20', personalVolume: 1200, recruits: 3, commissions: 500, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '3', name: 'Charlie', parentId: '1', placementId: '1', position: 'right', status: 'active', joinDate: '2023-03-10', personalVolume: 1800, recruits: 4, commissions: 900, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar3')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '4', name: 'David', parentId: '2', placementId: '2', position: 'left', status: 'active', joinDate: '2023-04-05', personalVolume: 900, recruits: 2, commissions: 300, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '5', name: 'Eve', parentId: '2', placementId: '2', position: 'right', status: 'inactive', joinDate: '2023-04-12', personalVolume: 300, recruits: 0, commissions: 50, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar5')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '6', name: 'Frank', parentId: '3', placementId: '3', position: 'left', status: 'active', joinDate: '2023-05-18', personalVolume: 2000, recruits: 5, commissions: 1000, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar6')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '7', name: 'Grace', parentId: '3', placementId: '3', position: 'right', status: 'active', joinDate: '2023-06-22', personalVolume: 1600, recruits: 3, commissions: 800, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar7')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '8', name: 'Heidi', parentId: '4', placementId: '4', position: 'left', status: 'active', joinDate: '2023-07-30', personalVolume: 1100, recruits: 1, commissions: 400, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar8')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '9', name: 'Ivan', parentId: '6', placementId: '6', position: 'left', status: 'active', joinDate: '2023-08-11', personalVolume: 1300, recruits: 2, commissions: 600, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar9')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '10', name: 'Judy', parentId: '6', placementId: '6', position: 'right', status: 'inactive', joinDate: '2023-08-19', personalVolume: 400, recruits: 0, commissions: 100, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar10')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '11', name: 'Mallory', parentId: '7', placementId: '7', position: 'left', status: 'active', joinDate: '2023-09-01', personalVolume: 1700, recruits: 3, commissions: 850, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar11')?.imageUrl ?? '', rank: 'Distributor' },
];

export class GenealogyTreeManager {
    private distributors: Map<string, Distributor> = new Map();
    public root: Distributor | null = null;
    public allDistributorsList: Distributor[] = [];
    private rankThreshold: DistributorRank = 'Manager';

    private rankAdvancementRules: Record<DistributorRank, {
        personalVolume?: number,
        groupVolume?: number,
        downlineManagers?: number,
        downlineDirectors?: number
    }> = {
        'Distributor': {},
        'Manager': { personalVolume: 1000, groupVolume: 5000 },
        'Director': { personalVolume: 1500, groupVolume: 20000, downlineManagers: 2 },
        'Presidential': { personalVolume: 2000, groupVolume: 100000, downlineDirectors: 2 }
    };

    constructor(flatData: Omit<Distributor, 'children' | 'groupVolume' | 'placementAllowed' | 'level' | 'generationalVolume'>[]) {
        // Initialize map with all distributors
        flatData.forEach(d => {
            this.distributors.set(d.id, {
                ...d,
                children: [],
                groupVolume: 0,
                generationalVolume: [],
                placementAllowed: false,
                level: 0,
            });
        });
        
        this.buildTree();
        this.calculateAllMetrics();
        this.allDistributorsList = Array.from(this.distributors.values());
    }

    private buildTree() {
        const roots: Distributor[] = [];
        this.distributors.forEach(distributor => {
            if (distributor.placementId && this.distributors.has(distributor.placementId)) {
                const parent = this.distributors.get(distributor.placementId)!;
                
                const hasLeft = parent.children.some(c => c.position === 'left');
                const hasRight = parent.children.some(c => c.position === 'right');

                if ((distributor.position === 'left' && !hasLeft) || (distributor.position === 'right' && !hasRight)) {
                    parent.children.push(distributor);
                }
            } else if (!distributor.placementId) {
                roots.push(distributor);
            }
        });
        this.root = roots.length > 0 ? roots[0] : null;
    }
    
    private calculateAllMetrics() {
        if (!this.root) return;

        // Iteratively update ranks until no more changes occur
        let ranksChanged;
        do {
            ranksChanged = false;
            
            // Recalculate volumes in each iteration, as rank changes can affect them
            const setLevelsAndVolumes = (node: Distributor, level: number) => {
                node.level = level;
                const effectivePersonalVolume = node.status === 'active' ? node.personalVolume : 0;
                
                let childrenVolume = 0;
                for(const child of node.children) {
                    childrenVolume += setLevelsAndVolumes(child, level + 1);
                }
                
                node.groupVolume = effectivePersonalVolume + childrenVolume;

                const hasLeft = node.children.some(c => c.position === 'left');
                const hasRight = node.children.some(c => c.position === 'right');
                node.placementAllowed = node.status === 'active' && (!hasLeft || !hasRight);
                
                return node.groupVolume;
            };

            setLevelsAndVolumes(this.root, 0);

            this.distributors.forEach(distributor => {
                this.calculateGenerationalVolume(distributor);
            });

            // Update ranks based on the new volumes
            if (this.updateRanks()) {
                ranksChanged = true;
            }

        } while (ranksChanged);
    }
    
    private updateRanks(): boolean {
        let hasChanged = false;
        const ranks: DistributorRank[] = ['Presidential', 'Director', 'Manager', 'Distributor'];

        this.distributors.forEach(d => {
            if (d.status === 'inactive') return;

            for (const rank of ranks) {
                const newRank = this.getQualifiedRank(d);
                if (d.rank !== newRank) {
                    d.rank = newRank;
                    hasChanged = true;
                }
            }
        });
        return hasChanged;
    }

    private getQualifiedRank(distributor: Distributor): DistributorRank {
        const rules = this.rankAdvancementRules;
        const downline = this.getDownline(distributor.id);

        if (distributor.personalVolume >= (rules.Presidential.personalVolume ?? 0) &&
            distributor.groupVolume >= (rules.Presidential.groupVolume ?? 0) &&
            downline.filter(d => d.rank === 'Director').length >= (rules.Presidential.downlineDirectors ?? 0)) {
            return 'Presidential';
        }

        if (distributor.personalVolume >= (rules.Director.personalVolume ?? 0) &&
            distributor.groupVolume >= (rules.Director.groupVolume ?? 0) &&
            downline.filter(d => d.rank === 'Manager').length >= (rules.Director.downlineManagers ?? 0)) {
            return 'Director';
        }

        if (distributor.personalVolume >= (rules.Manager.personalVolume ?? 0) &&
            distributor.groupVolume >= (rules.Manager.groupVolume ?? 0)) {
            return 'Manager';
        }
        
        return 'Distributor';
    }


    private isGenerationBreak(rank: DistributorRank): boolean {
        const ranks: DistributorRank[] = ['Distributor', 'Manager', 'Director', 'Presidential'];
        return ranks.indexOf(rank) >= ranks.indexOf(this.rankThreshold);
    }
    
    private calculateGenerationalVolume(distributor: Distributor) {
        distributor.generationalVolume = [];
        const queue: { node: Distributor; generation: number }[] = distributor.children.map(child => ({ node: child, generation: 1 }));
        
        while(queue.length > 0) {
            const { node, generation } = queue.shift()!;
            
            if (distributor.generationalVolume.length < generation) {
                distributor.generationalVolume.push(0);
            }
            distributor.generationalVolume[generation-1] += node.groupVolume;

            if (!this.isGenerationBreak(node.rank)) {
                node.children.forEach(child => {
                    queue.push({ node: child, generation: generation });
                });
            } else {
                 node.children.forEach(child => {
                    queue.push({ node: child, generation: generation + 1 });
                });
            }
        }
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
                node.children.forEach(child => {
                    if(!visited.has(child.id)) {
                        visited.add(child.id);
                        queue.push({ node: child, level: level + 1 });
                    }
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

