import type { Distributor, NewDistributorData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, ImageUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RankBadge } from './rank-badge';
import React from 'react';
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
import { genealogyManager } from '@/lib/data';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const defaultNewDistributor: NewDistributorData = {
  name: '',
  email: '',
  personalVolume: 0,
  avatarUrl: ''
};

const levelRequirements = [
    { level: 'LV0', requirement: '0 ≤ N < 5' },
    { level: 'LV1', requirement: '5 ≤ N < 30' },
    { level: 'LV2', requirement: '30 ≤ N < 100' },
    { level: 'LV3', requirement: '100 ≤ N < 300' },
    { level: 'LV4', requirement: '300 ≤ N < 600' },
    { level: 'LV5', requirement: '600 ≤ N < 1000' },
    { level: 'LV6', requirement: '1000 ≤ N < 1500' },
    { level: 'LV7', requirement: '1500 ≤ N < 2500' },
    { level: 'LV8', requirement: '2500 ≤ N < 5000' },
    { level: 'LV9', requirement: 'N ≥ 5000' },
];

export function DistributorCard({ 
  distributor,
  onAddChild
}: { 
  distributor: Distributor, 
  onAddChild: (childData: NewDistributorData) => void;
}) {
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [newDistributorData, setNewDistributorData] = useState<NewDistributorData>(defaultNewDistributor);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      setIsEnrollOpen(false);
    } else {
        toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Please enter a name for the new distributor.',
        });
    }
  };

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
                        <h3 className="font-semibold text-base mb-2">Invitation Instructions</h3>
                        <p className='text-muted-foreground'>Enter the 'Invitation Center', copy the invitation link or invitation code, and share it with your friends. Friends can become your subordinates by registering with your invitation code.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-base mb-2">Earn rebates</h3>
                        <p className='text-muted-foreground'>When subordinates trade, you can get corresponding rebates, which supports up to three levels of subordinates. For example, you invited friend A, A invited B, and B invited C. Then A, B, and C can get corresponding rebates when they trade contracts on the platform.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-base mb-2">Team level</h3>
                        <p className='text-muted-foreground'>The more first-level subordinates you promote, the higher the team level, and the higher the rebate you can enjoy. The team level is divided into LV0-LV9. The upgrade rules are shown in the following table, where 'N' is the number of first-level subordinates.</p>
                        <Table className="mt-2">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Team Level</TableHead>
                                    <TableHead>Requirement (N)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {levelRequirements.map(req => (
                                    <TableRow key={req.level}>
                                        <TableCell className="font-medium">{req.level}</TableCell>
                                        <TableCell>{req.requirement}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <p className='text-muted-foreground mt-2'>When subordinates trade delivery contracts, you can get rebates corresponding to their transaction amount.</p>
                    </div>
                  </div>
                  </ScrollArea>
              </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {distributor.canRecruit && (
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
                    </div>
                    <Button onClick={handleAddChild} className="w-full">Enroll Distributor</Button>
                </DialogContent>
            </Dialog>
          )}
        </CardContent>
    </Card>
  );
}

    