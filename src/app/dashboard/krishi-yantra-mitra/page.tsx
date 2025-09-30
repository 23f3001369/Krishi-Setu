
'use client';

import React, { useState } from 'react';
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
import { Search, MapPin, Phone, MessageSquare, Tractor, Info, Tag, Crosshair, PlusCircle } from "lucide-react";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

const heroImage = PlaceHolderImages.find(p => p.id === "krishi-yantra-mitra-hero");
const defaultEquipmentImage = PlaceHolderImages.find(p => p.id === 'user-equipment-1');

const initialEquipment = [
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

type Equipment = {
    id: number;
    name: string;
    owner: string;
    location: string;
    phone: string;
    price: string;
    available: boolean;
    image?: {
        id: string;
        description: string;
        imageUrl: string;
        imageHint: string;
    }
}

export default function KrishiYantraMitraPage() {
    const [equipment, setEquipment] = useState(initialEquipment);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newEquipment, setNewEquipment] = useState({ name: '', price: '' });

    const handleAddEquipment = () => {
        if (!newEquipment.name || !newEquipment.price) return;
        
        const newItem: Equipment = {
            id: equipment.length + 1,
            name: newEquipment.name,
            owner: 'Farmer', // Mock current user
            location: 'Your Location, 0km away',
            phone: '1234567890',
            price: `₹${newEquipment.price}/hour`,
            available: true,
            image: defaultEquipmentImage,
        };

        setEquipment(prev => [...prev, newItem]);
        setIsDialogOpen(false);
        setNewEquipment({ name: '', price: '' });
    };

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
                        <h2 className="text-4xl font-bold text-white font-headline">Rent or Lend Farm Equipment</h2>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                 <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Find Equipment</CardTitle>
                            <CardDescription>Search for tractors, tillers, harvesters, and more from other farmers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                     <Label htmlFor="product-search">What equipment do you need?</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="product-search" placeholder="e.g., Tractor, Tiller..." className="pl-8" />
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                     <Label htmlFor="location-search">Your Location</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-grow">
                                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input id="location-search" placeholder="Enter your city or area" className="pl-8" />
                                        </div>
                                        <Button variant="outline" size="icon" aria-label="Detect current location">
                                            <Crosshair className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button>
                                <Search className="mr-2 h-4 w-4" />
                                Search Equipment
                            </Button>
                        </CardFooter>
                    </Card>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Market Rentals</AlertTitle>
                        <AlertDescription>
                            Looking for rental services from a marketplace? Check out the <Link href="/dashboard/agri-bazar" className="font-semibold underline">Agri Bazar</Link> for commercial rental options.
                        </AlertDescription>
                    </Alert>
                 </div>
                 <Card className="flex flex-col items-center justify-center text-center p-6 bg-muted/20 border-dashed">
                    <Tractor className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold font-headline">Have equipment to spare?</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">Earn extra income by renting out your farm equipment to fellow farmers in your area.</p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        List Your Equipment
                    </Button>
                 </Card>
            </div>

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
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>List Your Equipment</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to make your equipment available for rent.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Equipment Name</Label>
                            <Input
                                id="name"
                                value={newEquipment.name}
                                onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., John Deere 5050D Tractor"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Rental Price (per hour)</Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                                <Input
                                    id="price"
                                    type="number"
                                    value={newEquipment.price}
                                    onChange={(e) => setNewEquipment(prev => ({ ...prev, price: e.target.value }))}
                                    placeholder="e.g., 1200"
                                    className="pl-7"
                                />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="photo">Equipment Photo</Label>
                             <Input id="photo" type="file" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleAddEquipment}>Add Equipment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
