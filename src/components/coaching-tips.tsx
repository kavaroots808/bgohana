
'use client';
import { useEffect, useState } from 'react';
import type { CoachingTipsInput, CoachingTipsOutput } from '@/ai/schemas/coaching-schemas';
import { getCoachingTips } from '@/ai/flows/coaching-flow';
import { Lightbulb, AlertCircle } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function CoachingTips({ input }: { input: CoachingTipsInput }) {
  const [tips, setTips] = useState<CoachingTipsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getCoachingTips(input);
        setTips(result);
      } catch (error) {
        console.error("Error fetching coaching tips:", error);
        setError("Could not load AI coaching tips at this time. The service may be temporarily unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, [input]);

  return (
    <div className="space-y-3 pt-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            AI Coaching Corner
        </h3>
        {loading && (
            <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )}
        {!loading && error && (
             <div className="flex items-center gap-3 bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <div className='flex-1'>
                    <p className="text-xs">{error}</p>
                </div>
            </div>
        )}
        {!loading && !error && tips && tips.tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 bg-accent/20 p-3 rounded-lg">
                <span className="text-xl">{tip.emoji}</span>
                <div className='flex-1'>
                    <p className="font-semibold text-sm text-accent-foreground/90">{tip.title}</p>
                    <p className="text-xs text-accent-foreground/80">{tip.description}</p>
                </div>
            </div>
        ))}
         {!loading && !error && (!tips || tips.tips.length === 0) && (
            <p className="text-xs text-muted-foreground text-center py-4">No coaching tips available right now.</p>
        )}
    </div>
  );
}
