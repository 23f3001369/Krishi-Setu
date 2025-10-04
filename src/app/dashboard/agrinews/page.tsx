
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

const newsArticles = [
    {
        id: 1,
        title: "Govt raises paddy MSP by 5.35% to Rs 2,300/quintal for 2024-25",
        source: "The Economic Times",
        date: "2024-07-29",
        snippet: "The government on Wednesday hiked the minimum support price (MSP) for paddy by 5.35 per cent to Rs 2,300 per quintal for the 2024-25 kharif marketing season.",
        link: "https://economictimes.indiatimes.com/news/economy/agriculture/govt-raises-paddy-msp-by-5-35-to-rs-2300/quintal-for-2024-25/articleshow/111105973.cms"
    },
    {
        id: 2,
        title: "Heatwave impact: Agriculture ministry advises farmers to adopt short-duration crop varieties",
        source: "Hindustan Times",
        date: "2024-07-28",
        snippet: "The Union agriculture ministry has asked farmers to adopt short-duration and heat-tolerant crop varieties to mitigate the impact of the prevailing heatwave conditions in many parts of the country.",
        link: "https://www.hindustantimes.com/india-news/heatwave-impact-agriculture-ministry-advises-farmers-to-adopt-short-duration-crop-varieties-101684857213456.html"
    },
    {
        id: 3,
        title: "India's monsoon rains 20% below average in June, raises crop concerns",
        source: "Reuters",
        date: "2024-07-27",
        snippet: "India's monsoon rains were 20% below average in June, the weather department said on Friday, raising concerns for the agricultural sector which depends on the seasonal rainfall.",
        link: "https://www.reuters.com/world/india/indias-monsoon-rains-20-below-average-june-raises-crop-concerns-2024-06-30/"
    },
    {
        id: 4,
        title: "Agritech startup funding drops 45% in FY24 amid funding winter",
        source: "Business Standard",
        date: "2024-07-26",
        snippet: "Funding for agritech startups in India fell by 45 per cent in the financial year 2023-24 (FY24) to $799.5 million from $1.45 billion in FY23, according to a report.",
        link: "https://www.business-standard.com/companies/start-ups/agritech-startup-funding-drops-45-in-fy24-amid-funding-winter-report-124052100613_1.html"
    },
    {
        id: 5,
        title: "Centre launches new portal for agri-drone subsidies",
        source: "The Hindu BusinessLine",
        date: "2024-07-25",
        snippet: "The Centre has launched a new portal for farmers to apply for subsidies on agricultural drones, which are increasingly being used for purposes such as spraying pesticides and monitoring crop health.",
        link: "https://www.thehindubusinessline.com/economy/agri-business/centre-launches-new-portal-for-agri-drone-subsidies/article68228308.ece"
    },
    {
        id: 6,
        title: "NABARD projects ₹2.43-lakh crore credit potential for Punjab",
        source: "The Tribune",
        date: "2024-07-24",
        snippet: "The National Bank for Agriculture and Rural Development (NABARD) has projected a credit potential of ₹2.43-lakh crore for Punjab for the financial year 2024-25.",
        link: "https://www.tribuneindia.com/news/punjab/nabard-projects-2-43-lakh-crore-credit-potential-for-punjab-578942"
    },
    {
        id: 7,
        title: "How AI is transforming Indian agriculture",
        source: "Forbes India",
        date: "2024-07-23",
        snippet: "From crop monitoring to pest detection, artificial intelligence is revolutionising farming practices across India, leading to better yields and sustainability.",
        link: "https://www.forbesindia.com/article/explainers/how-ai-is-transforming-indian-agriculture/89959/1"
    },
    {
        id: 8,
        title: "Climate change to impact nutritional quality of rice, wheat: Study",
        source: "Down To Earth",
        date: "2024-07-22",
        snippet: "A recent study indicates that rising carbon dioxide levels due to climate change could reduce the nutritional value of staple crops like rice and wheat.",
        link: "https://www.downtoearth.org.in/news/agriculture/climate-change-to-impact-nutritional-quality-of-rice-wheat-study-92488"
    },
    {
        id: 9,
        title: "Government sets up committee to promote export of organic products",
        source: "Financial Express",
        date: "2024-07-21",
        snippet: "The commerce ministry has set up a committee to suggest ways to promote the export of organic products from the country.",
        link: "https://www.financialexpress.com/economy/government-sets-up-committee-to-promote-export-of-organic-products/3201415/"
    },
    {
        id: 10,
        title: "Successful trial of digital crop survey in 12 states",
        source: "Press Information Bureau",
        date: "2024-07-20",
        snippet: "The government has successfully completed a trial of a digital crop survey in 12 states, which aims to provide more accurate and timely data on crop acreage and yields.",
        link: "https://pib.gov.in/PressReleaseIframePage.aspx?PRID=1956102"
    }
];

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
        <h1 className="text-3xl font-bold tracking-tight font-headline">AgriNews & Updates</h1>
        <p className="text-muted-foreground">Your daily source for agricultural news, market prices, and government schemes.</p>
      </div>
      
       {heroImage && (
        <div className="relative h-48 w-full overflow-hidden rounded-lg">
            <Image src={heroImage.imageUrl} alt={heroImage.description} data-ai-hint={heroImage.imageHint} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <h2 className="text-4xl font-bold text-white font-headline">Stay Informed, Stay Ahead</h2>
            </div>
        </div>
      )}

      <Tabs defaultValue="news" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="news"><Rss className="mr-2 h-4 w-4"/>Agri News</TabsTrigger>
          <TabsTrigger value="mandi"><Scale className="mr-2 h-4 w-4"/>Mandi Prices</TabsTrigger>
          <TabsTrigger value="schemes"><Landmark className="mr-2 h-4 w-4"/>Govt. Schemes</TabsTrigger>
        </TabsList>
        <TabsContent value="news" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Latest Agricultural News</CardTitle>
              <CardDescription>Top headlines from the world of agriculture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                {newsArticles.map(article => (
                    <div key={article.id} className="p-4 border rounded-lg hover:bg-muted/50">
                        <h3 className="font-semibold text-lg">{article.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>{article.source}</span>
                            <span>{new Date(article.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm mt-2 text-muted-foreground">{article.snippet}</p>
                        <Button variant="link" asChild className="px-0 h-auto mt-2">
                           <Link href={article.link} target="_blank" rel="noopener noreferrer">
                                Read More <ArrowRight className="ml-1 h-4 w-4"/>
                           </Link>
                        </Button>
                    </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
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
