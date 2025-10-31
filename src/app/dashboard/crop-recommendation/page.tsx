
'use client';

import { useActionState, useRef, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { aiCropRecommendation } from '@/ai/flows/ai-crop-recommendation';
import { agriQa } from '@/ai/flows/agri-qa';
import { extractSoilHealthInfo } from '@/ai/flows/extract-soil-health-info';
import { transcribeAudio } from '@/ai/flows/speech-to-text';
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
import { Leaf, Lightbulb, Upload, Bot, Sparkles, Wand2, Mic, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useUser } from '@/firebase';

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
  const realTimeWeatherConditions = "Temp: 25°C, Humidity: 70%, Wind: 10km/h, Last rainfall: 2 days ago";
  const seasonalData = "Current season: Late Spring, Average rainfall for this period: 50mm, Frost risk: Low";
  const farmerId = formData.get('farmerId') as string;

  if (
    (!soilAnalysis && !soilHealthCardImage)
  ) {
    return { error: 'Soil details are required.' };
  }
  
  if (!farmerId) {
    return { error: 'User not authenticated. Please log in.' };
  }

  try {
    const result = await aiCropRecommendation({
      soilAnalysis: soilAnalysis || undefined,
      soilHealthCardImage: soilHealthCardImage || undefined,
      realTimeWeatherConditions,
      seasonalData,
      farmerId,
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
    const [error, setError] = useState<React.ReactNode | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [micDisabled, setMicDisabled] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined' && !navigator.mediaDevices?.getUserMedia) {
            setError("Sorry, your browser doesn't support microphone access.");
            setMicDisabled(true);
        }
    }, []);

    const handleMicClick = async () => {
        setError(null);
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                mediaRecorderRef.current = recorder;
                audioChunksRef.current = [];

                recorder.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                recorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = async () => {
                        const base64Audio = reader.result as string;
                        setIsLoading(true);
                        setQuestion('Transcribing audio...');
                        try {
                            const result = await transcribeAudio({ audio: base64Audio });
                            setQuestion(result.text);
                        } catch (e) {
                            console.error(e);
                            setError('Could not transcribe audio. Please try again.');
                            setQuestion('');
                        } finally {
                            setIsLoading(false);
                        }
                    };
                    stream.getTracks().forEach(track => track.stop());
                };

                recorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error(err);
                let errorMessage: React.ReactNode = 'Could not access the microphone. Please check permissions and try again.';
                if (err instanceof DOMException) {
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                        errorMessage = 'Microphone permission was denied. Please allow it in your browser settings.';
                    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                        errorMessage = 'No microphone was found. Please ensure one is connected and enabled.';
                    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError' || err.name === 'audio-capture') {
                        errorMessage = (
                            <div>
                                <p className="font-bold">Microphone is unavailable.</p>
                                <p className="mt-2">The browser could not access your microphone. Please close other apps or tabs using it, check permissions, then refresh the page.</p>
                            </div>
                        );
                        setMicDisabled(true);
                    }
                }
                setError(errorMessage);
            }
        }
    };

    const handleAskQuestion = async () => {
        if (!question || question === 'Transcribing audio...') return;
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
                    <div className="flex gap-2">
                        <Textarea 
                            id="general-question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder='e.g., "Which soil is suitable for soybean?" or "What are the crop varieties of Corn ?"'
                            disabled={isLoading}
                        />
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleMicClick} 
                            disabled={micDisabled || isLoading}
                            title={micDisabled ? "Microphone is unavailable" : (isRecording ? "Stop recording" : "Use microphone")}
                            className="h-auto"
                        >
                            <Mic className={isRecording ? 'text-primary animate-pulse' : ''} />
                        </Button>
                    </div>
                </div>
                 {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Microphone Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter className="p-6">
                <Button onClick={handleAskQuestion} disabled={isLoading || !question || question === 'Transcribing audio...'}>
                    <Bot className="mr-2 h-4 w-4" />
                    {isLoading ? (question === 'Transcribing audio...' ? 'Transcribing...' : 'Thinking...') : 'Ask Agri-Bot'}
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
  const { user } = useUser();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenImageInputRef = useRef<HTMLInputElement>(null);
  
  const [soilAnalysis, setSoilAnalysis] = useState('');
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
        setSoilAnalysis(result.soilAnalysisText);
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
              recommendations and save the report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <input type="hidden" name="farmerId" value={user?.uid || ''} />
            <div className="space-y-2">
              <Label>Soil Details</Label>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="upload">Upload Report</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="pt-4 space-y-6">
                  <Textarea
                    name="soilAnalysis"
                    placeholder="e.g., pH: 6.8, Nitrogen: High, Phosphorus: Medium, Potassium: Low, Organic Matter: 3.5%"
                    id="soilAnalysis"
                    value={soilAnalysis}
                    onChange={(e) => setSoilAnalysis(e.target.value)}
                  />
                  <div className="space-y-2">
                      <Label htmlFor="realTimeWeatherConditions">Real-time Weather Conditions</Label>
                      <Textarea
                          name="realTimeWeatherConditions"
                          placeholder="e.g., Temp: 25°C, Humidity: 70%, Wind: 10km/h, Last rainfall: 2 days ago"
                          id="realTimeWeatherConditions"
                          required
                      />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="seasonalData">Seasonal Data</Label>
                      <Textarea
                          name="seasonalData"
                          placeholder="e.g., Current season: Late Spring, Average rainfall for this period: 50mm"
                          id="seasonalData"
                          required
                      />
                  </div>
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
            
            {recommendationState.data && (
              <div className="space-y-6 pt-4 border-t">
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
              </div>
            )}

            {recommendationState.error && !recommendationState.data && (
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

    </div>
  );
}
