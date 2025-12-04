
'use client';
import type { Distributor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trees, Calculator, Copy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RankBadge } from './rank-badge';
import { CoachingTips } from './coaching-tips';
import type { CoachingTipsInput } from '@/ai/schemas/coaching-schemas';
import { Button } from './ui/button';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { CompoundInterestCalculator } from './compound-interest-calculator';
import { ScrollArea } from './ui/scroll-area';
import { useGenealogyTree } from '@/hooks/use-genealogy-tree';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function DistributorDashboard({ distributor }: { distributor: Distributor }) {
  const { getDownline } = useGenealogyTree();
  const { toast } = useToast();
  const downline = getDownline(distributor.id);
  
  const coachingInput: CoachingTipsInput = {
    distributor: {
        rank: distributor.rank,
        personalVolume: distributor.personalVolume,
        groupVolume: downline.length,
        recruits: distributor.recruits,
        canRecruit: distributor.status === 'funded'
    },
    // This part can be enhanced to get actual next rank requirements
    nextRankRequirements: {
        rank: "LV1",
        personalVolume: 500,
        groupVolume: 2500,
    }
  }
  
  const copyReferralCode = () => {
    navigator.clipboard.writeText(distributor.referralCode);
    toast({
        title: "Referral Code Copied!",
        description: "Your code is ready to be shared with new recruits."
    })
  }

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
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Calculator className="mr-2 h-4 w-4" /> Compound Interest Calculator
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                   <DialogHeader>
                        <DialogTitle>Compound Interest Calculator</DialogTitle>
                    </DialogHeader>
                    <CompoundInterestCalculator />
                </DialogContent>
            </Dialog>
            <Button asChild className="w-full">
                <Link href="/">
                    <Trees className="mr-2 h-4 w-4" />
                    Back to Tree
                </Link>
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Referral Code</CardTitle>
                </CardHeader>
                <CardContent>
                    <Label htmlFor='referral-code'>Share this code with new recruits</Label>
                    <div className="flex space-x-2 mt-2">
                        <Input id="referral-code" value={distributor.referralCode} readOnly />
                        <Button variant="outline" size="icon" onClick={copyReferralCode}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Downline Team Members</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        You have <span className="font-bold text-accent">{downline.length}</span> members in your team.
                    </p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                      <Table>
                          <TableHeader>
                              <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Rank</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {downline.map((d) => (
                              <TableRow key={d.id}>
                                  <TableCell className="font-medium flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                          <AvatarImage src={d.avatarUrl} alt={d.name} data-ai-hint="person face" />
                                          <AvatarFallback>{d.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      {d.name}
                                  </TableCell>
                                  <TableCell>
                                      <RankBadge rank={d.rank} />
                                  </TableCell>
                              </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                      {downline.length === 0 && <p className='text-center text-muted-foreground py-8'>No distributors in this downline.</p>}
                  </ScrollArea>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Analysis & Recommendations</CardTitle>
                </CardHeader>
                 <CardContent>
                    <CoachingTips input={coachingInput} />
                 </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
