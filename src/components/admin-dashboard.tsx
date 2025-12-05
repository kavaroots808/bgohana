
'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Trees, X, UserPlus, ImageUp, Library } from 'lucide-react';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import Link from 'next/link';
import { DistributorHierarchyRow } from './distributor-hierarchy-row';
import type { Distributor, DistributorRank, NewDistributorData } from '@/lib/types';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

const rankOptions: DistributorRank[] = ['LV0', 'LV1', 'LV2', 'LV3', 'LV4', 'LV5', 'LV6', 'LV7', 'LV8', 'LV9', 'LV10', 'LV11', 'LV12'];

const defaultNewDistributor: NewDistributorData & { parentId: string | null } = {
  name: '',
  email: '',
  personalVolume: 0,
  avatarUrl: '',
  parentId: null,
};

export function AdminDashboard() {
  const { allDistributors, loading, tree: originalTree, addDistributor } = useGenealogyTree();
  const [nameFilter, setNameFilter] = useState('');
  const [rankFilter, setRankFilter] = useState<DistributorRank | 'all'>('all');
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [newDistributorData, setNewDistributorData] = useState(defaultNewDistributor);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { isAdmin } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);


  const filteredTree = useMemo(() => {
    if (!allDistributors || !originalTree) return null;

    if (!nameFilter && rankFilter === 'all') {
      return originalTree;
    }

    const lowerCaseNameFilter = nameFilter.toLowerCase();
    
    // First, filter the flat list of distributors
    const filteredDistributorsList = allDistributors.filter(d => {
      const nameMatch = d.name.toLowerCase().includes(lowerCaseNameFilter);
      const rankMatch = rankFilter === 'all' || d.rank === rankFilter;
      return nameMatch && rankMatch;
    });

    if (filteredDistributorsList.length === 0) {
      return null;
    }

    // Rebuild the tree from the filtered list
    const distributorsMap = new Map<string, Distributor>();
    filteredDistributorsList.forEach(d => {
        distributorsMap.set(d.id, { ...d, children: [] });
    });

    let root: Distributor | null = null;
    const allNodes = Array.from(distributorsMap.values());
    
    // Find the highest-level node in the filtered set to act as the root
    let potentialRoots = allNodes.filter(node => !node.parentId || !distributorsMap.has(node.parentId));
    
    // Prefer the original root if it's in the list
    const originalRootInFiltered = potentialRoots.find(r => r.id === originalTree.id);
    root = originalRootInFiltered || potentialRoots[0] || null;

    if (!root) return null; // Should not happen if list is not empty

    allNodes.forEach(distributor => {
        if (distributor.id === root?.id) return;
        const parent = distributorsMap.get(distributor.parentId!);
        if (parent) {
            parent.children.push(distributor);
            parent.children.sort((a,b) => a.name.localeCompare(b.name));
        }
    });

    return root;

  }, [allDistributors, originalTree, nameFilter, rankFilter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewDistributorData(prev => ({ ...prev, [id]: value }));
  };

  const handleSponsorSelect = (value: string) => {
    setNewDistributorData(prev => ({ ...prev, parentId: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setNewDistributorData(prev => ({ ...prev, avatarUrl: result }));
            setPreviewAvatar(result);
        };
        reader.readAsDataURL(file);
    }
  };
  
  const handleEnrollDistributor = () => {
    if (!newDistributorData.name || !newDistributorData.parentId) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a name and select a sponsor.',
      });
      return;
    }
    
    addDistributor(newDistributorData, newDistributorData.parentId);
    toast({
      title: 'Distributor Enrolled',
      description: `${newDistributorData.name} has been added to the genealogy.`,
    });
    setNewDistributorData(defaultNewDistributor);
    setPreviewAvatar(null);
    setIsEnrollOpen(false);
  };


  if (loading || !originalTree || !isAdmin) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <main className="flex-1 flex items-center justify-center">
          <p>Loading distributor data...</p>
        </main>
      </div>
    );
  }

  const isFiltering = nameFilter !== '' || rankFilter !== 'all';
  const clearFilters = () => {
    setNameFilter('');
    setRankFilter('all');
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Backend</h1>
          <p className="text-muted-foreground">
            Manage distributors and system settings.
          </p>
        </div>
        <div className="flex gap-2">
           <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Enroll Distributor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Enroll New Distributor</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new distributor and select their sponsor.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={previewAvatar ?? `https://picsum.photos/seed/new/200/200`} alt="New distributor avatar" data-ai-hint="person face" />
                            <AvatarFallback><UserPlus/></AvatarFallback>
                        </Avatar>
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <ImageUp className="mr-2 h-4 w-4" />
                            Upload Photo
                        </Button>
                        <Input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handlePhotoUpload}
                            accept="image/*"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={newDistributorData.name} onChange={handleInputChange} className="col-span-3" placeholder="e.g. Jane Doe" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" value={newDistributorData.email} onChange={handleInputChange} className="col-span-3" placeholder="e.g. jane.doe@example.com" type="email" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sponsor" className="text-right">Sponsor</Label>
                         <Select onValueChange={handleSponsorSelect}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a sponsor..." />
                            </SelectTrigger>
                            <SelectContent>
                              <ScrollArea className='h-60'>
                                {allDistributors?.sort((a,b) => a.name.localeCompare(b.name)).map(d => (
                                    <SelectItem key={d.id} value={d.id}>
                                      <div className='flex items-center gap-2'>
                                        <Avatar className='h-6 w-6'>
                                          <AvatarImage src={d.avatarUrl} />
                                          <AvatarFallback>{d.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{d.name}</span>
                                      </div>
                                    </SelectItem>
                                ))}
                              </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEnrollOpen(false)}>Cancel</Button>
                    <Button onClick={handleEnrollDistributor}>Enroll Distributor</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Button asChild variant="outline">
          <Link href="/admin/library">
            <Library className="mr-2 h-4 w-4" /> Manage Assets
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Trees className="mr-2 h-4 w-4" />
            View Tree
          </Link>
        </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4 p-4 border rounded-lg bg-card">
        <Input 
          placeholder="Filter by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="max-w-xs"
        />
        <Select value={rankFilter} onValueChange={(value) => setRankFilter(value as DistributorRank | 'all')}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by rank..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ranks</SelectItem>
            {rankOptions.map(rank => (
              <SelectItem key={rank} value={rank}>{rank}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFiltering && (
            <Button variant="ghost" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
            </Button>
        )}
      </div>

      <div className="border rounded-lg bg-card p-4">
        {filteredTree ? (
            <div className="folder-tree">
                <DistributorHierarchyRow distributor={filteredTree} level={0} isLastChild={true} />
            </div>
        ) : (
            <div className="text-center h-24 flex items-center justify-center text-muted-foreground">
                No distributors found matching filters.
            </div>
        )}
      </div>
    </>
  );
}
