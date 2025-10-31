
'use client';

import React, { useState } from 'react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';

// Define schemas and types here, in the client component.
export const MarketPricePredictionInputSchema = z.object({
  cropName: z.string().describe('The name of the crop (e.g., "Wheat", "Tomato").'),
  marketLocation: z.string().describe('The name of the market or region (e.g., "Nashik, Maharashtra", "Indore").'),
});
export type MarketPricePredictionInput = z.infer<typeof MarketPricePredictionInputSchema>;

export const MarketPricePredictionOutputSchema = z.object({
  predictedPrice: z.string().describe('The predicted price range in Indian Rupees (Rs.) per standard unit (e.g., "Rs. 1800 - Rs. 2200 per quintal").'),
  trend: z.enum(['upward', 'downward', 'stable']).describe('The anticipated price trend over the next 2-4 weeks.'),
  reasoning: z.string().describe('A brief explanation for the prediction, mentioning factors like seasonality, demand, and recent events.'),
});
export type MarketPricePredictionOutput = z.infer<typeof MarketPricePredictionOutputSchema>;


const heroImage = PlaceHolderImages.find(p => p.id === 'market-price-hero');

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
      setError('Failed to get a price prediction. The AI model might be busy. Please try again.');
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

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          AI Mandi Price Prediction
        </h1>
        <p className="text-muted-foreground">
          Get AI-powered forecasts based on data from well-known agricultural market websites.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Get Price Prediction</CardTitle>
          <CardDescription>
            Enter a crop and market to get a price forecast from our AI market analyst.
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
            {isLoading ? 'Analyzing Market...' : 'Predict Price'}
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
                     <p className="text-sm text-muted-foreground flex items-center gap-1"><BarChart className="w-3 h-3" /> Next 2-4 Week Trend</p>
                     <p className="text-2xl font-bold capitalize flex items-center gap-2">
                        <TrendIcon trend={result.trend} />
                        {result.trend}
                    </p>
                </div>
            </div>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>AI Analyst's Reasoning</AlertTitle>
              <AlertDescription>{result.reasoning}</AlertDescription>
            </Alert>

             <Alert variant="default" className="text-xs">
                <Bot className="h-4 w-4" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                    This AI-generated prediction is for informational purposes only and is not financial advice. Market conditions can change rapidly.
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
                <div className="space-y-2">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
    )
}
