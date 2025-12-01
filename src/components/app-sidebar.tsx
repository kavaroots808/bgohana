
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp } from "lucide-react";
import { useGenealogyTree } from "@/hooks/use-genealogy-tree";

export function AppSidebar() {
    const { allDistributors, loading } = useGenealogyTree();

    if (loading || !allDistributors || allDistributors.length === 0) {
        return (
            <div className="h-full flex flex-col bg-card p-4">
                <h2 className="text-lg font-semibold tracking-tight">Top Performers</h2>
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        )
    }

    // Sort distributors by commissions, providing a fallback for undefined values.
    const sortedDistributors = [...allDistributors].sort((a,b) => (b.commissions || 0) - (a.commissions || 0));

    return (
        <div className="h-full flex flex-col bg-card">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold tracking-tight">Top Performers</h2>
                <p className="text-sm text-muted-foreground">Sorted by Commission</p>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {sortedDistributors.map((distributor) => (
                        <div key={distributor.id} className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer">
                            <Avatar className="h-10 w-10 border-2 border-primary/50">
                                <AvatarImage src={distributor.avatarUrl} alt={distributor.name} data-ai-hint="person face" />
                                <AvatarFallback>{distributor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-medium flex items-center gap-2 truncate">
                                    {distributor.name}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    ${(distributor.commissions || 0).toLocaleString()} earned
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
