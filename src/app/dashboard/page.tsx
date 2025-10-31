

import WeatherForecast from "@/components/dashboard/weather-forecast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Sun, Wind, Tractor, ShoppingCart, Users, Database } from "lucide-react";
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome back, Farmer!</h1>
        <p className="text-muted-foreground">Here's an overview of your farm's status and today's forecast.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Active Crops</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">Corn, Soybeans</div>
            <p className="text-xs text-muted-foreground">2 of 4 fields in use</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Soil Moisture</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">45%</div>
            <p className="text-xs text-muted-foreground">Optimal range: 40-60%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Next Harvest</CardTitle>
            <Sun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">in 28 days</div>
            <p className="text-xs text-muted-foreground">Estimated for Corn</p>
          </CardContent>
        </Card>
      </div>

      <WeatherForecast />
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Upcoming Features</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShoppingCart /> Agri Bazar</CardTitle>
              <CardDescription>A marketplace to find nearby shops for all your agricultural needs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm">What it does:</h4>
                <p className="text-sm text-muted-foreground">Agri Bazar will allow you to search for local suppliers of seeds, fertilizers, and other farm essentials, view their product categories, and get contact information.</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">How it will be implemented:</h4>
                <p className="text-sm text-muted-foreground">This feature will be built using a client-side interface to search and filter a list of mock supplier data. In a full implementation, this data would come from a Firestore database collection of registered suppliers.</p>
              </div>
            </CardContent>
            <CardFooter>
               <Button variant="secondary" asChild>
                <Link href="/dashboard/agri-bazar">Explore</Link>
               </Button>
            </CardFooter>
          </Card>
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Tractor /> Krishi Yantra Mitra</CardTitle>
              <CardDescription>A peer-to-peer equipment rental portal to book machines on demand.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm">What it does:</h4>
                <p className="text-sm text-muted-foreground">This feature will connect farmers, allowing them to rent out their idle equipment or book machines from others in their area.</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">How it will be implemented:</h4>
                 <p className="text-sm text-muted-foreground">The implementation will involve creating a new Firestore collection for equipment listings. Farmers will be able to add, view, and search for equipment, with rules ensuring they can only manage their own listings.</p>
              </div>
            </CardContent>
             <CardFooter>
               <Button variant="secondary" asChild>
                 <Link href="/dashboard/krishi-yantra-mitra">Explore</Link>
               </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

    </div>
  );
}
