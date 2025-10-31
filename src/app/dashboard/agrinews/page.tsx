
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { TrendingUp, TrendingDown, ArrowRight, Rss, Landmark, Scale } from "lucide-react";

// Mock Data - Simulating real-time news fetch
const heroImage = PlaceHolderImages.find(p => p.id === "agrinews-hero");

const mandiPrices = [
    { id: 'wh', crop: 'Wheat', variety: 'Dara', price: 2350, change: 25, trend: 'up' },
    { id: 'pd', crop: 'Paddy', variety: 'Basmati', price: 3800, change: -50, trend: 'down' },
    { id: 'cn', crop: 'Corn', variety: 'Hybrid', price: 2100, change: 15, trend: 'up' },
    { id: 'sb', crop: 'Soybean', variety: 'Yellow', price: 4500, change: -20, trend: 'down' },
    { id: 'tm', crop: 'Tomato', variety: 'Hybrid', price: 1800, change: 100, trend: 'up' },
];

const governmentSchemes = [
    {
        id: 'pmk',
        title: "PM-Kisan Samman Nidhi",
        description: "A government scheme that provides income support to all landholding farmer families in the country.",
        link: "#"
    },
    {
        id: 'fby',
        title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        description: "The government-sponsored crop insurance scheme that integrates multiple stakeholders on a single platform.",
link: "#"
    },
    {
        id: 'kcc',
        title: "Kisan Credit Card (KCC)",
        description: "A credit scheme to provide affordable credit for farmers to meet their agricultural and other needs.",
        link: "#"
    },
];

export default function AgriNewsPage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Agricultural Updates</h1>
        <p className="text-muted-foreground">Your source for market prices and government schemes.</p>
      </div>
      
       {heroImage && (
        <div className="relative h-48 w-full overflow-hidden rounded-lg">
            <Image src={heroImage.imageUrl} alt={heroImage.description} data-ai-hint={heroImage.imageHint} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <h2 className="text-4xl font-bold text-white font-headline">Stay Informed, Stay Ahead</h2>
            </div>
        </div>
      )}

      <Tabs defaultValue="mandi" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mandi"><Scale className="mr-2 h-4 w-4"/>Mandi Prices</TabsTrigger>
          <TabsTrigger value="schemes"><Landmark className="mr-2 h-4 w-4"/>Govt. Schemes</TabsTrigger>
        </TabsList>
        <TabsContent value="mandi" className="mt-6">
            <Card>
                <CardHeader>
                <CardTitle>Live Mandi Prices</CardTitle>
                <CardDescription>Real-time commodity prices from your local market.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Crop</TableHead>
                        <TableHead>Variety</TableHead>
                        <TableHead className="text-right">Price (per Quintal)</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {mandiPrices.map((item) => (
                        <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.crop}</TableCell>
                        <TableCell>{item.variety}</TableCell>
                        <TableCell className="text-right font-bold">₹{item.price.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                             <Badge variant="outline" className={`flex items-center justify-end gap-1 ${item.trend === 'up' ? 'text-green-600 border-green-400' : 'text-red-600 border-red-400'}`}>
                                {item.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                ₹{item.change}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="schemes" className="mt-6">
             <Card>
                <CardHeader>
                <CardTitle>Government Schemes & Subsidies</CardTitle>
                <CardDescription>Explore and apply for beneficial government programs.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
                    {governmentSchemes.map(scheme => (
                        <Card key={scheme.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{scheme.title}</CardTitle>
                            </CardHeader>
                             <CardContent className="flex-grow p-6">
                                <p className="text-sm text-muted-foreground">{scheme.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={scheme.link}>Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
