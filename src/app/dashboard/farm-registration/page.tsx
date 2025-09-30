"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Check, MapPin, Image as ImageIcon, ChevronsRight, ChevronsLeft, Send } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const totalSteps = 3;

export default function FarmRegistrationPage() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const farmImage = PlaceHolderImages.find(p => p.id === 'farm-photo-1');

  const handleNext = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));
  const handleSubmit = () => {
    // Handle form submission logic
    console.log("Form submitted");
    setIsSubmitted(true);
  };

  const progress = (step / totalSteps) * 100;

  if (isSubmitted) {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="items-center text-center">
                 <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Check className="h-10 w-10 text-primary" />
                 </div>
                 <CardTitle className="text-2xl font-headline">Registration Complete!</CardTitle>
                 <CardDescription>Your farm has been successfully registered. You can now access all features.</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Send className="h-4 w-4" />
                    <AlertTitle>What's Next?</AlertTitle>
                    <AlertDescription>
                        Explore your dashboard to view weather forecasts or try our AI Crop Recommendation tool.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
            </CardFooter>
        </Card>
    )
  }

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Register Your Farm</h1>
            <p className="text-muted-foreground">Follow the steps to add your farm details to AgriAssist.</p>
        </div>
        <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Step {step}: {step === 1 ? 'Farm Details' : step === 2 ? 'Location' : 'Photos'}</CardTitle>
            <CardDescription>
                {step === 1 ? 'Provide basic information about your farm.' : step === 2 ? 'Pin your farm\'s location.' : 'Upload some photos of your farm.'}
            </CardDescription>
            <Progress value={progress} className="w-full mt-2" />
        </CardHeader>
        <CardContent>
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 image={farmImage} />}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                <ChevronsLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            {step < totalSteps ? (
            <Button onClick={handleNext}>
                Next
                <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
            ) : (
            <Button onClick={handleSubmit}>
                Submit
                <Send className="ml-2 h-4 w-4" />
            </Button>
            )}
        </CardFooter>
        </Card>
    </div>
  );
}

function Step1() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="farmName">Farm Name</Label>
        <Input id="farmName" placeholder="e.g., Sunny Meadows Farm" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="farmSize">Farm Size (in acres)</Label>
        <Input id="farmSize" type="number" placeholder="e.g., 50" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mainCrops">Main Crops</Label>
        <Textarea id="mainCrops" placeholder="e.g., Corn, Soybeans, Wheat" />
      </div>
    </div>
  );
}

function Step2() {
  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="123 Farm Lane, Countryside" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="gps">GPS Coordinates</Label>
            <div className="flex gap-2">
                <Input id="gps-lat" placeholder="Latitude" />
                <Input id="gps-lon" placeholder="Longitude" />
            </div>
        </div>
        <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center mt-4">
            <div className="text-center text-muted-foreground p-4">
                <MapPin className="mx-auto h-8 w-8 mb-2" />
                <p>Map view will be available here.</p>
                <p className="text-xs">(Enter coordinates or use a map tool)</p>
            </div>
        </div>
    </div>
  );
}

function Step3({image}: {image?: {imageUrl: string, description: string, imageHint: string}}) {
  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label>Upload Farm Photos</Label>
            <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/40 cursor-pointer">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Drag &amp; drop files here, or click to select files</p>
                <Input id="picture" type="file" className="sr-only" />
            </div>
        </div>
        {image &&
            <div className="space-y-2">
                <Label>Uploaded Photos</Label>
                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                    <Image src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} fill className="object-cover"/>
                </div>
            </div>
        }
    </div>
  );
}
