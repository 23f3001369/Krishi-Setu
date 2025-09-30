
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, MessageSquare, Tractor, Info, Tag } from "lucide-react";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const heroImage = PlaceHolderImages.find(p => p.id === "krishi-yantra-mitra-hero");

const equipment = [
  {
    id: 1,
    name: 'Tractor - John Deere 5050D',
    owner: 'Rakesh Kumar',
    location: 'Rampur Village, 5km away',
    phone: '9876543210',
    price: '₹1200/hour',
    available: true,
    image: PlaceHolderImages.find(p => p.id === 'learning-hub-video-2')
  },
  {
    id: 2,
    name: 'Rotary Tiller',
    owner: 'Sandeep Singh',
    location: 'Shyampur, 8km away',
    phone: '9871234560',
    price: '₹800/hour',
    available: true,
    image: PlaceHolderImages.find(p => p.id === 'learning-hub-article-2')
  },
  {
    id: 3,
    name: 'Combine Harvester',
    owner: 'Amit Patel',
    location: 'Main Market Area, 12km away',
    phone: '9988776655',
    price: '₹2500/hour',
    available: false,
    image: PlaceHolderImages.find(p => p.id === 'learning-hub-article-3')
  }
];

export default function KrishiYantraMitraPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Krishi Yantra Mitra</h1>
                <p className="text-muted-foreground">Peer-to-peer equipment rental portal to book machines on demand.</p>
            </div>

            {heroImage && (
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                    <Image src={heroImage.imageUrl} alt={heroImage.description} data-ai-hint={heroImage.imageHint} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <h2 className="text-4xl font-bold text-white font-headline">Rent Farm Equipment</h2>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Find Equipment</CardTitle>
                    <CardDescription>Search for tractors, tillers, harvesters, and more from other farmers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search for equipment (e.g., Tractor, Tiller...)" className="pl-8" />
                        </div>
                        <Button>Search</Button>
                    </div>
                </CardContent>
            </Card>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Market Rentals</AlertTitle>
                <AlertDescription>
                    Looking for rental services from a marketplace? Check out the <Link href="/dashboard/agri-bazar" className="font-semibold underline">Agri Bazar</Link> for commercial rental options.
                </AlertDescription>
            </Alert>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {equipment.map(item => (
                    <Card key={item.id} className="flex flex-col">
                        {item.image &&
                            <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                                <Image src={item.image.imageUrl} alt={item.name} data-ai-hint={item.image.imageHint} fill className="object-cover" />
                                <Badge variant={item.available ? 'default' : 'destructive'} className={`absolute top-2 right-2 ${item.available ? 'bg-green-600' : ''}`}>
                                    {item.available ? 'Available' : 'Booked'}
                                </Badge>
                            </div>
                        }
                        <CardHeader>
                            <CardTitle>{item.name}</CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground pt-1">
                                <Tractor className="w-4 h-4 mr-2" /> Owned by {item.owner}
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                             <div className="flex items-start gap-2 text-sm">
                                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                <span>{item.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                <Tag className="w-4 h-4 text-muted-foreground" />
                                <span>{item.price}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button className="w-full" disabled={!item.available}>
                                <Phone className="mr-2 h-4 w-4" /> Call
                            </Button>
                            <Button variant="outline" className="w-full" asChild disabled={!item.available}>
                                <Link href={`/dashboard/chat?with=${encodeURIComponent(item.owner)}`}>
                                    <MessageSquare className="mr-2 h-4 w-4" /> Chat
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
