import type { Distributor, NewDistributorData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, ImageUp } from 'lucide-react';
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
