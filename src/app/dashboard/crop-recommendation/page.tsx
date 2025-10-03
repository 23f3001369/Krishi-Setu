
'use client';

import { useActionState, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { aiCropRecommendation } from '@/ai/flows/ai-crop-recommendation';
import { agriQa } from '@/ai/flows/agri-qa';
import { extractSoilHealthInfo } from '@/ai/flows/extract-soil-health-info';
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
import { Leaf, Lightbulb, Upload, Bot, Sparkles, Wand2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

type RecommendationState = {
  data?: {
    optimalCrops: string;
    reasoning: string;
  };
  error?: string;
};

const initialRecommendationState: RecommendationState = {};

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
  prevState: RecommendationState,
  formData: FormData
): Promise<RecommendationState> {
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

function GeneralAgriBot() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAskQuestion = async () => {
        if (!question) return;
        setIsLoading(true);
        setError(null);
        setAnswer('');
        try {
            const result = await agriQa({ question });
            setAnswer(result.answer);
        } catch(e) {
            console.error(e);
            setError('Failed to get an answer. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> General Agri-Bot</CardTitle>
                <CardDescription>
                Ask any general agricultural question, from soil types to crop varieties.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                    <Label htmlFor="general-question">Your Question</Label>
                    <Textarea 
                        id="general-question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder='e.g., "Which soil is suitable for soybean?" or "What are the crop varieties of Corn ?"'
                    />
                </div>
                 {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter className="p-6">
                <Button onClick={handleAskQuestion} disabled={isLoading || !question}>
                    <Bot className="mr-2 h-4 w-4" />
                    {isLoading ? 'Thinking...' : 'Ask Agri-Bot'}
                </Button>
            </CardFooter>
            {answer && (
                 <CardFooter className="p-6 pt-0">
                    <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertTitle>Answer</AlertTitle>
                        <AlertDescription>
                            <p>{answer}</p>
                        </AlertDescription>
                    </Alert>
                </CardFooter>
            )}
        </Card>
    )
}

export default function CropRecommendationPage() {
  const [recommendationState, formAction] = useActionState(recommendCrops, initialRecommendationState);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenImageInputRef = useRef<HTMLInputElement>(null);
  const soilAnalysisRef = useRef<HTMLTextAreaElement>(null);

  const [activeTab, setActiveTab] = useState('manual');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);


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

  const handleExtract = async () => {
    if (!hiddenImageInputRef.current?.value) return;

    setIsExtracting(true);
    setExtractError(null);
    try {
        const result = await extractSoilHealthInfo({
            soilHealthCardImage: hiddenImageInputRef.current.value
        });
        if (soilAnalysisRef.current) {
            soilAnalysisRef.current.value = result.soilAnalysisText;
        }
        setActiveTab('manual'); // Switch to manual tab to show the result
    } catch(e) {
        console.error(e);
        setExtractError('Failed to extract information from image. Please try again or enter details manually.');
    } finally {
        setIsExtracting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className='mb-8'>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          AI Crop Tools
        </h1>
        <p className="text-muted-foreground">
          Get expert advice on what to plant next or ask general farming questions.
        </p>
      </div>

      <GeneralAgriBot />

      <Card className="max-w-3xl mx-auto">
        <form action={formAction}>
          <CardHeader>
            <CardTitle>Specific Crop Recommendation</CardTitle>
            <CardDescription>
              Enter the latest data from your farm to receive tailored crop
              recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label>Soil Details</Label>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="upload">Upload Report</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="pt-4">
                  <Textarea
                    name="soilAnalysis"
                    placeholder="e.g., pH: 6.8, Nitrogen: High, Phosphorus: Medium, Potassium: Low, Organic Matter: 3.5%"
                    id="soilAnalysis"
                    ref={soilAnalysisRef}
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
                      <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemoveImage}
                            disabled={isExtracting}
                        >
                            Remove Image
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleExtract}
                            disabled={isExtracting}
                        >
                            <Wand2 className="mr-2 h-4 w-4" />
                            {isExtracting ? 'Extracting...' : 'Extract'}
                        </Button>
                      </div>
                    </div>
                  )}
                  <input
                    type="hidden"
                    name="soilHealthCardImage"
                    ref={hiddenImageInputRef}
                  />
                   {extractError && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Extraction Error</AlertTitle>
                        <AlertDescription>{extractError}</AlertDescription>
                    </Alert>
                )}
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
            {recommendationState.error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{recommendationState.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="p-6">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {recommendationState.data && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Recommendation Results</CardTitle>
            <CardDescription>
              Based on the data provided, here are the suggested crops.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <Alert className="bg-primary/5 border-primary/20">
              <Leaf className="h-4 w-4 !text-primary" />
              <AlertTitle className="text-primary">Optimal Crops</AlertTitle>
              <AlertDescription>
                <p className="text-lg font-semibold">
                  {recommendationState.data.optimalCrops}
                </p>
              </AlertDescription>
            </Alert>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Reasoning</AlertTitle>
              <AlertDescription>
                <p>{recommendationState.data.reasoning}</p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
