import type { Distributor, NewDistributorData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Users, TrendingUp, Calendar, UserCheck, UserPlus, ShoppingCart, GitBranch, ImageUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientOnly } from '@/components/client-only';
import { RankBadge } from './rank-badge';
import React from 'react';
import { genealogyManager } from '@/lib/data';
import type { CoachingTipsInput } from '@/ai/schemas/coaching-schemas';
import { CoachingTips } from './coaching-tips';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CustomerList } from './customer-list';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const defaultNewDistributor: NewDistributorData = {
  name: '',
  email: '',
  personalVolume: 0,
  avatarUrl: ''
};

export function DistributorCard({ 
  distributor,
  onAddChild
}: { 
  distributor: Distributor, 
  onAddChild: (childData: NewDistributorData) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newDistributorData, setNewDistributorData] = useState<NewDistributorData>(defaultNewDistributor);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const nextRank = genealogyManager.getNextRank(distributor.rank);
  const coachingInput: CoachingTipsInput | null = nextRank ? {
    distributor,
    nextRankRequirements: {
      rank: nextRank.rank,
      personalVolume: nextRank.rules.personalVolume,
      groupVolume: nextRank.rules.groupVolume,
    }
  } : { distributor };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setNewDistributorData(prev => ({
        ...prev,
        [id]: type === 'number' ? parseFloat(value) || 0 : value
    }));
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

  const handleAddChild = () => {
    if (newDistributorData.name.trim()) {
      onAddChild(newDistributorData);
      toast({
          title: "Distributor Enrolled!",
          description: `${newDistributorData.name.trim()} has been added to your downline.`,
      });
      setNewDistributorData(defaultNewDistributor);
      setPreviewAvatar(null);
      setIsOpen(false);
    } else {
        toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Please enter a name for the new distributor.',
        });
    }
  };


  const CardContentDetails = () => (
    <>
      <div className="space-y-2 text-sm text-card-foreground/80">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span>Group Volume: <strong className="text-card-foreground">{distributor.groupVolume.toLocaleString()}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-accent" />
          <span>Personal Volume: <strong className="text-card-foreground">{distributor.personalVolume.toLocaleString()}</strong></span>
        </div>
        {distributor.generationalVolume.length > 0 && (
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-accent" />
            <div className="flex flex-wrap gap-x-2 items-center">
              <span>Generations:</span>
              {distributor.generationalVolume.map((vol, i) => (
                <span key={i}><strong className="text-card-foreground">{i + 1}:</strong> {vol.toLocaleString()}</span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-accent" />
          <span>Recruits: <strong className="text-card-foreground">{distributor.recruits}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-accent" />
          <span>Commissions: <strong className="text-card-foreground">${distributor.commissions.toLocaleString()}</strong></span>
        </div>
        {distributor.canRecruit && (
          <div className="flex items-center gap-2 pt-1 text-green-600">
              <UserPlus className="w-4 h-4" />
              <span>Recruiting eligible</span>
          </div>
        )}
      </div>
       {coachingInput && <CoachingTips input={coachingInput} />}
      <div className="flex justify-between text-xs text-muted-foreground pt-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <ClientOnly>
            <span>Joined: {new Date(distributor.joinDate).toLocaleDateString()}</span>
          </ClientOnly>
        </div>
      </div>
    </>
  );

  return (
    <Card className="w-80 shadow-lg">
       <CardHeader className="flex flex-row items-start gap-4 pb-3">
          <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={distributor.avatarUrl} alt={distributor.name} data-ai-hint="person face" />
              <AvatarFallback>{distributor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{distributor.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge variant={distributor.status === 'active' ? 'default' : 'destructive'} className={cn(
                "mt-1",
                distributor.status === 'active' ? 'bg-accent text-accent-foreground' : ''
              )}>
                {distributor.status}
              </Badge>
              <RankBadge rank={distributor.rank} className="mt-1" />
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue="details" className="py-4">
              <div className='flex justify-center'>
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="customers">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Customers ({distributor.customers.length})
                    </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="details">
                <CardContentDetails />
              </TabsContent>
              <TabsContent value="customers">
                <CustomerList customers={distributor.customers} />
              </TabsContent>
          </Tabs>
          {distributor.canRecruit && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full mt-4">
                        <UserPlus className="mr-2 h-4 w-4" /> Enroll New Distributor
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Enroll New Distributor</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new distributor to add them to your downline.
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
                            <Label htmlFor="personalVolume" className="text-right">Initial PV</Label>
                            <Input id="personalVolume" value={newDistributorData.personalVolume} onChange={handleInputChange} className="col-span-3" type="number" />
                        </div>
                    </div>
                    <Button onClick={handleAddChild} className="w-full">Enroll Distributor</Button>
                </DialogContent>
            </Dialog>
          )}
        </CardContent>
    </Card>
  );
}
