
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
  const [formData, setFormData] = useState({
    farmName: "",
    farmSize: "",
    mainCrops: "",
    address: "",
  });
  const farmImage = PlaceHolderImages.find(p => p.id === 'farm-photo-1');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const isStep1Valid = formData.farmName.trim() !== "" && formData.farmSize.trim() !== "" && formData.mainCrops.trim() !== "";
  const isStep2Valid = formData.address.trim() !== "";

  const handleNext = () => {
    if (step === 1 && !isStep1Valid) return;
    if (step === 2 && !isStep2Valid) return;
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };
  
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));
  
  const handleSubmit = () => {
    // Handle form submission logic
    console.log("Form submitted", formData);
    setIsSubmitted(true);
  };

  const progress = (step / totalSteps) * 100;

  if (isSubmitted) {
    return (
        <div className="max-w-2xl mx-auto">
            <Card className="w-full">
                <CardHeader className="items-center text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <Check className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Registration Complete!</CardTitle>
                    <CardDescription>Your farm has been successfully registered. You can now access all features.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <Alert>
                        <Send className="h-4 w-4" />
                        <AlertTitle>What's Next?</AlertTitle>
                        <AlertDescription>
                            Explore your dashboard to view weather forecasts or try our AI Crop Recommendation tool.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="p-6">
                    <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-8">
        <div className="mb-8">
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
        <CardContent className="p-6">
            {step === 1 && <Step1 formData={formData} handleChange={handleChange} />}
            {step === 2 && <Step2 formData={formData} handleChange={handleChange} />}
            {step === 3 && <Step3 image={farmImage} />}
        </CardContent>
        <CardFooter className="flex justify-between p-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                <ChevronsLeft className="mr-2 h-4 w-4" />
                Back
            </Button>
            {step < totalSteps ? (
            <Button onClick={handleNext} disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}>
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

type StepProps = {
    formData: {
        farmName: string;
        farmSize: string;
        mainCrops: string;
        address: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function Step1({ formData, handleChange }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="farmName">Farm Name</Label>
        <Input id="farmName" placeholder="e.g., Sunny Meadows Farm" required value={formData.farmName} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="farmSize">Farm Size (in acres)</Label>
        <Input id="farmSize" type="number" placeholder="e.g., 50" required value={formData.farmSize} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mainCrops">Main Crops</Label>
        <Textarea id="mainCrops" placeholder="e.g., Corn, Soybeans, Wheat" required value={formData.mainCrops} onChange={handleChange} />
      </div>
    </div>
  );
}

function Step2({ formData, handleChange }: StepProps) {
  return (
    <div className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="address">Address or general location</Label>
            <Textarea id="address" placeholder="e.g., Near Springfield, Main road" required value={formData.address} onChange={handleChange} />
        </div>
        <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center mt-4">
            <div className="text-center text-muted-foreground p-4">
                <MapPin className="mx-auto h-8 w-8 mb-2" />
                <p>Map view will be available here.</p>
                <p className="text-xs">(Future feature)</p>
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
