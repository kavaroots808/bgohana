import { allDistributors } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, TrendingUp } from "lucide-react";

export function AppSidebar() {
    const sortedDistributors = [...allDistributors].sort((a,b) => b.groupVolume - a.groupVolume);

    return (
        <div className="h-full flex flex-col bg-card">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold tracking-tight">Top Performers</h2>
                <p className="text-sm text-muted-foreground">Sorted by Group Volume</p>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {sortedDistributors.map((distributor, index) => (
                        <div key={distributor.id} className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer">
                            <Avatar className="h-10 w-10 border-2 border-primary/50">
                                <AvatarImage src={distributor.avatarUrl} alt={distributor.name} data-ai-hint="person face" />
                                <AvatarFallback>{distributor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-medium flex items-center gap-2 truncate">
                                    {distributor.name}
                                    {index === 0 && <Crown className="w-4 h-4 text-yellow-500 shrink-0" />}
                                </p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {distributor.groupVolume.toLocaleString()} GV
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    )
}
