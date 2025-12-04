
'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useCollection, useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Distributor } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { AuthProvider } from '@/hooks/use-auth';

function SelectSponsorContent() {
  const { firestore } = useFirebase();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const distributorsQuery = useCollection<Distributor>(collection(firestore, 'distributors'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSponsor, setSelectedSponsor] = useState<Distributor | null>(null);

  const filteredDistributors = distributorsQuery.data?.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) && d.id !== user?.uid
  ) || [];

  const handleSelectSponsor = () => {
    if (!user || !selectedSponsor || !firestore) return;
    
    const userDocRef = doc(firestore, 'distributors', user.uid);
    const updateData = {
      parentId: selectedSponsor.id,
      placementId: selectedSponsor.id,
      sponsorSelected: true,
    };
    
    // Use non-blocking update with contextual error handling
    updateDocumentNonBlocking(userDocRef, updateData);

    toast({
      title: "Sponsor Selected!",
      description: `You have selected ${selectedSponsor.name} as your sponsor.`,
    });
    router.push('/');
  };

  if (distributorsQuery.isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading potential sponsors...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Select Your Sponsor</CardTitle>
          <CardDescription>Choose the person who introduced you to the business.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search for a sponsor by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-72">
            <div className="space-y-2">
              {filteredDistributors.map(d => (
                <div
                  key={d.id}
                  onClick={() => setSelectedSponsor(d)}
                  className={`flex items-center gap-3 rounded-md p-2 cursor-pointer transition-colors ${
                    selectedSponsor?.id === d.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={d.avatarUrl} alt={d.name} data-ai-hint="person face" />
                    <AvatarFallback>{d.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{d.name}</p>
                    <p className={`text-sm ${selectedSponsor?.id === d.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{d.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button
            onClick={handleSelectSponsor}
            disabled={!selectedSponsor}
            className="w-full mt-6"
          >
            Confirm Sponsor
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
