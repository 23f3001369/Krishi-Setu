
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Bot,
  CalendarCheck,
  Sprout,
  Tractor,
  Bug,
  CheckCircle,
  Clock,
  AreaChart,
  Sun,
  Leaf,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  generateCultivationGuide,
  type GenerateCultivationGuideOutput,
} from '@/ai/flows/generate-cultivation-guide';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const heroImage = PlaceHolderImages.find(p => p.id === "cultivation-guide-hero");

export const TaskSchema = z.object({
    text: z.string().describe('A description of the task.'),
    completed: z.boolean().describe('Whether the task has been completed.'),
});

export const CultivationStageSchema = z.object({
  name: z.string().describe('The name of the cultivation stage (e.g., "Planting", "Vegetative Growth").'),
  status: z.enum(['completed', 'active', 'upcoming']).describe('The current status of this stage.'),
  duration: z.string().describe('The estimated duration of this stage (e.g., "Day 1-5").'),
  aiInstruction: z.string().describe('A detailed, user-friendly instruction from the AI for this specific stage.'),
  pestAndDiseaseAlert: z.string().optional().describe('A specific alert for pests or diseases relevant to this stage and region.'),
  tasks: z.array(TaskSchema).describe('A list of key tasks to be completed during this stage.'),
});

const cropVarieties: Record<string, string[]> = {
    'corn': ['Pioneer P1197', 'Dekalb DKC62-08', 'Sweet Corn 101'],
    'tomato': ['Roma', 'Cherry', 'Beefsteak', 'San Marzano'],
    'wheat': ['HD-3226', 'Durum', 'Einkorn'],
    'sugarcane': ['Co 86032', 'Co 0238', 'Co 0118', 'CoJ 64'],
    'jute': ['JRO-524 (Naveen)', 'JRC-212', 'JRC-321'],
    'cotton': ['MCU-5', 'LRA-5166', 'Surabhi', 'Bt Cotton'],
    'millets': ['Pearl Millet (Bajra)', 'Sorghum (Jowar)', 'Finger Millet (Ragi)'],
    'pulses': ['Chickpea (Chana)', 'Pigeon Pea (Arhar)', 'Lentil (Masoor)'],
    'rice': ['Basmati-370', 'Pusa Basmati-1', 'IR-64', 'Sona Masoori'],
    'tea': ['TV1 (Tocklai Vegetable 1)', 'P-126', 'S.3A/3'],
    'coffee': ['Arabica', 'Robusta', 'Kent', 'S.795'],
    'groundnut': ['Kadiri-6', 'TMV-7', 'G2'],
    'mustard': ['Pusa Bold', 'RH-30', 'Varuna'],
    'soybean': ['JS-335', 'NRC-37', 'MACS-1188'],
    'sunflower': ['KBSH-1', 'MSFH-17', 'PAC-36'],
};


export default function CultivationGuidePage() {
  const [formData, setFormData] = useState({
    crop: '',
    area: '',
    weather: '',
    soilHealth: '',
    variety: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtherVariety, setShowOtherVariety] = useState(false);

  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const guidesCollectionRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, 'farmers', user.uid, 'cultivationGuides');
  }, [db, user?.uid]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'crop' && value.toLowerCase() !== formData.crop.toLowerCase()) {
        setFormData(prev => ({ ...prev, crop: value, variety: '' }));
        setShowOtherVariety(false);
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleVarietyChange = (value: string) => {
    if (value === 'other') {
        setShowOtherVariety(true);
        setFormData(prev => ({...prev, variety: ''}));
    } else {
        setShowOtherVariety(false);
        setFormData(prev => ({...prev, variety: value}));
    }
  }

  const handleGenerateGuide = async () => {
    if (!user || !db) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to create a guide.',
        });
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await generateCultivationGuide({
        crop: formData.crop,
        area: parseFloat(formData.area),
        currentWeather: formData.weather,
        soilHealth: formData.soilHealth,
        variety: formData.variety,
      });
      

      if (guidesCollectionRef) {
        await addDoc(guidesCollectionRef, {
            ...result,
            userId: user.uid,
            createdAt: serverTimestamp(),
        });
      }
      
      toast({
        title: 'Guide Created!',
        description: `Your cultivation plan for ${result.crop} has been saved to "My Guides".`,
      });

      router.push('/dashboard/my-guides');

    } catch (e) {
      console.error(e);
      setError('Failed to generate the cultivation guide. Please try again.');
    }
    setIsLoading(false);
  };
  
  const isFormValid = formData.crop && formData.area && formData.weather && formData.soilHealth;

  const suggestedVarieties = cropVarieties[formData.crop.toLowerCase()] || [];

  if (isLoading) {
    return (
        <div className="space-y-8">
             <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight font-headline">New Cultivation Guide</h1>
                <p className="text-muted-foreground">Agronomy-powered, stage-wise planning for your crops.</p>
            </div>
             <Card>
                <CardHeader className="items-center text-center p-6">
                    <Bot className="w-12 h-12 text-primary animate-pulse" />
                    <CardTitle>Generating Your Guide</CardTitle>
                    <CardDescription>Our AI is creating a personalized cultivation plan for your {formData.crop} crop. This may take a moment...</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-8 w-1/2 mx-auto" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className='mb-8'>
        <h1 className="text-3xl font-bold tracking-tight font-headline">New Cultivation Guide</h1>
        <p className="text-muted-foreground">Agronomy-powered, stage-wise planning for your crops.</p>
      </div>

       <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Create a New Cultivation Plan</CardTitle>
            <CardDescription>Provide details about your crop to generate a personalized guide.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="crop" className="flex items-center gap-1"><Sprout className="w-4 h-4"/> Crop Name</Label>
                    <Input id="crop" name="crop" placeholder="e.g., Corn, Tomato" value={formData.crop} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="area" className="flex items-center gap-1"><AreaChart className="w-4 h-4"/> Area (in acres)</Label>
                    <Input id="area" name="area" type="number" placeholder="e.g., 5" value={formData.area} onChange={handleInputChange} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="variety">Crop Variety</Label>
                 {suggestedVarieties.length > 0 ? (
                    <div className="space-y-2">
                        <Select onValueChange={handleVarietyChange} value={showOtherVariety ? 'other' : formData.variety}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a variety or let AI recommend" />
                            </SelectTrigger>
                            <SelectContent>
                                {suggestedVarieties.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                <SelectItem value="other">Other...</SelectItem>
                            </SelectContent>
                        </Select>
                        {showOtherVariety && (
                            <Input 
                                name="variety" 
                                placeholder="Please specify variety" 
                                value={formData.variety} 
                                onChange={handleInputChange} 
                                className="mt-2"
                            />
                        )}
                    </div>
                ) : (
                    <Input id="variety" name="variety" placeholder="e.g., Pioneer P1197 (or leave blank for AI)" value={formData.variety} onChange={handleInputChange} />
                )}
            </div>
             <div className="space-y-2">
                <Label htmlFor="weather" className="flex items-center gap-1"><Sun className="w-4 h-4"/> Current Weather</Label>
                <Textarea id="weather" name="weather" placeholder="Describe the current weather conditions, e.g., 'Sunny, 30°C, high humidity'" value={formData.weather} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="soilHealth" className="flex items-center gap-1"><Leaf className="w-4 h-4"/> Soil Health Details</Label>
                <Textarea id="soilHealth" name="soilHealth" placeholder="Describe your soil, e.g., 'pH 6.5, good nitrogen, low potassium. Or, upload a soil card.'" value={formData.soilHealth} onChange={handleInputChange} />
            </div>
             {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
        </CardContent>
        <CardFooter className="p-6">
            <Button onClick={handleGenerateGuide} disabled={!isFormValid}>
                <Bot className="mr-2 h-4 w-4" />
                Generate & Save Guide
            </Button>
        </CardFooter>
       </Card>
    </div>
  );
}
