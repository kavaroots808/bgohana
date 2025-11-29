'use client';
import type { Distributor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, UserCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { genealogyManager } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { RankBadge } from './rank-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from './ui/button';
import Link from 'next/link';
import { CoachingTips } from './coaching-tips';
import type { CoachingTipsInput } from '@/ai/schemas/coaching-schemas';


const chartConfig = {
  gv: {
    label: "Group Volume",
    color: "hsl(var(--primary))",
  },
};

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
                            <TableHead>Level</TableHead>
                            <TableHead className="text-right">PV</TableHead>
                            <TableHead className="text-right">GV</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                                <TableCell className="text-right">{d.personalVolume}</TableCell>
                                <TableCell className="text-right">{d.groupVolume}</TableCell>
                                <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/dashboard/${d.id}`}>View</Link>
                                </Button>
                                </TableCell>
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
