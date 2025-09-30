
'use client';

import React from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  AlertTriangle,
  CalendarCheck,
  Sprout,
  Tractor,
  Bug,
  Droplets,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock Data
const heroImage = PlaceHolderImages.find(p => p.id === "cultivation-guide-hero");

const cropOverview = {
    crop: 'Corn',
    variety: 'Pioneer P1197',
    cultivationDays: 110,
    currentStage: 'Vegetative Growth (V6)',
    totalExpenses: 15500, // from Krishi Khata
};

const cultivationStages = [
    { name: 'Planting', status: 'completed', duration: 'Day 1-5' },
    { name: 'Germination', status: 'completed', duration: 'Day 6-12' },
    { name: 'Vegetative Growth', status: 'active', duration: 'Day 13-60' },
    { name: 'Flowering', status: 'upcoming', duration: 'Day 61-75' },
    { name: 'Fruiting', status: 'upcoming', duration: 'Day 76-100' },
    { name: 'Harvest', status: 'upcoming', duration: 'Day 101-110' },
];

const stageDetails = {
    title: 'Vegetative Growth Stage (V6)',
    aiInstruction: 'The corn is in a critical growth phase. Ensure consistent moisture and monitor for nitrogen deficiency (yellowing lower leaves). Side-dressing with a nitrogen-rich fertilizer is recommended around this stage.',
    pestAlert: 'Corn borers are active in your region. Check the whorls of the plants for small holes and "frass" (sawdust-like material).',
    tasks: [
        { id: 'task1', text: 'Apply side-dress nitrogen fertilizer', completed: false },
        { id: 'task2', text: 'Scout for corn borer activity', completed: true },
        { id: 'task3', text: 'Ensure irrigation system is providing at least 1 inch of water per week', completed: false },
    ],
};

export default function CultivationGuidePage() {
  const [tasks, setTasks] = React.useState(stageDetails.tasks);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Cultivation Guide</h1>
        <p className="text-muted-foreground">Agronomy-powered, stage-wise planning for your crops.</p>
      </div>

       {heroImage && (
        <div className="relative h-48 w-full overflow-hidden rounded-lg">
            <Image src={heroImage.imageUrl} alt={heroImage.description} data-ai-hint={heroImage.imageHint} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <h2 className="text-4xl font-bold text-white font-headline">{cropOverview.crop}: {cropOverview.variety}</h2>
            </div>
        </div>
      )}

      {/* Crop Overview Section */}
      <Card>
          <CardHeader>
              <CardTitle>Full Crop Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-3">
                    <Sprout className="w-8 h-8 text-primary"/>
                    <div>
                        <p className="text-muted-foreground">Crop / Variety</p>
                        <p className="font-bold">{cropOverview.crop} / {cropOverview.variety}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-primary"/>
                    <div>
                        <p className="text-muted-foreground">Cultivation Days</p>
                        <p className="font-bold">{cropOverview.cultivationDays} days</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Tractor className="w-8 h-8 text-primary"/>
                    <div>
                        <p className="text-muted-foreground">Current Stage</p>
                        <p className="font-bold">{cropOverview.currentStage}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-lg font-bold">₹</div>
                    <div>
                        <p className="text-muted-foreground">Total Expenses</p>
                        <p className="font-bold">₹{cropOverview.totalExpenses.toLocaleString()}</p>
                    </div>
                </div>
          </CardContent>
      </Card>
      
      {/* Cultivation Timeline */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-headline">Crop Timeline</h2>
        <div className="relative w-full">
            <div className="absolute left-0 top-2.5 h-1 w-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex justify-between relative">
            {cultivationStages.map((stage, index) => (
                <div key={index} className="flex flex-col items-center z-10 w-1/6">
                    <div className={`w-6 h-6 rounded-full border-4 border-background dark:border-card ${getStatusColor(stage.status)}`}></div>
                    <p className="text-xs font-semibold mt-2 text-center">{stage.name}</p>
                    <p className="text-xs text-muted-foreground">{stage.duration}</p>
                </div>
            ))}
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: AI Instructions & Alerts */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="text-primary"/>
                        AI & Tech Integration
                    </CardTitle>
                    <CardDescription>{stageDetails.title}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{stageDetails.aiInstruction}</p>
                </CardContent>
            </Card>

            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2"><Bug/> Pest & Disease Alert</AlertTitle>
                <AlertDescription>{stageDetails.pestAlert}</AlertDescription>
            </Alert>
        </div>

        {/* Right Column: Calendar Tasks */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="text-primary"/>
                    Calendar-Based Tasks
                </CardTitle>
                <CardDescription>Key tasks for the current crop stage.</CardDescription>
            </CardHeader>
            <CardContent>
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
            <CardFooter className="flex-col items-stretch gap-y-4">
                <Separator />
                 <Button>Mark All as Complete</Button>
            </CardFooter>
        </Card>
      </div>

    </div>
  );
}
