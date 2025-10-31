
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Bot,
  TrendingUp,
  TrendingDown,
  CircleDot,
  Lightbulb,
  Loader,
  DollarSign,
  Wheat,
  MapPin,
  BarChart,
} from 'lucide-react';
import {
  marketPricePrediction,
} from '@/ai/flows/market-price-prediction';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define schemas and types here, in the client component.
export const MarketPricePredictionInputSchema = z.object({
  cropName: z.string().describe('The name of the crop (e.g., "Wheat", "Tomato").'),
  marketLocation: z.string().describe('The name of the market or region (e.g., "Nashik, Maharashtra", "Indore").'),
});
export type MarketPricePredictionInput = z.infer<typeof MarketPricePredictionInputSchema>;

export const MarketPricePredictionOutputSchema = z.object({
  predictedPrice: z.string().describe('The predicted price range in Indian Rupees (Rs.) per standard unit (e.g., "Rs. 1800 - Rs. 2200 per quintal").'),
  trend: z.enum(['upward', 'downward', 'stable']).describe('The anticipated price trend over the next 2-4 weeks.'),
  trendConfidence: z.object({
      upward: z.number().describe('The confidence percentage (0-100) that the price trend will be upward.'),
      downward: z.number().describe('The confidence percentage (0-100) that the price trend will be downward.'),
      stable: z.number().describe('The confidence percentage (0-100) that the price trend will be stable.'),
  }).describe('The confidence levels for each possible trend. The sum must be 100.'),
  reasoning: z.string().describe('A brief explanation for the prediction, mentioning factors like seasonality, demand, and recent events.'),
});
export type MarketPricePredictionOutput = z.infer<typeof MarketPricePredictionOutputSchema>;


export default function MarketPricePredictionPage() {
  const [formData, setFormData] = useState({
    cropName: '',
    marketLocation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MarketPricePredictionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePredict = async () => {
    if (!formData.cropName || !formData.marketLocation) {
      setError('Please fill in both crop name and market location.');
      return;
    }
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const prediction = await marketPricePrediction({
        cropName: formData.cropName,
        marketLocation: formData.marketLocation,
      });
      setResult(prediction);
    } catch (e) {
      console.error(e);
      setError('Failed to get a price prediction. The model might be busy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const TrendIcon = ({ trend }: { trend: 'upward' | 'downward' | 'stable' }) => {
    switch (trend) {
      case 'upward': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'downward': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <CircleDot className="h-4 w-4 text-yellow-500" />;
    }
  };

  const trendChartData = useMemo(() => {
    if (!result?.trendConfidence) return [];
    return [
      { name: 'Upward', value: result.trendConfidence.upward, fill: 'var(--chart-1)' },
      { name: 'Downward', value: result.trendConfidence.downward, fill: 'var(--chart-2)' },
      { name: 'Stable', value: result.trendConfidence.stable, fill: 'var(--chart-3)' },
    ].filter(item => item.value > 0);
  }, [result]);

  const chartConfig = {
      upward: { label: 'Upward', color: 'hsl(var(--chart-1))' },
      downward: { label: 'Downward', color: 'hsl(var(--chart-2))' },
      stable: { label: 'Stable', color: 'hsl(var(--chart-3))' },
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Mandi Price Prediction
        </h1>
        <p className="text-muted-foreground">
          Get forecasts based on data from well-known agricultural market websites.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Get Price Prediction</CardTitle>
          <CardDescription>
            Enter a crop and market to get a price forecast from our market analyst.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cropName" className="flex items-center gap-1"><Wheat className="w-4 h-4" /> Crop Name</Label>
              <Input
                id="cropName"
                name="cropName"
                placeholder="e.g., Wheat, Tomato"
                value={formData.cropName}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketLocation" className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Market Location</Label>
              <Input
                id="marketLocation"
                name="marketLocation"
                placeholder="e.g., Nashik, Indore"
                value={formData.marketLocation}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6">
          <Button
            onClick={handlePredict}
            disabled={isLoading || !formData.cropName || !formData.marketLocation}
          >
            <Bot className="mr-2 h-4 w-4" />
            {isLoading ? 'Analyzing Market...' : 'Know Price'}
          </Button>
        </CardFooter>
      </Card>
      
      {isLoading && <ResultSkeleton />}

      {error && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTitle>Prediction Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Prediction for {formData.cropName} in {formData.marketLocation}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
             <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted flex flex-col items-center justify-center text-center">
                     <p className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" /> Predicted Price</p>
                     <p className="text-2xl font-bold text-primary">{result.predictedPrice}</p>
                </div>
                 <div className="p-4 rounded-lg bg-muted flex flex-col items-center justify-center text-center">
                     <p className="text-sm text-muted-foreground flex items-center gap-1"><BarChart className="w-3 h-3" /> Most Likely Trend</p>
                     <p className="text-2xl font-bold capitalize flex items-center gap-2">
                        <TrendIcon trend={result.trend} />
                        {result.trend}
                    </p>
                </div>
            </div>

            {trendChartData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Trend Confidence</CardTitle>
                        <CardDescription>Confidence level for each potential price trend.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex items-center justify-center">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                                <Pie data={trendChartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                    {trendChartData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            )}

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Analyst's Reasoning</AlertTitle>
              <AlertDescription>{result.reasoning}</AlertDescription>
            </Alert>

             <Alert variant="default" className="text-xs">
                <Bot className="h-4 w-4" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                    This generated prediction is for informational purposes only and is not financial advice. Market conditions can change rapidly.
                </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResultSkeleton() {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <Skeleton className="h-7 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                 <div className="grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <Skeleton className="h-40 w-full" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}
