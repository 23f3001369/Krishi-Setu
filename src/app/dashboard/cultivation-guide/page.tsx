
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  type CultivationStage
} from '@/ai/flows/generate-cultivation-guide';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

const heroImage = PlaceHolderImages.find(p => p.id === "cultivation-guide-hero");

export default function CultivationGuidePage() {
  const [formData, setFormData] = useState({
    crop: '',
    area: '',
    weather: '',
    soilHealth: '',
    variety: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [guide, setGuide] = useState<GenerateCultivationGuideOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTaskChange = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': return 'bg-green-500';
        case 'active': return 'bg-blue-500 animate-pulse';
        case 'upcoming': return 'bg-gray-400';
        default: return 'bg-gray-300';
    }
  }

  const handleGenerateGuide = async () => {
    setIsLoading(true);
    setGuide(null);
    setError(null);
    try {
      const result = await generateCultivationGuide({
        crop: formData.crop,
        area: parseFloat(formData.area),
        currentWeather: formData.weather,
        soilHealth: formData.soilHealth,
        variety: formData.variety,
      });
      setGuide(result);
      const activeStage = result.stages.find(s => s.status === 'active');
      if (activeStage) {
        setTasks(activeStage.tasks.map((task, index) => ({ id: `task-${index}`, text: task, completed: false })));
      }
    } catch (e) {
      console.error(e);
      setError('Failed to generate the cultivation guide. Please try again.');
    }
    setIsLoading(false);
  };
  
  const isFormValid = formData.crop && formData.area && formData.weather && formData.soilHealth;

  if (isLoading) {
    return (
        <div className="space-y-8">
             <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Cultivation Guide</h1>
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

  if (guide) {
      const activeStage = guide.stages.find(s => s.status === 'active');

    return (
        <div className="space-y-8">
            <div className='mb-8'>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Your Custom Cultivation Guide</h1>
                <p className="text-muted-foreground">Here is the AI-generated plan for your {guide.crop} crop.</p>
            </div>

            {heroImage && (
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                    <Image src={heroImage.imageUrl} alt={heroImage.description} data-ai-hint={heroImage.imageHint} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <h2 className="text-4xl font-bold text-white font-headline">{guide.crop}: {guide.variety}</h2>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Full Crop Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm p-6">
                        <div className="flex items-center gap-3">
                            <Sprout className="w-8 h-8 text-primary"/>
                            <div>
                                <p className="text-muted-foreground">Crop / Variety</p>
                                <p className="font-bold">{guide.crop} / {guide.variety}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="w-8 h-8 text-primary"/>
                            <div>
                                <p className="text-muted-foreground">Est. Cultivation Days</p>
                                <p className="font-bold">{guide.estimatedDurationDays} days</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Tractor className="w-8 h-8 text-primary"/>
                            <div>
                                <p className="text-muted-foreground">Current Stage</p>
                                <p className="font-bold">{activeStage?.name || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-lg font-bold">₹</div>
                            <div>
                                <p className="text-muted-foreground">Est. Expenses</p>
                                <p className="font-bold">₹{guide.estimatedExpenses.toLocaleString()}</p>
                            </div>
                        </div>
                </CardContent>
            </Card>
            
            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline">Crop Timeline</h2>
                <div className="relative w-full">
                    <div className="absolute left-0 top-2.5 h-1 w-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex justify-between relative">
                    {guide.stages.map((stage, index) => (
                        <div key={index} className="flex flex-col items-center z-10 w-1/6">
                            <div className={`w-6 h-6 rounded-full border-4 border-background dark:border-card ${getStatusColor(stage.status)}`}></div>
                            <p className="text-xs font-semibold mt-2 text-center">{stage.name}</p>
                            <p className="text-xs text-muted-foreground">{stage.duration}</p>
                        </div>
                    ))}
                    </div>
                </div>
            </div>

            {activeStage && (
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bot className="text-primary"/>
                                    AI Instructions for {activeStage.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground">{activeStage.aiInstruction}</p>
                            </CardContent>
                        </Card>

                        {activeStage.pestAndDiseaseAlert &&
                          <Alert variant="destructive">
                              <Bug className="h-4 w-4" />
                              <AlertTitle>Pest & Disease Alert</AlertTitle>
                              <AlertDescription>{activeStage.pestAndDiseaseAlert}</AlertDescription>
                          </Alert>
                        }
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarCheck className="text-primary"/>
                                Tasks for this Stage
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={task.id}
                                        checked={task.completed}
                                        onCheckedChange={() => handleTaskChange(task.id)}
                                    />
                                    <label
                                        htmlFor={task.id}
                                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                                        task.completed ? 'line-through text-muted-foreground' : ''
                                        }`}
                                    >
                                        {task.text}
                                    </label>
                                </div>
                            ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch gap-y-4 p-6">
                            <Separator />
                            <Button>Mark All as Complete</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
             <div className="flex justify-center">
                <Button variant="outline" onClick={() => setGuide(null)}>Start a New Guide</Button>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className='mb-8'>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Cultivation Guide</h1>
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
                <Label htmlFor="variety">Crop Variety (Optional)</Label>
                <div className="flex gap-2">
                    <Input id="variety" name="variety" placeholder="e.g., Pioneer P1197" value={formData.variety} onChange={handleInputChange} />
                    <Button variant="outline">
                        <Bot className="mr-2 h-4 w-4"/>
                        Recommend
                    </Button>
                </div>
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
                Generate Guide
            </Button>
        </CardFooter>
       </Card>
    </div>
  );
}
