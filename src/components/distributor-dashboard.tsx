'use client';
import type { Distributor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trees } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { genealogyManager } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RankBadge } from './rank-badge';
import { CoachingTips } from './coaching-tips';
import type { CoachingTipsInput } from '@/ai/schemas/coaching-schemas';
import { Button } from './ui/button';
import Link from 'next/link';


export function DistributorDashboard({ distributor }: { distributor: Distributor }) {
  const downline = genealogyManager.getDownline(distributor.id);
  
  const coachingInput: CoachingTipsInput = {
    distributor: {
        rank: distributor.rank,
        personalVolume: distributor.personalVolume,
        groupVolume: distributor.groupVolume,
        recruits: distributor.recruits,
        canRecruit: distributor.canRecruit
    },
    // This part can be enhanced to get actual next rank requirements
    nextRankRequirements: {
        rank: "LV1",
        personalVolume: 500,
        groupVolume: 2500,
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-primary">
                <AvatarImage src={distributor.avatarUrl} alt={distributor.name} data-ai-hint="person face" />
                <AvatarFallback>{distributor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold">{distributor.name}'s Dashboard</h1>
                <div className="flex items-center gap-2 mt-1">
                    <RankBadge rank={distributor.rank} />
                    <span className="text-muted-foreground">{distributor.email}</span>
                </div>
            </div>
        </div>
        <Button asChild>
            <Link href="/">
                <Trees className="mr-2 h-4 w-4" />
                Back to Tree
            </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Downline Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Rank</TableHead>
                            <TableHead>Generation</TableHead>
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
                                <TableCell>{d.level - distributor.level}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {downline.length === 0 && <p className='text-center text-muted-foreground py-8'>No distributors in this downline.</p>}
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
