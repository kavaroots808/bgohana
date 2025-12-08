
'use client';
import { useState, useMemo, useRef } from 'react';
import type { Distributor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trees, Calculator, Copy, Edit, UserPlus, ImageUp, Library } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RankBadge } from './rank-badge';
import { Button } from './ui/button';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { CompoundInterestCalculator } from './compound-interest-calculator';
import { ScrollArea } from './ui/scroll-area';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DistributorHierarchyRow } from './distributor-hierarchy-row';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateEmail } from 'firebase/auth';

export function DistributorDashboard({ distributor }: { distributor: Distributor }) {
  const { getDownline, getDownlineTree } = useGenealogyTree();
  const { toast } = useToast();
  const { user, auth } = useAuth();
  const { firestore } = useFirebase();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editedDistributor, setEditedDistributor] = useState<Partial<Distributor>>({ ...distributor });
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(distributor.avatarUrl);

  const isOwnDashboard = user?.uid === distributor.id;
  
  const downlineCount = useMemo(() => getDownline(distributor.id).length, [getDownline, distributor.id]);
  const downlineTree = useMemo(() => getDownlineTree(distributor.id), [getDownlineTree, distributor.id]);

  const copyReferralCode = () => {
    if (!distributor.referralCode) return;
    navigator.clipboard.writeText(distributor.referralCode);
    toast({
        title: "Referral Code Copied!",
        description: "Your code is ready to be shared with new recruits."
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedDistributor(prev => ({ ...prev, [e.target.id]: e.target.value }));
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

  const handleSaveChanges = async () => {
    if (!firestore || !user || !isOwnDashboard || !auth) return;

    const userDocRef = doc(firestore, 'distributors', user.uid);
    const { id, children, email, ...updateData } = editedDistributor;

    try {
      // If email has been changed, update it in Firebase Auth first
      if (email && email !== distributor.email) {
        // IMPORTANT: This may require recent user sign-in. Firebase will throw an error
        // that you can catch to prompt the user to re-authenticate. For simplicity,
        // we are not handling re-authentication here, but it's crucial for a real app.
        await updateEmail(user, email);
        // Now update the email in Firestore as well
        updateData.email = email;
      }
      
      // Update the rest of the data in Firestore
      updateDocumentNonBlocking(userDocRef, updateData);
      
      toast({
        title: 'Profile Updated',
        description: 'Your changes have been successfully saved.',
      });
      setIsEditOpen(false);

    } catch (error: any) {
        console.error("Error updating profile:", error);
        toast({
            variant: "destructive",
            title: 'Update Failed',
            description: error.message || 'Could not update your profile. You may need to sign in again to change your email.',
        });
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-primary">
                <AvatarImage src={distributor.avatarUrl} alt={distributor.name} data-ai-hint="person face" />
                <AvatarFallback>{distributor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">{distributor.name}'s Dashboard</h1>
                <div className="flex items-center gap-2 mt-1">
                    <RankBadge rank={distributor.rank} />
                    <span className="text-muted-foreground break-all">{distributor.email}</span>
                </div>
            </div>
        </div>
        <div className="flex w-full md:w-auto flex-col sm:flex-row gap-2 shrink-0">
            {isOwnDashboard && (
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>Edit Your Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={previewAvatar ?? `https://picsum.photos/seed/${distributor.id}/200/200`} alt="Your avatar" data-ai-hint="person face" />
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
                      <Input id="name" value={editedDistributor.name || ''} onChange={handleInputChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input id="email" type="email" value={editedDistributor.email || ''} onChange={handleInputChange} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Button asChild variant="outline" className="w-full">
                <Link href="/library">
                    <Library className="mr-2 h-4 w-4" /> Asset Library
                </Link>
            </Button>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Calculator className="mr-2 h-4 w-4" /> Compound Interest Calculator
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                   <DialogHeader>
                        <DialogTitle>Compound Interest Calculator</DialogTitle>
                        <DialogDescription>Project your potential earnings based on compound interest.</DialogDescription>
                    </DialogHeader>
                    <CompoundInterestCalculator />
                </DialogContent>
            </Dialog>
            <Button asChild className="w-full">
                <Link href="/tree">
                    <Trees className="mr-2 h-4 w-4" />
                    Back to Tree
                </Link>
            </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Referral Code</CardTitle>
            </CardHeader>
            <CardContent>
                <Label htmlFor='referral-code'>Share this code with new recruits</Label>
                <div className="flex space-x-2 mt-2">
                    <Input id="referral-code" value={distributor.referralCode || 'Generating...'} readOnly />
                    <Button variant="outline" size="icon" onClick={copyReferralCode} disabled={!distributor.referralCode}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Downline Distributors</CardTitle>
                <p className="text-sm text-muted-foreground">
                    You have <span className="font-bold text-accent">{downlineCount}</span> distributors in your team.
                </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                 <div className="folder-tree p-2">
                  {downlineTree && downlineTree.length > 0 ? (
                    downlineTree.map((d, index) => (
                      <DistributorHierarchyRow 
                        key={d.id}
                        distributor={d}
                        level={0}
                        isLastChild={index === downlineTree.length - 1}
                        showAdminControls={false}
                      />
                    ))
                  ) : (
                    <p className='text-center text-muted-foreground py-8'>No distributors in this downline.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
