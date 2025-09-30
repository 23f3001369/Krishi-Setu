
'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { aiCropRecommendation } from '@/ai/flows/ai-crop-recommendation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Leaf, Lightbulb, Upload, Bot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

type State = {
  data?: {
    optimalCrops: string;
    reasoning: string;
  };
  error?: string;
};

const initialState: State = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      <Bot className="mr-2 h-4 w-4" />
      {pending ? 'Getting Recommendations...' : 'Get Recommendations'}
    </Button>
  );
}

async function recommendCrops(
  prevState: State,
  formData: FormData
): Promise<State> {
  const soilAnalysis = formData.get('soilAnalysis') as string;
  const soilHealthCardImage = formData.get('soilHealthCardImage') as string;
  const realTimeWeatherConditions = formData.get(
    'realTimeWeatherConditions'
  ) as string;
  const seasonalData = formData.get('seasonalData') as string;

  if (
    (!soilAnalysis && !soilHealthCardImage) ||
    !realTimeWeatherConditions ||
    !seasonalData
  ) {
    return { error: 'All fields are required.' };
  }

  try {
    const result = await aiCropRecommendation({
      soilAnalysis: soilAnalysis || undefined,
      soilHealthCardImage: soilHealthCardImage || undefined,
      realTimeWeatherConditions,
      seasonalData,
    });
    return { data: result };
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to get recommendations. Please try again.',
    };
  }
}

export default function CropRecommendationPage() {
  const [state, formAction] = useActionState(recommendCrops, initialState);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenImageInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        if (hiddenImageInputRef.current) {
          hiddenImageInputRef.current.value = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (hiddenImageInputRef.current) {
      hiddenImageInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          AI Crop Recommendation
        </h1>
        <p className="text-muted-foreground">
          Get expert advice on what to plant next based on your farm's data.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Farm Data</CardTitle>
            <CardDescription>
              Enter the latest data from your farm to receive tailored crop
              recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Soil Details</Label>
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="upload">Upload Report</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="pt-4">
                  <Textarea
                    name="soilAnalysis"
                    placeholder="e.g., pH: 6.8, Nitrogen: High, Phosphorus: Medium, Potassium: Low, Organic Matter: 3.5%"
                    id="soilAnalysis"
                  />
                </TabsContent>
                <TabsContent value="upload" className="pt-4">
                  {!imagePreview ? (
                    <div
                      className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center bg-muted/20 hover:bg-muted/40 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Click to upload your Soil Health Card
                      </p>
                      <Input
                        ref={fileInputRef}
                        id="soil-report-image"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                        <Image
                          src={imagePreview}
                          alt="Soil report preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                      >
                        Remove Image
                      </Button>
                    </div>
                  )}
                  <input
                    type="hidden"
                    name="soilHealthCardImage"
                    ref={hiddenImageInputRef}
                  />
                </TabsContent>
              </Tabs>
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="realTimeWeatherConditions">
                Real-time Weather Conditions
              </Label>
              <Textarea
                name="realTimeWeatherConditions"
                placeholder="e.g., Temp: 25°C, Humidity: 70%, Wind: 10km/h, Last rainfall: 2 days ago"
                id="realTimeWeatherConditions"
                required
              />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="seasonalData">Seasonal Data</Label>
              <Textarea
                name="seasonalData"
                placeholder="e.g., Current season: Late Spring, Average rainfall for this period: 50mm, Frost risk: Low"
                id="seasonalData"
                required
              />
            </div>
            {state.error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.data && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Recommendation Results</CardTitle>
            <CardDescription>
              Based on the data provided, here are the suggested crops.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-primary/5 border-primary/20">
              <Leaf className="h-4 w-4 !text-primary" />
              <AlertTitle className="text-primary">Optimal Crops</AlertTitle>
              <AlertDescription>
                <p className="text-lg font-semibold">
                  {state.data.optimalCrops}
                </p>
              </AlertDescription>
            </Alert>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Reasoning</AlertTitle>
              <AlertDescription>
                <p>{state.data.reasoning}</p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
