import type { Distributor, DistributorRank, Customer, Purchase, NewDistributorData } from './types';
import { PlaceHolderImages } from './placeholder-images';

const flatDistributors: Omit<Distributor, 'children' | 'groupVolume' | 'canRecruit' | 'level' | 'generationalVolume' | 'customers'>[] = [
    { id: '1', name: 'Alice', parentId: null, placementId: null, status: 'active', joinDate: '2023-01-15', personalVolume: 500, recruits: 5, commissions: 750, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl ?? '', rank: 'LV0' },
    { id: '2', name: 'Bob', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-02-20', personalVolume: 200, recruits: 3, commissions: 500, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl ?? '', rank: 'LV0' },
    { id: '3', name: 'Charlie', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-03-10', personalVolume: 800, recruits: 4, commissions: 900, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar3')?.imageUrl ?? '', rank: 'LV0' },
    { id: '4', name: 'David', parentId: '2', placementId: '2', status: 'active', joinDate: '2023-04-05', personalVolume: 400, recruits: 2, commissions: 300, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl ?? '', rank: 'LV0' },
    { id: '5', name: 'Eve', parentId: '2', placementId: '2', status: 'inactive', joinDate: '2023-04-12', personalVolume: 300, recruits: 0, commissions: 50, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar5')?.imageUrl ?? '', rank: 'LV0' },
    { id: '6', name: 'Frank', parentId: '3', placementId: '3', status: 'active', joinDate: '2023-05-18', personalVolume: 1200, recruits: 5, commissions: 1000, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar6')?.imageUrl ?? '', rank: 'LV0' },
    { id: '7', name: 'Grace', parentId: '3', placementId: '3', status: 'active', joinDate: '2023-06-22', personalVolume: 600, recruits: 3, commissions: 800, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar7')?.imageUrl ?? '', rank: 'LV0' },
    { id: '8', name: 'Heidi', parentId: '4', placementId: '4', status: 'active', joinDate: '2023-07-30', personalVolume: 1100, recruits: 1, commissions: 400, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar8')?.imageUrl ?? '', rank: 'LV0' },
    { id: '9', name: 'Ivan', parentId: '6', placementId: '6', status: 'active', joinDate: '2023-08-11', personalVolume: 300, recruits: 2, commissions: 600, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar9')?.imageUrl ?? '', rank: 'LV0' },
    { id: '10', name: 'Judy', parentId: '6', placementId: '6', status: 'inactive', joinDate: '2023-08-19', personalVolume: 400, recruits: 0, commissions: 100, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar10')?.imageUrl ?? '', rank: 'LV0' },
    { id: '11', name: 'Mallory', parentId: '7', placementId: '7', status: 'active', joinDate: '2023-09-01', personalVolume: 700, recruits: 3, commissions: 850, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar11')?.imageUrl ?? '', rank: 'LV0' },
    { id: '12', name: 'Nancy', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-09-05', personalVolume: 550, recruits: 2, commissions: 450, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar12')?.imageUrl ?? '', rank: 'LV0' },
    { id: '13', name: 'Oliver', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-09-10', personalVolume: 750, recruits: 4, commissions: 650, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl ?? '', rank: 'LV0' },
    { id: '14', name: 'Penelope', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-09-15', personalVolume: 950, recruits: 1, commissions: 700, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl ?? '', rank: 'LV0' },
    { id: '15', name: 'Quentin', parentId: '1', placementId: '1', status: 'inactive', joinDate: '2023-09-20', personalVolume: 150, recruits: 0, commissions: 20, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar3')?.imageUrl ?? '', rank: 'LV0' },
    { id: '16', name: 'Rachel', parentId: '1', placementId: '1', status: 'active', joinDate: '2023-09-25', personalVolume: 1250, recruits: 6, commissions: 1100, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar4')?.imageUrl ?? '', rank: 'LV0' },
    { id: '17', name: 'Steve', parentId: '12', placementId: '12', status: 'active', joinDate: '2023-10-01', personalVolume: 300, recruits: 1, commissions: 200, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar5')?.imageUrl ?? '', rank: 'LV0' },
    { id: '18', name: 'Tina', parentId: '12', placementId: '12', status: 'active', joinDate: '2023-10-02', personalVolume: 400, recruits: 2, commissions: 250, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar6')?.imageUrl ?? '', rank: 'LV0' },
    { id: '19', name: 'Ursula', parentId: '13', placementId: '13', status: 'active', joinDate: '2023-10-03', personalVolume: 600, recruits: 3, commissions: 500, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar7')?.imageUrl ?? '', rank: 'LV0' },
    { id: '20', name: 'Victor', parentId: '14', placementId: '14', status: 'active', joinDate: '2023-10-04', personalVolume: 800, recruits: 0, commissions: 150, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar8')?.imageUrl ?? '', rank: 'LV0' },
    { id: '21', name: 'Wendy', parentId: '16', placementId: '16', status: 'active', joinDate: '2023-10-05', personalVolume: 1100, recruits: 5, commissions: 950, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar9')?.imageUrl ?? '', rank: 'LV0' },
    { id: '22', name: 'Xavier', parentId: '16', placementId: '16', status: 'active', joinDate: '2023-10-06', personalVolume: 250, recruits: 1, commissions: 100, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar10')?.imageUrl ?? '', rank: 'LV0' },
    { id: '23', name: 'Yara', parentId: '21', placementId: '21', status: 'active', joinDate: '2023-10-10', personalVolume: 700, recruits: 2, commissions: 600, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar11')?.imageUrl ?? '', rank: 'LV0' },
    { id: '24', name: 'Zane', parentId: '21', placementId: '21', status: 'inactive', joinDate: '2023-10-12', personalVolume: 100, recruits: 0, commissions: 0, avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar12')?.imageUrl ?? '', rank: 'LV0' },
    { id: '25', name: 'Aaron', parentId: '3', placementId: '3', status: 'active', joinDate: '2024-01-01', personalVolume: 100, recruits: 0, commissions: 10, avatarUrl: `https://picsum.photos/seed/25/200/200`, rank: 'LV0' },
    { id: '26', name: 'Bertha', parentId: '3', placementId: '3', status: 'active', joinDate: '2024-01-02', personalVolume: 150, recruits: 0, commissions: 15, avatarUrl: `https://picsum.photos/seed/26/200/200`, rank: 'LV0' },
    { id: '27', name: 'Caleb', parentId: '4', placementId: '4', status: 'active', joinDate: '2024-01-03', personalVolume: 200, recruits: 0, commissions: 20, avatarUrl: `https://picsum.photos/seed/27/200/200`, rank: 'LV0' },
    { id: '28', name: 'Doris', parentId: '4', placementId: '4', status: 'inactive', joinDate: '2024-01-04', personalVolume: 50, recruits: 0, commissions: 5, avatarUrl: `https://picsum.photos/seed/28/200/200`, rank: 'LV0' },
    { id: '29', name: 'Ethan', parentId: '6', placementId: '6', status: 'active', joinDate: '2024-01-05', personalVolume: 300, recruits: 0, commissions: 30, avatarUrl: `https://picsum.photos/seed/29/200/200`, rank: 'LV0' },
    { id: '30', name: 'Fiona', parentId: '7', placementId: '7', status: 'active', joinDate: '2024-01-06', personalVolume: 250, recruits: 0, commissions: 25, avatarUrl: `https://picsum.photos/seed/30/200/200`, rank: 'LV0' },
    { id: '31', name: 'George', parentId: '8', placementId: '8', status: 'active', joinDate: '2024-01-07', personalVolume: 400, recruits: 0, commissions: 40, avatarUrl: `https://picsum.photos/seed/31/200/200`, rank: 'LV0' },
    { id: '32', name: 'Hannah', parentId: '9', placementId: '9', status: 'active', joinDate: '2024-01-08', personalVolume: 500, recruits: 0, commissions: 50, avatarUrl: `https://picsum.photos/seed/32/200/200`, rank: 'LV0' },
    { id: '33', name: 'Isaac', parentId: '11', placementId: '11', status: 'active', joinDate: '2024-01-09', personalVolume: 600, recruits: 0, commissions: 60, avatarUrl: `https://picsum.photos/seed/33/200/200`, rank: 'LV0' },
    { id: '34', name: 'Jane', parentId: '12', placementId: '12', status: 'active', joinDate: '2024-01-10', personalVolume: 700, recruits: 0, commissions: 70, avatarUrl: `https://picsum.photos/seed/34/200/200`, rank: 'LV0' },
    { id: '35', name: 'Kevin', parentId: '13', placementId: '13', status: 'active', joinDate: '2024-01-11', personalVolume: 800, recruits: 0, commissions: 80, avatarUrl: `https://picsum.photos/seed/35/200/200`, rank: 'LV0' },
    { id: '36', name: 'Laura', parentId: '14', placementId: '14', status: 'active', joinDate: '2024-01-12', personalVolume: 900, recruits: 0, commissions: 90, avatarUrl: `https://picsum.photos/seed/36/200/200`, rank: 'LV0' },
    { id: '37', name: 'Mike', parentId: '16', placementId: '16', status: 'active', joinDate: '2024-01-13', personalVolume: 1000, recruits: 0, commissions: 100, avatarUrl: `https://picsum.photos/seed/37/200/200`, rank: 'LV0' },
    { id: '38', name: 'Nora', parentId: '17', placementId: '17', status: 'active', joinDate: '2024-01-14', personalVolume: 1100, recruits: 0, commissions: 110, avatarUrl: `https://picsum.photos/seed/38/200/200`, rank: 'LV0' },
    { id: '39', name: 'Oscar', parentId: '18', placementId: '18', status: 'active', joinDate: '2024-01-15', personalVolume: 1200, recruits: 0, commissions: 120, avatarUrl: `https://picsum.photos/seed/39/200/200`, rank: 'LV0' },
    { id: '40', name: 'Patty', parentId: '19', placementId: '19', status: 'inactive', joinDate: '2024-01-16', personalVolume: 1300, recruits: 0, commissions: 130, avatarUrl: `https://picsum.photos/seed/40/200/200`, rank: 'LV0' },
    { id: '41', name: 'Quincy', parentId: '20', placementId: '20', status: 'active', joinDate: '2024-01-17', personalVolume: 1400, recruits: 0, commissions: 140, avatarUrl: `https://picsum.photos/seed/41/200/200`, rank: 'LV0' },
    { id: '42', name: 'Rita', parentId: '21', placementId: '21', status: 'active', joinDate: '2024-01-18', personalVolume: 1500, recruits: 0, commissions: 150, avatarUrl: `https://picsum.photos/seed/42/200/200`, rank: 'LV0' },
    { id: '43', name: 'Stan', parentId: '22', placementId: '22', status: 'active', joinDate: '2024-01-19', personalVolume: 1600, recruits: 0, commissions: 160, avatarUrl: `https://picsum.photos/seed/43/200/200`, rank: 'LV0' },
    { id: '44', name: 'Thea', parentId: '23', placementId: '23', status: 'active', joinDate: '2024-01-20', personalVolume: 1700, recruits: 0, commissions: 170, avatarUrl: `https://picsum.photos/seed/44/200/200`, rank: 'LV0' },
    { id: '45', name: 'Urban', parentId: '1', placementId: '1', status: 'active', joinDate: '2024-01-21', personalVolume: 1800, recruits: 0, commissions: 180, avatarUrl: `https://picsum.photos/seed/45/200/200`, rank: 'LV0' },
    { id: '46', name: 'Vince', parentId: '1', placementId: '1', status: 'active', joinDate: '2024-01-22', personalVolume: 1900, recruits: 0, commissions: 190, avatarUrl: `https://picsum.photos/seed/46/200/200`, rank: 'LV0' },
    { id: '47', name: 'Wally', parentId: '1', placementId: '1', status: 'active', joinDate: '2024-01-23', personalVolume: 2000, recruits: 0, commissions: 200, avatarUrl: `https://picsum.photos/seed/47/200/200`, rank: 'LV0' },
    { id: '48', name: 'Xenia', parentId: '1', placementId: '1', status: 'active', joinDate: '2024-01-24', personalVolume: 2100, recruits: 0, commissions: 210, avatarUrl: `https://picsum.photos/seed/48/200/200`, rank: 'LV0' },
    { id: '49', name: 'Yasmine', parentId: '1', placementId: '1', status: 'active', joinDate: '2024-01-25', personalVolume: 2200, recruits: 0, commissions: 220, avatarUrl: `https://picsum.photos/seed/49/200/200`, rank: 'LV0' },
    { id: '50', name: 'Zorro', parentId: '2', placementId: '2', status: 'active', joinDate: '2024-01-26', personalVolume: 2300, recruits: 0, commissions: 230, avatarUrl: `https://picsum.photos/seed/50/200/200`, rank: 'LV0' },
    { id: '51', name: 'Andy', parentId: '3', placementId: '3', status: 'active', joinDate: '2024-01-27', personalVolume: 2400, recruits: 0, commissions: 240, avatarUrl: `https://picsum.photos/seed/51/200/200`, rank: 'LV0' },
    { id: '52', name: 'Brenda', parentId: '4', placementId: '4', status: 'active', joinDate: '2024-01-28', personalVolume: 2500, recruits: 0, commissions: 250, avatarUrl: `https://picsum.photos/seed/52/200/200`, rank: 'LV0' },
    { id: '53', name: 'Carl', parentId: '6', placementId: '6', status: 'active', joinDate: '2024-01-29', personalVolume: 2600, recruits: 0, commissions: 260, avatarUrl: `https://picsum.photos/seed/53/200/200`, rank: 'LV0' },
    { id: '54', name: 'Debby', parentId: '7', placementId: '7', status: 'active', joinDate: '2024-01-30', personalVolume: 2700, recruits: 0, commissions: 270, avatarUrl: `https://picsum.photos/seed/54/200/200`, rank: 'LV0' },
    // 60 more users, randomly placed under existing users
    ...Array.from({ length: 60 }, (_, i) => {
        const parentId = (Math.floor(Math.random() * 54) + 1).toString(); // Random parent from 1 to 54
        return {
            id: (55 + i).toString(),
            name: `New Recruit ${i + 1}`,
            parentId: parentId,
            placementId: parentId,
            status: 'active' as 'active' | 'inactive',
            joinDate: `2024-02-${(i % 28) + 1}`,
            personalVolume: Math.floor(Math.random() * 500) + 50,
            recruits: 0,
            commissions: Math.floor(Math.random() * 100),
            avatarUrl: `https://picsum.photos/seed/${55 + i}/200/200`,
            rank: 'LV0' as DistributorRank,
        };
    }),
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
        
        this.buildTree();
        this.detectCircularDependencies();
        this.calculateAllMetrics();
        this.allDistributorsList = Array.from(this.distributors.values());
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
            throw new Error('Data Integrity Error: No root node found in the tree.');
        }
    }

    public buildTreeFromMap(): Distributor | null {
        this.calculateAllMetrics(); // Recalculate everything
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
                // In our model, children are based on placementId
                const children = Array.from(this.distributors.values()).filter(d => d.placementId === nodeId);
                for (const child of children) {
                    if (!visited.has(child.id)) {
                        if (detect(child.id)) {
                            return true;
                        }
                    } else if (recursionStack.has(child.id)) {
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
        if (this.distributors.size === 0) return;

        // 1. Build the tree structure based on placementId
        this.distributors.forEach(d => d.children = []);
        this.distributors.forEach(d => {
            if (d.placementId && this.distributors.has(d.placementId)) {
                this.distributors.get(d.placementId)!.children.push(d);
            }
        });
        
        // Sort children for consistent display if needed
        this.distributors.forEach(d => {
            d.children.sort((a,b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
        });

        // 2. Set levels and recruitment status
        this.distributors.forEach(node => {
            node.canRecruit = node.status === 'active';
        });

        // 3. Update ranks based on direct recruits
        this.updateRanks();

        // 4. Update the main root property
        this.root = Array.from(this.distributors.values()).find(d => d.parentId === null) || null;
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

            // Count direct children (recruits) based on placementId
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
        // Rank is determined by the number of direct recruits
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
                // Get children based on placementId for traversal
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

    public addDistributor(data: NewDistributorData, parentId: string) {
        const newId = (this.distributors.size + 1).toString();
        const parent = this.distributors.get(parentId);
        if (!parent) {
            console.error("Cannot add distributor to a non-existent parent.");
            return;
        }

        const newDistributor: Distributor = {
            id: newId,
            name: data.name,
            parentId: parentId, // sponsorship parent
            placementId: parentId, // placement in the tree
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
            level: parent.level + 1,
            customers: [],
        };
        
        this.distributors.set(newId, newDistributor);
        this.allDistributorsList.push(newDistributor);
        
        // Full recalculation is needed as an upline's rank may change
        this.calculateAllMetrics();
        // Rebuild tree structure for rendering
        this.buildTree();
    }
}


const treeManager = new GenealogyTreeManager(flatDistributors, allCustomers, allPurchases);

export const initialTree = treeManager.root;
export const allDistributors = treeManager.allDistributorsList;
export const genealogyManager = treeManager;

    
