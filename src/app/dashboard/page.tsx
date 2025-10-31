

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
      
    </div>
  );
}
