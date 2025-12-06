'use client';

import type { Distributor, DistributorRank } from '@/lib/types';
import { useState, useRef, useMemo } from 'react';
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
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ChevronDown, ChevronRight, Pencil, Trash2, ImageUp, KeyRound, RefreshCcw, LayoutDashboard, Users } from 'lucide-react';
import { RankBadge } from './rank-badge';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/hooks/use-admin';
import { sendPasswordResetEmail } from 'firebase/auth';
import { customAlphabet } from 'nanoid';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

const rankOptions: DistributorRank[] = ['LV0', 'LV1', 'LV2', 'LV3', 'LV4', 'LV5', 'LV6', 'LV7', 'LV8', 'LV9', 'LV10', 'LV11', 'LV12'];

export function DistributorHierarchyRow({ 
    distributor, 
    level, 
    isLastChild, 
    showAdminControls = true 
}: { 
    distributor: Distributor, 
    level: number, 
    isLastChild: boolean,
    showAdminControls?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedDistributor, setEditedDistributor] = useState<Partial<Distributor>>(distributor);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(distributor.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getDownline, allDistributors } = useGenealogyTree();
  const { firestore, auth } = useFirebase();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  
  const hasChildren = distributor.children && distributor.children.length > 0;
  const downlineCount = getDownline(distributor.id).length;

  const sponsorOptions = useMemo(() => {
    if (!allDistributors) return [];
    // Exclude the current distributor and their entire downline from being a potential sponsor
    const downlineIds = new Set(getDownline(distributor.id).map(d => d.id));
    downlineIds.add(distributor.id);
    return allDistributors.filter(d => !downlineIds.has(d.id));
  }, [allDistributors, distributor.id, getDownline]);

  const handleDeleteDistributor = () => {
    if (!firestore || !isAdmin) return;
    deleteDocumentNonBlocking(doc(firestore, "distributors", distributor.id));
    toast({
        title: "Distributor Deletion Initiated",
        description: `${distributor.name} is being removed from the system.`,
    });
  };

  const handleUpdateDistributor = () => {
    if (!firestore || !isAdmin) return;
    const { id, children, ...updateData } = editedDistributor; // Exclude non-serializable fields
    // Also update placementId when parentId changes
    if (updateData.parentId && updateData.parentId !== distributor.parentId) {
        updateData.placementId = updateData.parentId;
    }
    updateDocumentNonBlocking(doc(firestore, "distributors", distributor.id), updateData);
    toast({
        title: "Update Successful",
        description: `${distributor.name}'s information has been updated.`,
    });
    setIsEditDialogOpen(false);
  }

  const handlePasswordReset = async () => {
    if (!auth || !distributor.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User email is not available to send a password reset.',
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, distributor.email);
      toast({
        title: 'Password Reset Email Sent',
        description: `An email has been sent to ${distributor.email} with instructions to reset their password.`,
      });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Send Email',
        description: error.message || 'An unknown error occurred.',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedDistributor({ ...editedDistributor, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (name: keyof Distributor) => (value: string) => {
    setEditedDistributor({ ...editedDistributor, [name]: value });
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditedDistributor(prev => ({ ...prev, avatarUrl: result }));
        setPreviewAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateReferralCode = () => {
    const newCode = nanoid();
    setEditedDistributor({...editedDistributor, referralCode: newCode });
    toast({ title: 'New Code Generated', description: `Click "Save Changes" to apply.`});
  }

  const handleOpenEditDialog = () => {
    setEditedDistributor(distributor);
    setPreviewAvatar(distributor.avatarUrl);
    setIsEditDialogOpen(true);
  }

  return (
    <div className={cn("tree-item", isLastChild && 'is-last')}>
      <div className="tree-item-content p-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 w-full">
            <div className="flex items-center gap-2 w-full flex-1">
                {hasChildren && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                )}
                <div className={cn("flex flex-1 items-center gap-2", !hasChildren && 'ml-10')}>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={distributor.avatarUrl} alt={distributor.name} data-ai-hint="person face" />
                        <AvatarFallback>{distributor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <span className="font-medium">{distributor.name}</span>
                        <div className="flex items-center gap-2">
                            <RankBadge rank={distributor.rank} />
                            <div className="text-sm text-muted-foreground">
                                {downlineCount} downline
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {isAdmin && showAdminControls && (
                <div className="flex flex-wrap gap-1 self-start sm:self-center ml-10 sm:ml-0">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/${distributor.id}`}>
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="sr-only">View Dashboard</span>
                        </Link>
                    </Button>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleOpenEditDialog}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit Distributor</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                            <DialogTitle>Edit Distributor</DialogTitle>
                            <DialogDescription>
                                Update the details for {distributor.name}.
                            </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[70vh] pr-4">
                            <div className="grid gap-4 py-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={previewAvatar ?? `https://picsum.photos/seed/${distributor.id}/200`} alt="Distributor avatar" data-ai-hint="person face" />
                                        <AvatarFallback>{distributor.name.charAt(0)}</AvatarFallback>
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
                                    <Input id="name" name="name" value={editedDistributor.name || ''} onChange={handleInputChange} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <Input id="email" name="email" type="email" value={editedDistributor.email || ''} onChange={handleInputChange} className="col-span-3" readOnly />
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
                                        <SelectItem value="funded">Funded</SelectItem>
                                        <SelectItem value="not-funded">Not Funded</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="parentId" className="text-right flex items-center gap-1"><Users className="h-3 w-3" /> Sponsor</Label>
                                    <Select name="parentId" value={editedDistributor.parentId || ''} onValueChange={handleSelectChange('parentId')}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select new sponsor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <ScrollArea className="h-60">
                                                {sponsorOptions.map(d => (
                                                    <SelectItem key={d.id} value={d.id}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="referralCode" className="text-right">Referral Code</Label>
                                    <div className="col-span-3 flex items-center gap-2">
                                    <Input id="referralCode" name="referralCode" value={editedDistributor.referralCode || ''} onChange={handleInputChange} />
                                    <Button variant="outline" size="icon" onClick={handleGenerateReferralCode} aria-label="Generate new code">
                                        <RefreshCcw className="h-4 w-4" />
                                    </Button>
                                    </div>
                                </div>
                            </div>
                            </ScrollArea>
                            <DialogFooter className="sm:justify-between pt-4">
                            <Button variant="outline" onClick={handlePasswordReset}>
                                <KeyRound className="mr-2 h-4 w-4" />
                                Send Password Reset
                                </Button>
                                <div>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="mr-2">Cancel</Button>
                                <Button onClick={handleUpdateDistributor}>Save Changes</Button>
                                </div>
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
                </div>
            )}
        </div>
      </div>
       {isExpanded && hasChildren && (
        <div className="tree-children">
          {distributor.children.map((child, index) => (
            <DistributorHierarchyRow 
                key={child.id} 
                distributor={child} 
                level={level + 1}
                isLastChild={index === distributor.children.length - 1}
                showAdminControls={showAdminControls}
            />
          ))}
        </div>
      )}
    </div>
  );
}
