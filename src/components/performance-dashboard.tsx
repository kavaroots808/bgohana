'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, UserCheck, Star, Shield, Trophy, Diamond } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { allDistributors, genealogyManager } from "@/lib/data";
import { DistributorRank } from "@/lib/types";

const chartData = [
  { month: "January", gv: 18600 },
  { month: "February", gv: 30500 },
  { month: "March", gv: 23700 },
  { month: "April", gv: 7300 },
  { month: "May", gv: 20900 },
  { month: "June", gv: 21400 },
];

const chartConfig = {
  gv: {
    label: "Group Volume",
    color: "hsl(var(--primary))",
  },
};

const rankIcons: Record<DistributorRank, React.ElementType> = {
    'Distributor': Star,
    'Manager': Shield,
    'Director': Trophy,
    'Presidential': Diamond,
};

export function PerformanceDashboard() {
  const totalGV = genealogyManager.root?.groupVolume ?? 0;
  const totalDistributors = allDistributors.length;
  const activeDistributors = allDistributors.filter(d => d.status === 'active').length;
  const totalCommissions = allDistributors.reduce((sum, d) => sum + d.commissions, 0);

  const rankCounts = allDistributors.reduce((acc, distributor) => {
    acc[distributor.rank] = (acc[distributor.rank] || 0) + 1;
    return acc;
  }, {} as Record<DistributorRank, number>);


  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Group Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGV.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across the entire organization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCommissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This is an estimated value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDistributors}</div>
            <p className="text-xs text-muted-foreground">In your entire downline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Distributors</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDistributors}</div>
            <p className="text-xs text-muted-foreground">{((activeDistributors / totalDistributors) * 100).toFixed(0)}% of total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>Group Volume Overview</CardTitle>
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

        <Card className="col-span-12 lg:col-span-3">
          <CardHeader>
            <CardTitle>Rank Distribution</CardTitle>
            <p className="text-sm text-muted-foreground pt-1">A breakdown of distributor ranks.</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            {(Object.keys(rankCounts) as DistributorRank[]).sort((a,b) => {
                const ranks: DistributorRank[] = ['Presidential', 'Director', 'Manager', 'Distributor'];
                return ranks.indexOf(a) - ranks.indexOf(b);
            }).map(rank => {
                if (!rankCounts[rank]) return null;
                const Icon = rankIcons[rank];
                return (
                    <div key={rank} className="flex items-center">
                        <Icon className="h-5 w-5 text-muted-foreground mr-3" />
                        <div className="flex-1">
                            <p className="text-sm font-medium leading-none">{rank}</p>
                            <p className="text-sm text-muted-foreground">{rankCounts[rank]} distributors</p>
                        </div>
                        <div className="font-medium">
                            {((rankCounts[rank] / totalDistributors) * 100).toFixed(1)}%
                        </div>
                    </div>
                )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
