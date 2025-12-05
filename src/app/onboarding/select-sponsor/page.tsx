
'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, where, getDocs } from 'firebase/firestore';
import type { Distributor } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AuthProvider } from '@/hooks/use-auth';
import { KeyRound } from 'lucide-react';

function SelectSponsorContent() {
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmSponsor = async () => {
    if (!user || !firestore || !referralCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'Please enter a valid referral code.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const distributorsRef = collection(firestore, 'distributors');
      const q = query(distributorsRef, where('referralCode', '==', referralCode.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Sponsor Not Found',
          description: 'No distributor was found with that referral code. Please check the code and try again.',
        });
        setIsLoading(false);
        return;
      }

      const sponsor = querySnapshot.docs[0].data() as Distributor;
      
      if (sponsor.id === user.uid) {
         toast({
          variant: 'destructive',
          title: 'Invalid Sponsor',
          description: 'You cannot use your own referral code.',
        });
        setIsLoading(false);
        return;
      }

      const userDocRef = doc(firestore, 'distributors', user.uid);
      // In a real application, placement logic might be more complex.
      // Here, we'll place them directly under their sponsor.
      const updateData = {
        parentId: sponsor.id,
        placementId: sponsor.id, // Simple placement for now
        sponsorSelected: true,
      };

      updateDocumentNonBlocking(userDocRef, updateData);

      toast({
        title: 'Sponsor Confirmed!',
        description: `You have joined ${sponsor.name}'s team. Welcome aboard!`,
      });
      router.push('/');

    } catch (error) {
      console.error('Error finding sponsor:', error);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Could not confirm your sponsor at this time. Please try again.',
      });
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return <div className="flex h-screen items-center justify-center">Authenticating...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Enter Referral Code</CardTitle>
          <CardDescription>Enter the code provided by your sponsor to join their team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
             <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Sponsor's referral code..."
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="pl-10 text-lg"
            />
          </div>
          <Button
            onClick={handleConfirmSponsor}
            disabled={isLoading || !referralCode.trim()}
            className="w-full"
          >
            {isLoading ? 'Verifying...' : 'Join Team & Continue'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SelectSponsorPage() {
  return (
    <AuthProvider>
      <SelectSponsorContent />
    </AuthProvider>
  );
}
