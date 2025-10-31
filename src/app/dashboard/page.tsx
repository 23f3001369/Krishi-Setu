

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

      <WeatherForecast />
      
    </div>
  );
}
