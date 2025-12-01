'use client';

import type { Distributor } from '@/lib/types';
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
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { RankBadge } from './rank-badge';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import { cn } from '@/lib/utils';

export function DistributorHierarchyRow({ distributor, level }: { distributor: Distributor, level: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first few levels
  const { getDownline } = useGenealogyTree();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  
  const hasChildren = distributor.children && distributor.children.length > 0;

  const handleDeleteDistributor = (distributorId: string, distributorName: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, "distributors", distributorId));
    toast({
        title: "Distributor Deletion Initiated",
        description: `${distributorName} is being removed from the system.`,
    });
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
              <AvatarImage src={distributor.avatarUrl} alt={distributor.name} />
              <AvatarFallback>{distributor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{distributor.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <RankBadge rank={distributor.rank} />
        </TableCell>
        <TableCell className="text-right">
          {getDownline(distributor.id).length}
        </TableCell>
        <TableCell className="text-right">
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
                  onClick={() => handleDeleteDistributor(distributor.id, distributor.name)}
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
