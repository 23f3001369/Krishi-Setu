
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tractor, Edit, PlusCircle, Sprout, MapPin, SquareStack, AreaChart } from "lucide-react";
import WeatherForecast from "@/components/dashboard/weather-forecast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';


type Farm = {
    id: string;
    name: string;
    size: number;
    location: string;
    mainCrops: string[];
};

function MyFarmCard() {
    const { user } = useUser();
    const db = useFirestore();

    const farmsQuery = useMemoFirebase(() => {
        if (!db || !user?.uid) return null;
        return query(collection(db, 'farms'), where('farmerId', '==', user.uid));
    }, [db, user?.uid]);

    const { data: farmsData, isLoading: isFarmsLoading } = useCollection<Farm>(farmsQuery);

    const largestFarm = useMemo(() => {
        if (!farmsData || farmsData.length === 0) return null;
        return farmsData.reduce((largest, current) => {
            return current.size > largest.size ? current : largest;
        });
    }, [farmsData]);

    if (isFarmsLoading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!largestFarm) {
        return (
            <Card className="text-center">
                <CardHeader>
                    <Tractor className="mx-auto h-12 w-12 text-muted-foreground" />
                    <CardTitle>No Farm Registered</CardTitle>
                    <CardDescription>
                        Register your farm to get started with personalized insights and recommendations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/farm-registration">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Register Your Farm
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader className='flex-row items-center justify-between'>
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Tractor className="w-6 h-6 text-primary" />
                        My Farm: {largestFarm.name}
                    </CardTitle>
                    <CardDescription>Details of your largest registered farm.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/farm-registration?id=${largestFarm.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Farm
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-semibold">{largestFarm.location}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <AreaChart className="w-6 h-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Farm Size</p>
                        <p className="font-semibold">{largestFarm.size} acres</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Sprout className="w-6 h-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Main Crops</p>
                        <p className="font-semibold">{largestFarm.mainCrops.join(', ')}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome back, Farmer!</h1>
        <p className="text-muted-foreground">Here's an overview of your farm's status and today's forecast.</p>
      </div>
      
      <MyFarmCard />

      <WeatherForecast />
      
    </div>
  );
}
