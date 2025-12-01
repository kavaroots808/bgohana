'use client';

import type { Distributor, DistributorRank } from '@/lib/types';
import { useState } from 'react';
import {
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ChevronDown, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { RankBadge } from './rank-badge';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import { cn } from '@/lib/utils';

const rankOptions: DistributorRank[] = ['LV0', 'LV1', 'LV2', 'LV3', 'LV4', 'LV5', 'LV6', 'LV7', 'LV8', 'LV9', 'LV10', 'LV11', 'LV12'];


export function DistributorHierarchyRow({ distributor, level }: { distributor: Distributor, level: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedDistributor, setEditedDistributor] = useState<Partial<Distributor>>(distributor);
  const { getDownline } = useGenealogyTree();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const hasChildren = distributor.children && distributor.children.length > 0;
  const downlineCount = getDownline(distributor.id).length;

  const handleDeleteDistributor = () => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, "distributors", distributor.id));
    toast({
        title: "Distributor Deletion Initiated",
        description: `${distributor.name} is being removed from the system.`,
    });
  };

  const handleUpdateDistributor = () => {
    if (!firestore) return;
    const { id, children, ...updateData } = editedDistributor; // Exclude non-serializable fields
    updateDocumentNonBlocking(doc(firestore, "distributors", distributor.id), updateData);
    toast({
        title: "Update Successful",
        description: `${distributor.name}'s information has been updated.`,
    });
    setIsEditDialogOpen(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedDistributor({ ...editedDistributor, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (name: keyof Distributor) => (value: string) => {
    setEditedDistributor({ ...editedDistributor, [name]: value });
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
            {hasChildren && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
            <Avatar className={cn("h-8 w-8", !hasChildren && "ml-10")}>
              <AvatarImage src={distributor.avatarUrl} alt={distributor.name} data-ai-hint="person face" />
              <AvatarFallback>{distributor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{distributor.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <RankBadge rank={distributor.rank} />
        </TableCell>
        <TableCell className="text-right">
          {downlineCount}
        </TableCell>
        <TableCell className="text-right space-x-1">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit Distributor</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Distributor</DialogTitle>
                <DialogDescription>
                  Update the details for {distributor.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" value={editedDistributor.name || ''} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" name="email" type="email" value={editedDistributor.email || ''} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rank" className="text-right">Rank</Label>
                  <Select name="rank" value={editedDistributor.rank} onValueChange={handleSelectChange('rank')}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                    <SelectContent>
                      {rankOptions.map(rank => (
                        <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                  <Select name="status" value={editedDistributor.status} onValueChange={handleSelectChange('status')}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateDistributor}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete Distributor</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the distributor account for <span className="font-semibold">{distributor.name}</span> and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteDistributor}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TableCell>
      </TableRow>
      {isExpanded && hasChildren && distributor.children.map(child => (
        <DistributorHierarchyRow key={child.id} distributor={child} level={level + 1} />
      ))}
    </>
  );
}
