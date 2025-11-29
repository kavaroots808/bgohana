'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, UserCheck, Star, Shield, Trophy, Diamond } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { genealogyManager } from "@/lib/data";
import { DistributorRank } from "@/lib/types";
import { GrowthForecast } from "./growth-forecast";
import type { PredictionInput } from "@/ai/schemas/prediction-schemas";
import { useGenealogyTree } from "@/hooks/use-genealogy-tree";

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

export function PerformanceDashboard() {
  // Use the hook to ensure data is loaded from Firestore
  const { loading } = useGenealogyTree();
  
  // Data is now sourced from the singleton manager, which is populated by the hook
  const allDistributors = genealogyManager.allDistributorsList;
  const totalGV = genealogyManager.root?.groupVolume ?? 0;
  const totalDistributors = allDistributors.length;
  const activeDistributors = allDistributors.filter(d => d.status === 'active').length;
  const totalCommissions = allDistributors.reduce((sum, d) => sum + d.commissions, 0);

  const rankCounts = allDistributors.reduce((acc, distributor) => {
    acc[distributor.rank] = (acc[distributor.rank] || 0) + 1;
    return acc;
  }, {} as Record<DistributorRank, number>);

  const rootDistributor = genealogyManager.root;
  const predictionInput: PredictionInput | null = rootDistributor ? {
      distributorRank: rootDistributor.rank,
      downline: {
          totalCount: totalDistributors -1,
          activeCount: activeDistributors -1,
          rankCounts: {
              Manager: rankCounts['LV2'] ?? 0, // Assuming LV2 is Manager
              Director: rankCounts['LV4'] ?? 0, // Assuming LV4 is Director
              Presidential: rankCounts['LV6'] ?? 0, // Assuming LV6 is Presidential
          }
      },
      recentGV: chartData.map(d => ({ month: d.month, gv: d.gv }))
  } : null;

  if (loading) {
      return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Size</CardTitle>
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
            <p className="text-xs text-muted-foreground">
                {totalDistributors > 0 ? ((activeDistributors / totalDistributors) * 100).toFixed(0) : 0}% of total
            </p>
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
        {predictionInput && <GrowthForecast input={predictionInput} />}
      </div>
    </div>
  );
}
