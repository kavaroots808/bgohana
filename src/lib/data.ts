
import type { Distributor, DistributorRank, Customer, Purchase, NewDistributorData } from './types';
import { PlaceHolderImages } from './placeholder-images';

const flatDistributors: Omit<Distributor, 'children' | 'groupVolume' | 'canRecruit' | 'level' | 'generationalVolume' | 'customers'>[] = [
    { id: '1', name: 'Alice', parentId: null, placementId: null, status: 'active', joinDate: '2023-01-15', personalVolume: 500, recruits: 5, commissions: 750, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl ?? '', rank: 'LV0' },
    { id: '2', name: 'Bob', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-02-20', personalVolume: 200, recruits: 3, commissions: 500, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl ?? '', rank: 'LV0' },
    { id: '3', name: 'Charlie', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-03-10', personalVolume: 800, recruits: 4, commissions: 900, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar3')?.imageUrl ?? '', rank: 'LV0' },
    { id: '4', name: 'David', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-04-05', personalVolume: 400, recruits: 2, commissions: 300, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl ?? '', rank: 'LV0' },
    { id: '5', name: 'Eve', parentId: '1', placementId: '1', status: 'inactive', joinDate: '2023-04-12', personalVolume: 300, recruits: 0, commissions: 50, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar5')?.imageUrl ?? '', rank: 'LV0' },
    { id: '6', name: 'Frank', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-05-18', personalVolume: 1200, recruits: 5, commissions: 1000, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar6')?.imageUrl ?? '', rank: 'LV0' },
    { id: '7', name: 'Grace', parentId: '2', placementId: '2', status: 'active', joinDate: '2023-06-22', personalVolume: 600, recruits: 3, commissions: 800, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar7')?.imageUrl ?? '', rank: 'LV0' },
    { id: '8', name: 'Heidi', parentId: '2', placementId: '2', status: 'active', joinDate: '2023-07-30', personalVolume: 1100, recruits: 1, commissions: 400, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar8')?.imageUrl ?? '', rank: 'LV0' },
    { id: '9', name: 'Ivan', parentId: '2', placementId: '2', status: 'active', joinDate: '2023-08-11', personalVolume: 300, recruits: 2, commissions: 600, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar9')?.imageUrl ?? '', rank: 'LV0' },
    { id: '10', name: 'Judy', parentId: '2', placementId: '2', status: 'inactive', joinDate: '2023-08-19', personalVolume: 400, recruits: 0, commissions: 100, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar10')?.imageUrl ?? '', rank: 'LV0' },
    { id: '11', name: 'Mallory', parentId: '2', placementId: '2', status: 'active', joinDate: '2023-09-01', personalVolume: 700, recruits: 3, commissions: 850, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar11')?.imageUrl ?? '', rank: 'LV0' },
    { id: '12', name: 'Nancy', parentId: '3', placementId: '3', status: 'active', joinDate: '2023-09-05', personalVolume: 550, recruits: 2, commissions: 450, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar12')?.imageUrl ?? '', rank: 'LV0' },
    { id: '13', name: 'Oliver', parentId: '3', placementId: '3', status: 'active', joinDate: '2023-09-10', personalVolume: 750, recruits: 4, commissions: 650, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl ?? '', rank: 'LV0' },
    { id: '14', name: 'Penelope', parentId: '3', placementId: '3', status: 'active', joinDate: '2023-09-15', personalVolume: 950, recruits: 1, commissions: 700, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl ?? '', rank: 'LV0' },
    { id: '15', name: 'Quentin', parentId: '3', placementId: '3', status: 'inactive', joinDate: '2023-09-20', personalVolume: 150, recruits: 0, commissions: 20, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar3')?.imageUrl ?? '', rank: 'LV0' },
    { id: '16', name: 'Rachel', parentId: '3', placementId: '3', status: 'active', joinDate: '2023-09-25', personalVolume: 1250, recruits: 6, commissions: 1100, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl ?? '', rank: 'LV0' },
    { id: '17', name: 'Steve', parentId: '4', placementId: '4', status: 'active', joinDate: '2023-10-01', personalVolume: 300, recruits: 1, commissions: 200, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar5')?.imageUrl ?? '', rank: 'LV0' },
    { id: '18', name: 'Tina', parentId: '4', placementId: '4', status: 'active', joinDate: '2023-10-02', personalVolume: 400, recruits: 2, commissions: 250, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar6')?.imageUrl ?? '', rank: 'LV0' },
    { id: '19', name: 'Ursula', parentId: '4', placementId: '4', status: 'active', joinDate: '2023-10-03', personalVolume: 600, recruits: 3, commissions: 500, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar7')?.imageUrl ?? '', rank: 'LV0' },
    { id: '20', name: 'Victor', parentId: '4', placementId: '4', status: 'active', joinDate: '2023-10-04', personalVolume: 800, recruits: 0, commissions: 150, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar8')?.imageUrl ?? '', rank: 'LV0' },
    { id: '21', name: 'Wendy', parentId: '4', placementId: '4', status: 'active', joinDate: '2023-10-05', personalVolume: 1100, recruits: 5, commissions: 950, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar9')?.imageUrl ?? '', rank: 'LV0' },
    { id: '22', name: 'Xavier', parentId: '5', placementId: '5', status: 'active', joinDate: '2023-10-06', personalVolume: 250, recruits: 1, commissions: 100, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar10')?.imageUrl ?? '', rank: 'LV0' },
    { id: '23', name: 'Yara', parentId: '5', placementId: '5', status: 'active', joinDate: '2023-10-10', personalVolume: 700, recruits: 2, commissions: 600, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar11')?.imageUrl ?? '', rank: 'LV0' },
    { id: '24', name: 'Zane', parentId: '5', placementId: '5', status: 'inactive', joinDate: '2023-10-12', personalVolume: 100, recruits: 0, commissions: 0, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar12')?.imageUrl ?? '', rank: 'LV0' },
    { id: '25', name: 'Aaron', parentId: '5', placementId: '5', status: 'active', joinDate: '2024-01-01', personalVolume: 100, recruits: 0, commissions: 10, avatarUrl: `https://picsum.photos/seed/25/200/200`, rank: 'LV0' },
    { id: '26', name: 'Bertha', parentId: '5', placementId: '5', status: 'active', joinDate: '2024-01-02', personalVolume: 150, recruits: 0, commissions: 15, avatarUrl: `https://picsum.photos/seed/26/200/200`, rank: 'LV0' },
    { id: '27', name: 'Caleb', parentId: '6', placementId: '6', status: 'active', joinDate: '2024-01-03', personalVolume: 200, recruits: 0, commissions: 20, avatarUrl: `https://picsum.photos/seed/27/200/200`, rank: 'LV0' },
    { id: '28', name: 'Doris', parentId: '6', placementId: '6', status: 'inactive', joinDate: '2024-01-04', personalVolume: 50, recruits: 0, commissions: 5, avatarUrl: `https://picsum.photos/seed/28/200/200`, rank: 'LV0' },
    { id: '29', name: 'Ethan', parentId: '6', placementId: '6', status: 'active', joinDate: '2024-01-05', personalVolume: 300, recruits: 0, commissions: 30, avatarUrl: `https://picsum.photos/seed/29/200/200`, rank: 'LV0' },
    { id: '30', name: 'Fiona', parentId: '6', placementId: '6', status: 'active', joinDate: '2024-01-06', personalVolume: 250, recruits: 0, commissions: 25, avatarUrl: `https://picsum.photos/seed/30/200/200`, rank: 'LV0' },
    { id: '31', name: 'George', parentId: '6', placementId: '6', status: 'active', joinDate: '2024-01-07', personalVolume: 400, recruits: 0, commissions: 40, avatarUrl: `https://picsum.photos/seed/31/200/200`, rank: 'LV0' },
    { id: '32', name: 'Hannah', parentId: '7', placementId: '7', status: 'active', joinDate: '2024-01-08', personalVolume: 500, recruits: 0, commissions: 50, avatarUrl: `https://picsum.photos/seed/32/200/200`, rank: 'LV0' },
    ...Array.from({ length: 82 }, (_, i) => ({
        id: (33 + i).toString(),
        name: `User ${i + 33}`,
        parentId: '1', 
        placementId: '1', 
        status: 'active' as 'active' | 'inactive',
        joinDate: `2024-02-${(i % 28) + 1}`,
        personalVolume: Math.floor(Math.random() * 500) + 50,
        recruits: 0,
        commissions: Math.floor(Math.random() * 100),
        avatarUrl: `https://picsum.photos/seed/${33 + i}/200/200`,
        rank: 'LV0' as DistributorRank,
    })),
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

const rankThresholds: { level: DistributorRank, minRecruits: number }[] = [
    { level: 'LV9', minRecruits: 5000 },
    { level: 'LV8', minRecruits: 2500 },
    { level: 'LV7', minRecruits: 1500 },
    { level: 'LV6', minRecruits: 1000 },
    { level: 'LV5', minRecruits: 600 },
    { level: 'LV4', minRecruits: 300 },
    { level: 'LV3', minRecruits: 100 },
    { level: 'LV2', minRecruits: 30 },
    { level: 'LV1', minRecruits: 5 },
    { level: 'LV0', minRecruits: 0 },
];

export class GenealogyTreeManager {
    private distributors: Map<string, Distributor> = new Map();
    private customers: Map<string, Customer> = new Map();
    private purchases: Purchase[] = [];
    public root: Distributor | null = null;
    public allDistributorsList: Distributor[] = [];
    
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
                rank: 'LV0' // Initialize all to LV0
            });
        });
        
        // Structure the tree into a 5x5 matrix
        this.structureAs5x5Matrix();

        this.detectCircularDependencies();
        this.calculateAllMetrics();
        this.allDistributorsList = Array.from(this.distributors.values());
    }

    private structureAs5x5Matrix() {
        const distributorsList = Array.from(this.distributors.values());
        const rootNode = distributorsList.find(d => d.parentId === null);

        if (!rootNode) {
            console.error("No root node found to build the matrix.");
            return;
        }

        const nodesToPlace = distributorsList.filter(d => d.id !== rootNode.id);
        const queue: Distributor[] = [rootNode];
        
        const isDescendant = (potentialChildId: string, parentId: string): boolean => {
            const path = new Set<string>();
            let currentId: string | null = parentId;
            while(currentId) {
                if (currentId === potentialChildId) return true;
                const currentNode = this.distributors.get(currentId);
                path.add(currentId);
                currentId = currentNode?.placementId ?? null;
                if(path.has(currentId)) return true; // Cycle detected
            }
            return false;
        };
        

        for (const node of nodesToPlace) {
            let placed = false;
            let head = 0;
            while (!placed && head < queue.length) {
                const currentParent = queue[head];
                
                const childCount = distributorsList.filter(d => d.placementId === currentParent.id).length;

                if (currentParent.status === 'active' && childCount < 5 && currentParent.id !== node.id && !isDescendant(currentParent.id, node.id)) {
                    node.placementId = currentParent.id;
                    node.parentId = node.parentId || currentParent.id; 
                    placed = true;
                } else {
                    head++;
                }
            }
             if(!queue.some(q => q.id === node.id)) {
                queue.push(node);
            }
             // Fallback if no place is found in the current queue
            if(!placed) {
                const availableParent = queue.find(p => {
                    const childCount = distributorsList.filter(d => d.placementId === p.id).length;
                    return p.status === 'active' && childCount < 5 && p.id !== node.id && !isDescendant(p.id, node.id);
                });
                
                if (availableParent) {
                     node.placementId = availableParent.id;
                     node.parentId = node.parentId || availableParent.id;
                } else {
                     node.placementId = rootNode.id;
                     node.parentId = node.parentId || rootNode.id;
                }
            }
        }

        this.buildTree();
    }


    private buildTree() {
        this.distributors.forEach(distributor => {
            distributor.children = []; // Reset children before rebuilding
        });
        this.distributors.forEach(distributor => {
            if (distributor.placementId && this.distributors.has(distributor.placementId)) {
                this.distributors.get(distributor.placementId)!.children.push(distributor);
            }
        });

        this.root = Array.from(this.distributors.values()).find(d => d.parentId === null) || null;

        if (!this.root && this.distributors.size > 0) {
            // Find a potential root if null parent is not explicitly set
            const potentialRoots = Array.from(this.distributors.values()).filter(d => !this.distributors.has(d.parentId || ''));
            if(potentialRoots.length > 0) {
                this.root = potentialRoots[0];
                this.root.parentId = null; // Fix it
            } else {
                 throw new Error('Data Integrity Error: No root node found and could not determine one.');
            }
        }
    }

    public buildTreeFromMap(): Distributor | null {
        this.calculateAllMetrics(); // Recalculate everything
        return this.root;
    }
    
    private detectCircularDependencies() {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const detect = (nodeId: string): boolean => {
            if (recursionStack.has(nodeId)) {
                console.error(`Data Integrity Error: Circular dependency detected at distributor #${nodeId}.`);
                return true;
            }
            if (visited.has(nodeId)) {
                return false;
            }

            visited.add(nodeId);
            recursionStack.add(nodeId);

            const node = this.distributors.get(nodeId);
            if (node && node.placementId) {
                if (detect(node.placementId)) {
                     const rootNode = this.root || Array.from(this.distributors.values())[0];
                     if(node.id !== rootNode.id) {
                         console.error(`Correcting circular dependency for node #${node.id}. Setting placement to root #${rootNode.id}`);
                         node.placementId = rootNode.id;
                         node.parentId = rootNode.id;
                     }
                    return true;
                }
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
            this.buildTree();
        }
    }
    
    private calculateAllMetrics() {
        if (this.distributors.size === 0) return;
        
        let hasChanges: boolean;
        let iteration = 0;
        const maxIterations = this.distributors.size; // Safety break
        do {
            this.distributors.forEach(node => {
                node.canRecruit = node.status === 'active';
            });

            hasChanges = this.updateRanks();

            iteration++;
        } while (hasChanges && iteration < maxIterations);

        if (iteration >= maxIterations) {
            console.error("Rank calculation exceeded max iterations, potential infinite loop.");
        }
        
        this.buildTree();
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

            const numRecruits = Array.from(this.distributors.values()).filter(child => child.placementId === d.id).length;
            d.recruits = numRecruits;
            
            const newRank = this.getQualifiedRank(d);
            if (d.rank !== newRank) {
                d.rank = newRank;
                hasChanged = true;
            }
        });
        return hasChanged;
    }
    
    private getQualifiedRank(distributor: Distributor): DistributorRank {
        const numRecruits = distributor.recruits;
        for (const { level, minRecruits } of rankThresholds) {
            if (numRecruits >= minRecruits) {
                return level;
            }
        }
        return 'LV0';
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
                const children = Array.from(this.distributors.values()).filter(d => d.placementId === node.id);
                children.forEach(child => {
                    if(!visited.has(child.id)) {
                        visited.add(child.id);
                        queue.push({ node: child, level: level + 1 });
                    }
                });
            }
        }
        return downline;
    }

    public addDistributor(data: NewDistributorData, sponsorId: string) {
        const newId = (this.distributors.size + 100).toString(); 
        const sponsor = this.distributors.get(sponsorId);
        if (!sponsor) {
            console.error("Cannot add distributor to a non-existent sponsor.");
            return;
        }

        const placementParent = this.findPlacement(sponsorId);

        const newDistributor: Distributor = {
            id: newId,
            name: data.name,
            parentId: sponsorId,
            placementId: placementParent.id,
            status: 'active',
            joinDate: new Date().toISOString(),
            personalVolume: data.personalVolume,
            recruits: 0,
            commissions: 0,
            avatarUrl: data.avatarUrl || `https://picsum.photos/seed/${newId}/200/200`,
            rank: 'LV0',
            children: [],
            groupVolume: 0,
            generationalVolume: [],
            canRecruit: true,
            level: placementParent.level + 1,
            customers: [],
        };
        
        this.distributors.set(newId, newDistributor);
        this.allDistributorsList.push(newDistributor);
        
        this.calculateAllMetrics();
    }

    private findPlacement(startNodeId: string): Distributor {
        const startNode = this.distributors.get(startNodeId);
        if (!startNode) return this.root!;

        const queue: Distributor[] = [startNode];
        const visited = new Set<string>([startNodeId]);
        let head = 0;

        while(head < queue.length) {
            const currentNode = queue[head];
            
            if (currentNode.status === 'active') {
                const childCount = Array.from(this.distributors.values()).filter(d => d.placementId === currentNode.id).length;
                if (childCount < 5) {
                    return currentNode;
                }
            }

            const children = Array.from(this.distributors.values()).filter(d => d.placementId === currentNode.id);
            for(const child of children) {
                if (!visited.has(child.id)) {
                    visited.add(child.id);
                    queue.push(child);
                }
            }
            head++;
        }

        return this.root!;
    }
}


const treeManager = new GenealogyTreeManager(flatDistributors, allCustomers, allPurchases);

export const initialTree = treeManager.root;
export const allDistributors = treeManager.allDistributorsList;
export const genealogyManager = treeManager;

    

    