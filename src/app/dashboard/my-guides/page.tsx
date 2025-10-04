
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, ClipboardList, Trash2, AlertTriangle, Sprout, Clock } from 'lucide-react';

const heroImage = PlaceHolderImages.find(p => p.id === "cultivation-guide-hero");

type CultivationStage = {
  name: string;
  status: 'completed' | 'active' | 'upcoming';
  duration: string;
  aiInstruction: string;
  pestAndDiseaseAlert?: string;
  tasks: string[];
};

type CultivationGuide = {
  id: string;
  crop: string;
  variety: string;
  estimatedDurationDays: number;
  stages: CultivationStage[];
  createdAt: Timestamp;
};

export default function MyGuidesPage() {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();

    const [guideToDelete, setGuideToDelete] = useState<CultivationGuide | null>(null);

    const guidesQuery = useMemoFirebase(() => {
        if (!db || !user?.uid) return null;
        // This query is now memoized, preventing re-renders from creating new query objects
        return collection(db, 'farmers', user.uid, 'cultivationGuides');
    }, [db, user?.uid]);
    
    const { data: guides, isLoading } = useCollection<CultivationGuide>(guidesQuery);

    const handleDeleteGuide = async () => {
        if (!guideToDelete || !guidesQuery) return;
        
        try {
            const guideDoc = doc(guidesQuery.firestore, guidesQuery.path, guideToDelete.id);
            await deleteDoc(guideDoc);
            toast({
                title: 'Guide Deleted',
                description: `The cultivation guide for "${guideToDelete.crop}" has been removed.`,
            });
        } catch (error) {
            console.error("Error deleting guide:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete the guide. Please try again.',
            });
        } finally {
            setGuideToDelete(null);
        }
    };
    
    return (
        <div className="space-y-8">
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">My Cultivation Guides</h1>
                    <p className="text-muted-foreground">All your saved crop plans in one place.</p>
                </div>
                 <Button asChild>
                    <Link href="/dashboard/cultivation-guide">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Guide
                    </Link>
                </Button>
            </div>

            {isLoading && (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-2 p-6">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                            <CardFooter className="p-6">
                                <Skeleton className="h-10 w-24" />
                            </CardFooter>
                        </Card>
                    ))}
                 </div>
            )}
            
            {!isLoading && guides && guides.length > 0 ? (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {guides.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()).map(guide => {
                         const activeStage = guide.stages.find(s => s.status === 'active');
                        return (
                            <Card key={guide.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{guide.crop}</CardTitle>
                                            <CardDescription>{guide.variety}</CardDescription>
                                        </div>
                                         <Badge variant={activeStage ? 'default' : 'secondary'}>{activeStage?.name || 'Completed'}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4 p-6">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Sprout className="w-5 h-5 text-primary"/>
                                        <div>
                                            <p className="text-muted-foreground">Crop / Variety</p>
                                            <p className="font-bold">{guide.crop} / {guide.variety}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="w-5 h-5 text-primary"/>
                                        <div>
                                            <p className="text-muted-foreground">Est. Duration</p>
                                            <p className="font-bold">{guide.estimatedDurationDays} days</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between p-6">
                                    <Button asChild>
                                        <Link href={`/dashboard/cultivation-guide/${guide.id}`}>View Guide</Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setGuideToDelete(guide)}>
                                        <Trash2 className="w-4 h-4"/>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                 </div>
            ) : !isLoading && (
                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Guides Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">You haven't created any cultivation guides yet.</p>
                    <Button className="mt-6" asChild>
                         <Link href="/dashboard/cultivation-guide">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Your First Guide
                        </Link>
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!guideToDelete} onOpenChange={(open) => !open && setGuideToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-destructive"/>
                            Confirm Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the guide for "<strong>{guideToDelete?.crop}</strong>"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setGuideToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteGuide} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
