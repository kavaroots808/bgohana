import type { Distributor, NewDistributorData, DistributorRank } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, ImageUp, Info, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RankBadge } from './rank-badge';
import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { genealogyManager } from '@/lib/data';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useAdmin } from '@/hooks/use-admin';

const defaultNewDistributor: NewDistributorData = {
  name: '',
  email: '',
  personalVolume: 0,
  avatarUrl: ''
};

const levelRequirements = [
    { level: 'LV1', teamSize: '5 direct reports', bonus: '0.50%', salary: '30', reward: '100' },
    { level: 'LV2', teamSize: '2 direct LV1/25 team members', bonus: '1.00%', salary: '150', reward: '300' },
    { level: 'LV3', teamSize: '3 direct LV1/125 team members', bonus: '2.00%', salary: '500', reward: '800' },
    { level: 'LV4', teamSize: '4 direct LV1/500 team members', bonus: '2.50%', salary: '1200', reward: '2000' },
    { level: 'LV5', teamSize: '5 direct LV1/1000 team members', bonus: '3.00%', salary: '2400', reward: '5000' },
    { level: 'LV6', teamSize: '6 direct LV1/2000 team members', bonus: '3.50%', salary: '5000', reward: '12000' },
    { level: 'LV7', teamSize: '7 direct LV1/5000 team members', bonus: '4.00%', salary: '10000', reward: '25000' },
];

const rankOrder: DistributorRank[] = ['LV0', 'LV1', 'LV2', 'LV3', 'LV4', 'LV5', 'LV6', 'LV7', 'LV8', 'LV9', 'LV10', 'LV11', 'LV12'];


export function DistributorCard({ 
  distributor,
  onAddChild
}: { 
  distributor: Distributor, 
  onAddChild: (childData: NewDistributorData) => void;
}) {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [newDistributorData, setNewDistributorData] = useState<NewDistributorData>(defaultNewDistributor);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previousRank, setPreviousRank] = useState(distributor.rank);
  const [showAdvancement, setShowAdvancement] = useState(false);

  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Gatekeeping removed for testing purposes. All details are visible.
  const canView = true;
  const canEnroll = (user?.uid === distributor.id || isAdmin) && distributor.canRecruit;

  useEffect(() => {
    const oldRankIndex = rankOrder.indexOf(previousRank);
    const newRankIndex = rankOrder.indexOf(distributor.rank);

    if (newRankIndex > oldRankIndex) {
      setShowAdvancement(true);
      const timer = setTimeout(() => setShowAdvancement(false), 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
    
    // Update previous rank if it changes for any reason (promotion or demotion)
    if (distributor.rank !== previousRank) {
        setPreviousRank(distributor.rank);
    }
  }, [distributor.rank, previousRank]);

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
          description: `${newDistributorData.name.trim()} has been added to ${distributor.name}'s downline.`,
      });
      setNewDistributorData(defaultNewDistributor);
      setPreviewAvatar(null);
      setIsEnrollOpen(false);
    } else {
        toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Please enter a name for the new distributor.',
        });
    }
  };

  if (!canView) {
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
                  <RankBadge rank={distributor.rank} className="mt-1" />
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground text-center">You do not have permission to view this distributor's details.</p>
            </CardContent>
        </Card>
      );
  }

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
          <Dialog>
              <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                      <Info className="h-5 w-5" />
                  </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                      <DialogTitle>Rules</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[70vh] pr-4">
                  <div className="space-y-4 py-4 text-sm">
                    <div>
                        <h3 className="font-semibold text-base mb-2">Team Level Requirements</h3>
                        <Table className="mt-2">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Team Size</TableHead>
                                    <TableHead>Bonus</TableHead>
                                    <TableHead>Salary</TableHead>
                                    <TableHead>Reward</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {levelRequirements.map(req => (
                                    <TableRow key={req.level}>
                                        <TableCell className="font-medium">{req.level}</TableCell>
                                        <TableCell>{req.teamSize}</TableCell>
                                        <TableCell>{req.bonus}</TableCell>
                                        <TableCell>{req.salary}</TableCell>
                                        <TableCell>{req.reward}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                  </div>
                  </ScrollArea>
              </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
            {showAdvancement && (
                <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
                    <PartyPopper className="h-4 w-4 !text-green-600" />
                    <AlertTitle className="font-bold">Rank Up!</AlertTitle>
                    <AlertDescription>
                        Congratulations! You've been promoted to <span className='font-semibold'>{distributor.rank}</span>.
                    </AlertDescription>
                </Alert>
            )}
          {canEnroll && (
            <Dialog open={isEnrollOpen} onOpenChange={setIsEnrollOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" /> Enroll New Distributor
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>Enroll New Distributor</DialogTitle>
                        <DialogDescription>
                            Enter the details for the new distributor to add them to {distributor.name}'s downline.
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
                    </div>
                    <Button onClick={handleAddChild} className="w-full">Enroll Distributor</Button>
                </DialogContent>
            </Dialog>
          )}
        </CardContent>
    </Card>
  );
}
