
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RankBadge } from '@/components/rank-badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trees, Trash2 } from 'lucide-react';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import Link from 'next/link';
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
import { doc, deleteDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';


export function AdminDashboard() {
  const { allDistributors, loading, getDownline } = useGenealogyTree();
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const handleDeleteDistributor = async (distributorId: string, distributorName: string) => {
    if (!firestore) return;

    try {
        await deleteDoc(doc(firestore, "distributors", distributorId));
        toast({
            title: "Distributor Deleted",
            description: `${distributorName} has been removed from the system.`,
        });
        // The real-time listener in useGenealogyTree will update the UI automatically.
    } catch (error) {
        console.error("Error deleting distributor:", error);
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: "Could not remove the distributor. See console for details.",
        });
    }
  };


  if (loading || !allDistributors) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <main className="flex-1 flex items-center justify-center">
          <p>Loading distributor data...</p>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Backend</h1>
          <p className="text-muted-foreground">
            Manage distributors and system settings.
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <Trees className="mr-2 h-4 w-4" />
            View Genealogy Tree
          </Link>
        </Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead className="text-right">Downline</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allDistributors.map((distributor) => (
              <TableRow key={distributor.id}>
                <TableCell className="font-medium">
                  {distributor.name}
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
                            This action cannot be undone. This will permanently delete the distributor account for <span className="font-semibold">{distributor.name}</span> and remove all of their associated data.
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
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
