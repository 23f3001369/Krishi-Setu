'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Upload,
  Bot,
  FlaskConical,
  Sprout,
  CheckCircle,
  XCircle,
  Pill,
  Leaf,
} from 'lucide-react';
import {
  diseaseDetection,
  type DiseaseDetectionOutput,
} from '@/ai/flows/disease-detection';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function DiseaseDetectionPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiseaseDetectionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        // We need to keep a separate copy of the data for the API call
        // because the preview might be a downsized version in a real app.
        setImageData(dataUrl);
      };
      reader.readAsDataURL(file);
      setError(null);
      setResult(null);
    }
  };

  const handleDiagnose = async () => {
    if (!imageData) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const diagnosis = await diseaseDetection({ cropImage: imageData });
      setResult(diagnosis);
    } catch (err) {
      console.error(err);
      setError('Failed to get a diagnosis. The AI model might be busy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageData(null);
    setResult(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          AI Disease Detection
        </h1>
        <p className="text-muted-foreground">
          Upload an image of your crop to get an instant disease diagnosis.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Crop Image</CardTitle>
          <CardDescription>
            For best results, use a clear image of the affected part (leaf,
            stem, fruit).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!imagePreview ? (
            <div
              className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-12 text-center bg-muted/20 hover:bg-muted/40 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <Input
                ref={fileInputRef}
                id="crop-image"
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
                  alt="Crop preview"
                  fill
                  className="object-contain"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleRemoveImage}>
                Remove Image
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <Button onClick={handleDiagnose} disabled={!imageData || isLoading}>
            <Bot className="mr-2 h-4 w-4" />
            {isLoading ? 'Diagnosing...' : 'Diagnose with AI'}
          </Button>
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>

      {result && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Diagnosis Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant={result.isHealthy ? 'default' : 'destructive'} className={result.isHealthy ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}>
              {result.isHealthy ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{result.isHealthy ? 'Plant Appears Healthy' : 'Disease Detected'}</AlertTitle>
              <AlertDescription>
                <p className="text-lg font-semibold">{result.diseaseName}</p>
              </AlertDescription>
            </Alert>

            {!result.isHealthy && (
              <>
                {(result.chemicalRemedies?.length ?? 0) > 0 && 
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-lg">
                      <Pill className="h-5 w-5 text-primary" />
                      Chemical Remedies
                    </h3>
                    <div className="space-y-4">
                      {result.chemicalRemedies.map((remedy, i) => (
                          <div key={`chem-${i}`} className="text-sm p-3 rounded-md bg-muted/50">
                              <p className="font-semibold">{remedy.name}</p>
                              <p className="text-muted-foreground mt-1">{remedy.description}</p>
                          </div>
                      ))}
                    </div>
                  </div>
                }

                <Separator />

                {(result.homemadeRemedies?.length ?? 0) > 0 &&
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-lg">
                      <Leaf className="h-5 w-5 text-primary" />
                      Homemade & Organic Remedies
                    </h3>
                    <div className="space-y-4">
                      {result.homemadeRemedies.map((remedy, i) => (
                          <div key={`home-${i}`} className="text-sm p-3 rounded-md bg-muted/50">
                              <p className="font-semibold">{remedy.name}</p>
                              <p className="text-muted-foreground mt-1">{remedy.description}</p>
                          </div>
                      ))}
                    </div>
                  </div>
                }
              </>
            )}
            <Alert variant="default" className="text-xs">
                <Bot className="h-4 w-4" />
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                    This AI-generated diagnosis is for informational purposes only. Always consult with a qualified agricultural expert for confirmation.
                </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
