
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
import { Search, MapPin, Phone, Star, Tractor, Wheat, Crosshair, ShoppingCart, X } from "lucide-react";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const heroImage = PlaceHolderImages.find(p => p.id === "agri-bazar-hero");

const initialSuppliers = [
  {
    id: 1,
    name: 'Gupta Fertilizers & Seeds',
    address: '12, Main Market, Rampur',
    phone: '9876543210',
    rating: 4.5,
    distance: '2.5 km',
    products: ['Fertilizers', 'Seeds', 'Pesticides'],
    image: PlaceHolderImages.find(p => p.id === 'learning-hub-article-3'),
    inventory: [
        { id: 'prod1', name: 'Urea Fertilizer (45kg)', price: 300 },
        { id: 'prod2', name: 'DAP Fertilizer (45kg)', price: 1350 },
        { id: 'prod3', name: 'Pioneer Corn Seeds (5kg)', price: 1200 },
    ]
  },
  {
    id: 2,
    name: 'Kisan Agri Tools',
    address: 'Shop 4, Tractor Market',
    phone: '9871234560',
    rating: 4.8,
    distance: '5 km',
    products: ['Equipment', 'Tools', 'Shovels', 'Hoes', 'Rakes'],
     image: PlaceHolderImages.find(p => p.id === 'learning-hub-video-2'),
     inventory: [
        { id: 'prod4', name: 'Hand Hoe', price: 250 },
        { id: 'prod5', name: 'Garden Rake', price: 400 },
        { id: 'prod6', name: 'Spade', price: 350 },
     ]
  },
  {
    id: 3,
    name: 'Modern Agro Solutions',
    address: 'NH-24, Near Petrol Pump',
    phone: '9988776655',
    rating: 4.2,
    distance: '7 km',
    products: ['Drip Irrigation', 'Fertilizers', 'Seeds'],
    image: PlaceHolderImages.find(p => p.id === 'learning-hub-article-2'),
    inventory: [
        { id: 'prod7', name: 'Drip Irrigation Kit (1 acre)', price: 15000 },
        { id: 'prod8', name: 'NPK Fertilizer (50kg)', price: 1500 },
    ]
  }
];

type Supplier = typeof initialSuppliers[0];

export default function AgriBazarPage() {
    const [suppliers, setSuppliers] = useState(initialSuppliers);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleViewProducts = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsDialogOpen(true);
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Agri Bazar</h1>
                <p className="text-muted-foreground">Find nearby shops for your agricultural needs.</p>
            </div>

            {heroImage && (
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                    <Image src={heroImage.imageUrl} alt={heroImage.description} data-ai-hint={heroImage.imageHint} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <h2 className="text-4xl font-bold text-white font-headline">Your One-Stop Agri Shop</h2>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Find Products & Suppliers</CardTitle>
                    <CardDescription>Search for seeds, fertilizers, equipment, and more from local suppliers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                             <Label htmlFor="product-search">What are you looking for?</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="product-search" placeholder="e.g., Urea, Wheat Seeds..." className="pl-8" />
                            </div>
                        </div>
                         <div className="space-y-2">
                             <Label htmlFor="location-search">Location</Label>
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
                        Search Suppliers
                    </Button>
                </CardFooter>
            </Card>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {suppliers.map(supplier => (
                    <Card key={supplier.id} className="flex flex-col">
                        {supplier.image &&
                            <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                                <Image src={supplier.image.imageUrl} alt={supplier.name} data-ai-hint={supplier.image.imageHint} fill className="object-cover" />
                            </div>
                        }
                        <CardHeader>
                            <CardTitle>{supplier.name}</CardTitle>
                            <div className="flex justify-between items-center text-sm text-muted-foreground pt-1">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {supplier.rating}
                                </div>
                                <span className="font-semibold">{supplier.distance} away</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3">
                             <div className="flex items-start gap-2 text-sm">
                                <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                <span>{supplier.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{supplier.phone}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {supplier.products.map(product => (
                                    <Badge key={product} variant="secondary">{product}</Badge>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleViewProducts(supplier)}>View Products &amp; Order</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    {selectedSupplier && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Products at {selectedSupplier.name}</DialogTitle>
                                <DialogDescription>
                                    Browse available products. Contact the supplier directly to order.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product Name</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-right sr-only">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedSupplier.inventory.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right">₹{item.price.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                 <Button variant="outline" size="sm">Add to Cart</Button>
                                            </TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
                               <p className="text-sm text-muted-foreground flex items-center gap-2">
                                   <Phone className="w-4 h-4" /> {selectedSupplier.phone}
                               </p>
                               <Button><ShoppingCart className="mr-2 h-4 w-4"/> Proceed to Checkout</Button>
                           </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    )
