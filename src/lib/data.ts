import type { Distributor } from './types';
import { PlaceHolderImages } from './placeholder-images';

const flatDistributors: Omit<Distributor, 'children' | 'groupVolume' | 'placementAllowed'>[] = [
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

function processData() {
    const distributorMap = new Map<string, Distributor>();

    // Initial map creation
    flatDistributors.forEach(d => {
        distributorMap.set(d.id, { ...d, children: [], groupVolume: 0, placementAllowed: false });
    });

    const activeDistributors = flatDistributors.filter(d => d.status === 'active');
    const distributorTree = new Map<string, Distributor>();
    activeDistributors.forEach(d => {
        distributorTree.set(d.id, { ...d, children: [], groupVolume: 0, placementAllowed: false });
    });

    const rootNodes: Distributor[] = [];

    activeDistributors.forEach(d => {
        const distributorNode = distributorTree.get(d.id)!;
        if (d.placementId && distributorTree.has(d.placementId)) {
            const parentNode = distributorTree.get(d.placementId)!;

            const hasLeft = parentNode.children.some(c => c.position === 'left');
            const hasRight = parentNode.children.some(c => c.position === 'right');

            if ((d.position === 'left' && !hasLeft) || (d.position === 'right' && !hasRight)) {
                 parentNode.children.push(distributorNode);
            }
        } else if (!d.placementId) {
            rootNodes.push(distributorNode);
        }
    });

    function calculateGroupVolume(node: Distributor): number {
        const childrenVolume = node.children.reduce((sum, child) => sum + calculateGroupVolume(child), 0);
        node.groupVolume = node.personalVolume + childrenVolume;
        
        const hasLeft = node.children.some(c => c.position === 'left');
        const hasRight = node.children.some(c => c.position === 'right');
        node.placementAllowed = !hasLeft || !hasRight;

        return node.groupVolume;
    }
    
    rootNodes.forEach(calculateGroupVolume);
    
    // Update original map with calculated volumes and placement statuses
    distributorTree.forEach((node, id) => {
        const originalNode = distributorMap.get(id);
        if (originalNode) {
            originalNode.groupVolume = node.groupVolume;
            originalNode.placementAllowed = node.placementAllowed;
            originalNode.children = node.children;
        }
    });


    // Rebuild the full tree with all distributors for display, but using the compressed structure logic
    const displayMap = new Map<string, Distributor>();
    flatDistributors.forEach(d => {
        displayMap.set(d.id, { 
            ...d, 
            children: [], 
            groupVolume: distributorMap.get(d.id)?.groupVolume ?? 0,
            placementAllowed: distributorMap.get(d.id)?.placementAllowed ?? false,
        });
    });

    const displayRootNodes: Distributor[] = [];
    flatDistributors.forEach(d => {
        const distributorNode = displayMap.get(d.id)!;
        if (d.placementId) {
            const parentNode = displayMap.get(d.placementId);
            if (parentNode) {
                const hasLeft = parentNode.children.some(c => c.position === 'left');
                const hasRight = parentNode.children.some(c => c.position === 'right');

                if ((d.position === 'left' && !hasLeft) || (d.position === 'right' && !hasRight)) {
                     parentNode.children.push(distributorNode);
                }
            }
        } else {
            displayRootNodes.push(distributorNode);
        }
    });


    const allDistributorsWithVolume: Distributor[] = Array.from(displayMap.values());
    
    return {
        tree: displayRootNodes.length > 0 ? displayRootNodes[0] : null,
        list: allDistributorsWithVolume
    };
}

const { tree, list } = processData();

export const genealogyTree = tree;
export const allDistributors = list;
