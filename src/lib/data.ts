

import type { Distributor, DistributorRank, Customer, Purchase, NewDistributorData } from './types';
import { PlaceHolderImages } from './placeholder-images';

const flatDistributors: Omit<Distributor, 'children' | 'groupVolume' | 'canRecruit' | 'level' | 'generationalVolume' | 'customers'>[] = [
    { id: '1', name: 'Alice', parentId: null, placementId: null, status: 'active', joinDate: '2023-01-15', personalVolume: 500, recruits: 5, commissions: 750, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '2', name: 'Bob', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-02-20', personalVolume: 200, recruits: 3, commissions: 500, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '3', name: 'Charlie', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-03-10', personalVolume: 800, recruits: 4, commissions: 900, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar3')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '4', name: 'David', parentId: '2', placementId: '2', status: 'active', joinDate: '2023-04-05', personalVolume: 400, recruits: 2, commissions: 300, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '5', name: 'Eve', parentId: '2', placementId: '2', status: 'inactive', joinDate: '2023-04-12', personalVolume: 300, recruits: 0, commissions: 50, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar5')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '6', name: 'Frank', parentId: '3', placementId: '3', status: 'active', joinDate: '2023-05-18', personalVolume: 1200, recruits: 5, commissions: 1000, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar6')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '7', name: 'Grace', parentId: '3', placementId: '3', status: 'active', joinDate: '2023-06-22', personalVolume: 600, recruits: 3, commissions: 800, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar7')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '8', name: 'Heidi', parentId: '4', placementId: '4', status: 'active', joinDate: '2023-07-30', personalVolume: 1100, recruits: 1, commissions: 400, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar8')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '9', name: 'Ivan', parentId: '6', placementId: '6', status: 'active', joinDate: '2023-08-11', personalVolume: 300, recruits: 2, commissions: 600, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar9')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '10', name: 'Judy', parentId: '6', placementId: '6', status: 'inactive', joinDate: '2023-08-19', personalVolume: 400, recruits: 0, commissions: 100, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar10')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '11', name: 'Mallory', parentId: '7', placementId: '7', status: 'active', joinDate: '2023-09-01', personalVolume: 700, recruits: 3, commissions: 850, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar11')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '12', name: 'Nancy', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-09-05', personalVolume: 550, recruits: 2, commissions: 450, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar12')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '13', name: 'Oliver', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-09-10', personalVolume: 750, recruits: 4, commissions: 650, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '14', name: 'Penelope', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-09-15', personalVolume: 950, recruits: 1, commissions: 700, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '15', name: 'Quentin', parentId: '1', placementId: '1', status: 'inactive', joinDate: '2023-09-20', personalVolume: 150, recruits: 0, commissions: 20, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar3')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '16', name: 'Rachel', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-09-25', personalVolume: 1250, recruits: 6, commissions: 1100, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '17', name: 'Steve', parentId: '12', placementId: '12', status: 'active', joinDate: '2023-10-01', personalVolume: 300, recruits: 1, commissions: 200, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar5')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '18', name: 'Tina', parentId: '12', placementId: '12', status: 'active', joinDate: '2023-10-02', personalVolume: 400, recruits: 2, commissions: 250, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar6')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '19', name: 'Ursula', parentId: '13', placementId: '13', status: 'active', joinDate: '2023-10-03', personalVolume: 600, recruits: 3, commissions: 500, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar7')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '20', name: 'Victor', parentId: '14', placementId: '14', status: 'active', joinDate: '2023-10-04', personalVolume: 800, recruits: 0, commissions: 150, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar8')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '21', name: 'Wendy', parentId: '16', placementId: '16', status: 'active', joinDate: '2023-10-05', personalVolume: 1100, recruits: 5, commissions: 950, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar9')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '22', name: 'Xavier', parentId: '16', placementId: '16', status: 'active', joinDate: '2023-10-06', personalVolume: 250, recruits: 1, commissions: 100, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar10')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '23', name: 'Yara', parentId: '21', placementId: '21', status: 'active', joinDate: '2023-10-10', personalVolume: 700, recruits: 2, commissions: 600, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar11')?.imageUrl ?? '', rank: 'Distributor' },
    { id: '24', name: 'Zane', parentId: '21', placementId: '21', status: 'inactive', joinDate: '2023-10-12', personalVolume: 100, recruits: 0, commissions: 0, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar12')?.imageUrl ?? '', rank: 'Distributor' },
];

const allCustomers: Omit<Customer, 'totalPurchases'>[] = [
    { id: 'c1', name: 'Customer One', email: 'c1@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=c1', joinDate: '2023-02-01', distributorId: '1' },
    { id: 'c2', name: 'Customer Two', email: 'c2@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=c2', joinDate: '2023-03-15', distributorId: '1' },
    { id: 'c3', name: 'Customer Three', email: 'c3@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=c3', joinDate: '2023-04-20', distributorId: '2' },
    { id: 'c4', name: 'Customer Four', email: 'c4@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=c4', joinDate: '2023-05-10', distributorId: '3' },
    { id: 'c5', name: 'Customer Five', email: 'c5@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=c5', joinDate: '2023-06-05', distributorId: '6' },
];

const allPurchases: Purchase[] = [
    { id: 'p1', customerId: 'c1', amount: 500, date: '2023-02-10' },
    { id: 'p2', customerId: 'c1', amount: 500, date: '2023-03-12' },
    { id: 'p3', customerId: 'c2', amount: 1000, date: '2023-04-01' },
    { id: 'p4', customerId: 'c3', amount: 1000, date: '2023-05-20' },
    { id: 'p5', customerId: 'c4', amount: 1000, date: '2023-06-15' },
    { id: 'p6', customerId: 'c5', amount: 800, date: '2023-07-01' },
];

type RankRules = {
    personalVolume?: number;
    groupVolume?: number;
    downlineManagers?: number;
    downlineDirectors?: number;
};

export class GenealogyTreeManager {
    private distributors: Map<string, Distributor> = new Map();
    private customers: Map<string, Customer> = new Map();
    private purchases: Purchase[] = [];
    public root: Distributor | null = null;
    public allDistributorsList: Distributor[] = [];
    private rankThreshold: DistributorRank = 'Manager';

    private rankAdvancementRules: Record<DistributorRank, RankRules> = {
        'Distributor': {},
        'Manager': { personalVolume: 1000, groupVolume: 5000 },
        'Director': { personalVolume: 1500, groupVolume: 20000, downlineManagers: 2 },
        'Presidential': { personalVolume: 2000, groupVolume: 100000, downlineDirectors: 2 }
    };
    
    private rankOrder: DistributorRank[] = ['Distributor', 'Manager', 'Director', 'Presidential'];

    constructor(
        flatDistributorData: Omit<Distributor, 'children' | 'groupVolume' | 'canRecruit' | 'level' | 'generationalVolume' | 'customers'>[],
        customerData: Omit<Customer, 'totalPurchases'>[],
        purchaseData: Purchase[]
    ) {
        this.initialize(flatDistributorData, customerData, purchaseData);
    }

    private initialize(
        flatDistributorData: Omit<Distributor, 'children' | 'groupVolume' | 'canRecruit' | 'level' | 'generationalVolume' | 'customers'>[],
        customerData: Omit<Customer, 'totalPurchases'>[],
        purchaseData: Purchase[]
    ) {
        this.distributors.clear();
        this.customers.clear();
        this.root = null;
        this.allDistributorsList = [];

        this.purchases = purchaseData;

        // Initialize customers and calculate their total purchases
        customerData.forEach(c => {
            const totalPurchases = this.purchases
                .filter(p => p.customerId === c.id)
                .reduce((sum, p) => sum + p.amount, 0);
            this.customers.set(c.id, { ...c, totalPurchases });
        });
        
        // Initialize distributors
        flatDistributorData.forEach(d => {
            const distributorCustomers = Array.from(this.customers.values()).filter(c => c.distributorId === d.id);
            const customerVolume = distributorCustomers.reduce((sum, c) => sum + c.totalPurchases, 0);

            this.distributors.set(d.id, {
                ...d,
                personalVolume: d.personalVolume + customerVolume,
                customers: distributorCustomers,
                children: [],
                groupVolume: 0,
                generationalVolume: [],
                canRecruit: false,
                level: 0,
            });
        });
        
        this.buildTree();
        this.detectCircularDependencies();
        this.calculateAllMetrics();
        this.validateFinalRanks();
        this.allDistributorsList = Array.from(this.distributors.values());
    }

    private buildTree() {
        const roots: Distributor[] = [];
        this.distributors.forEach(distributor => {
            distributor.children = []; // Reset children before rebuilding
        });
        this.distributors.forEach(distributor => {
            if (distributor.placementId) {
                if (this.distributors.has(distributor.placementId)) {
                    const parent = this.distributors.get(distributor.placementId)!;
                    parent.children.push(distributor);
                } else {
                    // Integrity Check: Throw error for orphaned distributors
                    throw new Error(`Data Integrity Error: Distributor #${distributor.id} has an invalid placementId #${distributor.placementId}.`);
                }
            } else {
                roots.push(distributor);
            }
        });

        if (roots.length === 0 && this.distributors.size > 0) {
            throw new Error('Data Integrity Error: No root node found in the tree.');
        }

        this.root = roots.length > 0 ? roots[0] : null;
    }

    public buildTreeFromMap(): Distributor | null {
        this.calculateAllMetrics();
        this.distributors.forEach(d => d.children = []);
        this.distributors.forEach(d => {
            if(d.placementId && this.distributors.has(d.placementId)) {
                this.distributors.get(d.placementId)!.children.push(d);
            }
        });
        const rootNode = Array.from(this.distributors.values()).find(d => d.parentId === null) || null;
        if(rootNode) {
            this.root = rootNode;
        }
        return this.root;
    }
    
    private detectCircularDependencies() {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const detect = (nodeId: string) => {
            visited.add(nodeId);
recursionStack.add(nodeId);

            const node = this.distributors.get(nodeId);
            if(node) {
                for (const child of node.children) {
                    if (!visited.has(child.id)) {
                        if (detect(child.id)) {
                            return true;
                        }
                    } else if (recursionStack.has(child.id)) {
                        // Integrity Check: Circular dependency found
                        throw new Error(`Data Integrity Error: Circular dependency detected involving distributor #${child.id}.`);
                    }
                }
            }

            recursionStack.delete(nodeId);
            return false;
        }

        for (const id of this.distributors.keys()) {
            if (!visited.has(id)) {
                if (detect(id)) {
                    return;
                }
            }
        }
    }
    
    private calculateAllMetrics() {
        if (!this.root) return;

        // Iteratively update ranks until no more changes occur
        let ranksChanged;
        let iterationCount = 0;
        const maxIterations = 10; // Failsafe to prevent infinite loops
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
                node.canRecruit = node.status === 'active';
                
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

            iterationCount++;
            if(iterationCount > maxIterations) {
                throw new Error("Data Integrity Error: Rank calculation did not stabilize. Check for circular dependencies in rank qualification logic.");
            }

        } while (ranksChanged);
    }
    
    private updateRanks(): boolean {
        let hasChanged = false;
        
        // Ranks must be calculated from the bottom of the tree up.
        const allNodes = Array.from(this.distributors.values()).sort((a,b) => b.level - a.level);

        allNodes.forEach(d => {
            if (d.status === 'inactive') {
                if (d.rank !== 'Distributor') {
                    d.rank = 'Distributor';
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
        const downline = this.getDownline(distributor.id);

        for (let i = this.rankOrder.length - 1; i >= 0; i--) {
            const rank = this.rankOrder[i];
            const rules = this.rankAdvancementRules[rank];

            const meetsPV = (distributor.personalVolume >= (rules.personalVolume ?? 0));
            const meetsGV = (distributor.groupVolume >= (rules.groupVolume ?? 0));
            
            const downlineManagers = downline.filter(d => d.rank === 'Manager' || d.rank === 'Director' || d.rank === 'Presidential').length;
            const meetsManagers = (downlineManagers >= (rules.downlineManagers ?? 0));
            
            const downlineDirectors = downline.filter(d => d.rank === 'Director' || d.rank === 'Presidential').length;
            const meetsDirectors = (downlineDirectors >= (rules.downlineDirectors ?? 0));
            
            if (meetsPV && meetsGV && meetsManagers && meetsDirectors) {
                return rank;
            }
        }
        
        return 'Distributor';
    }

    private validateFinalRanks() {
        this.distributors.forEach(distributor => {
            const qualifiedRank = this.getQualifiedRank(distributor);
            if (distributor.rank !== qualifiedRank && distributor.status === 'active') {
                // This check is important. An iterative process can sometimes have edge cases.
                // This final validation ensures the computed rank is correct based on the final state of the tree.
                throw new Error(`Data Integrity Error: Distributor #${distributor.id} has rank ${distributor.rank} but qualifies for ${qualifiedRank}.`);
            }
        });
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

    public getNextRank(currentRank: DistributorRank): { rank: DistributorRank, rules: RankRules } | null {
        const currentIndex = this.rankOrder.indexOf(currentRank);
        if (currentIndex < this.rankOrder.length - 1) {
            const nextRank = this.rankOrder[currentIndex + 1];
            return {
                rank: nextRank,
                rules: this.rankAdvancementRules[nextRank]
            };
        }
        return null;
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

    public addDistributor(data: NewDistributorData, parentId: string) {
        const newId = (this.distributors.size + 1).toString();
        const newDistributor: Distributor = {
            id: newId,
            name: data.name,
            parentId: parentId,
            placementId: parentId,
            status: 'active',
            joinDate: new Date().toISOString(),
            personalVolume: data.personalVolume,
            recruits: 0,
            commissions: 0,
            avatarUrl: data.avatarUrl || `https://picsum.photos/seed/${newId}/200/200`,
            rank: 'Distributor',
            children: [],
            groupVolume: 0,
            generationalVolume: [],
            canRecruit: true,
            level: 0,
            customers: [],
        };
        
        this.distributors.set(newId, newDistributor);
        const parent = this.distributors.get(parentId);
        if (parent) {
            parent.children.push(newDistributor);
            this.allDistributorsList.push(newDistributor);
            this.calculateAllMetrics(); // Recalculate metrics after adding
        }
    }
}


const treeManager = new GenealogyTreeManager(flatDistributors, allCustomers, allPurchases);

export const initialTree = treeManager.root;
export const allDistributors = treeManager.allDistributorsList;
export const genealogyManager = treeManager;

    
