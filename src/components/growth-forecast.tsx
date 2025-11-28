'use client';
import { useEffect, useState } from 'react';
import type { PredictionInput, PredictionOutput } from '@/ai/schemas/prediction-schemas';
import { getGrowthPrediction } from '@/ai/flows/prediction-flow';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BrainCircuit, TrendingUp } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Progress } from './ui/progress';

export function GrowthForecast({ input }: { input: PredictionInput }) {
  const [prediction, setPrediction] = useState<PredictionOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const result = await getGrowthPrediction(input);
        setPrediction(result);
      } catch (error) {
        console.error("Error fetching growth prediction:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [input]);

  return (
    <Card className="col-span-12 lg:col-span-3">
        <CardHeader>
            <CardTitle className='flex items-center gap-2'>
                <BrainCircuit className="h-5 w-5 text-primary" />
                AI Growth Forecast
            </CardTitle>
            <p className="text-sm text-muted-foreground pt-1">3-month projection based on current trends.</p>
        </CardHeader>
        <CardContent>
            {loading && (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-6 w-1/2 mt-2" />
                </div>
            )}
            {!loading && prediction && (
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Projected 3-Month GV</p>
                        <p className="text-2xl font-bold text-primary flex items-center gap-2">
                           <TrendingUp /> {prediction.projectedGV.toLocaleString()}
                        </p>
                    </div>
                    <div>
                         <p className="text-sm font-medium text-muted-foreground">Forecast Narrative</p>
                        <p className="text-sm">{prediction.narrative}</p>
                    </div>
                     <div>
                         <p className="text-sm font-medium text-muted-foreground">Confidence Score</p>
                        <div className="flex items-center gap-2">
                            <Progress value={prediction.confidence} className="w-full" />
                            <span className="text-sm font-bold">{prediction.confidence}%</span>
                        </div>
                    </div>
                </div>
            )}
            {!loading && !prediction && (
                <p className="text-xs text-muted-foreground text-center py-4">Could not generate forecast.</p>
            )}
        </CardContent>
    </Card>
  );
}
