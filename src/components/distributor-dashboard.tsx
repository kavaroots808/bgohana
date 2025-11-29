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

const chartData = [
  { month: "January", gv: 186 },
  { month: "February", gv: 305 },
  { month: "March", gv: 237 },
  { month: "April", gv: 73 },
  { month: "May", gv: 209 },
  { month: "June", gv: 214 },
].map(item => ({ ...item, gv: item.gv * 100 }));


const chartConfig = {
  gv: {
    label: "Group Volume",
    color: "hsl(var(--primary))",
  },
};

export function DistributorDashboard({ distributor }: { distributor: Distributor }) {
  const downline = genealogyManager.getDownline(distributor.id);
  const totalGV = downline.reduce((sum, d) => sum + d.personalVolume, distributor.personalVolume);
  const totalDistributors = downline.length;
  const activeDistributors = downline.filter(d => d.status === 'active').length;
  const totalCommissions = downline.reduce((sum, d) => sum + d.commissions, distributor.commissions);

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Group Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGV.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Includes personal volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Includes downline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downline Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDistributors}</div>
            <p className="text-xs text-muted-foreground">In entire downline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Distributors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDistributors}</div>
            <p className="text-xs text-muted-foreground">
                {totalDistributors > 0 ? ((activeDistributors / totalDistributors) * 100).toFixed(0) : 0}% of downline
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>Downline Team Members</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
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
        <Card className="col-span-12 lg:col-span-3">
          <CardHeader>
            <CardTitle>Group Volume Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="w-full h-72">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickFormatter={(value) => `${Number(value) / 1000}k`}
                  />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="gv" fill="var(--color-gv)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
