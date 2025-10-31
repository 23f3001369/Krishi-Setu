
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sun, Cloud, CloudRain, CloudSun, AlertTriangle, Wind, Droplets, History, Cloudy, Snowflake, CloudLightning, Tornado, CloudFog } from "lucide-react";
import { Alert, AlertTitle, AlertDescription as AlertDescriptionShadcn } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from '@/components/ui/skeleton';
import { getWeatherForecast, type WeatherOutput } from '@/ai/flows/get-weather-forecast';


const iconMap: { [key: string]: React.ElementType } = {
    '01d': Sun, '01n': Sun,
    '02d': CloudSun, '02n': CloudSun,
    '03d': Cloud, '03n': Cloud,
    '04d': Cloudy, '04n': Cloudy,
    '09d': CloudRain, '09n': CloudRain,
    '10d': CloudRain, '10n': CloudRain,
    '11d': CloudLightning, '11n': CloudLightning,
    '13d': Snowflake, '13n': Snowflake,
    '50d': CloudFog, '50n': CloudFog,
};


export default function WeatherForecast() {
    const [weather, setWeather] = useState<WeatherOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Default location (e.g., Nashik, India). In a real app, this would be user-configurable.
        const location = { lat: 20.0, lon: 73.78 }; 

        getWeatherForecast(location)
            .then(data => {
                setWeather(data);
            })
            .catch(err => {
                console.error(err);
                setError(err.message || 'Could not fetch weather data.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

  const CurrentIcon = weather ? iconMap[weather.current.icon] || Tornado : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather Forecast</CardTitle>
        <CardDescription>Current conditions and 7-day outlook for your farm location.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
            <WeatherSkeleton />
        ) : error ? (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Fetching Weather</AlertTitle>
                <AlertDescriptionShadcn>
                    {error}
                    {error.includes('API key') && ' Please add your OpenWeather API key to the .env.local file.'}
                </AlertDescriptionShadcn>
            </Alert>
        ) : weather ? (
          <>
            {weather.alerts.map((alert, index) => (
            <Alert key={index} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescriptionShadcn>{alert.description}</AlertDescriptionShadcn>
            </Alert>
            ))}

            <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center text-center p-6 bg-muted/50 rounded-lg">
                {CurrentIcon && <CurrentIcon className="w-20 h-20 text-accent" />}
                <div className="text-6xl font-bold mt-2">{weather.current.temp}°C</div>
                <div className="text-muted-foreground">{weather.current.condition}</div>
                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><Wind size={16} /> {weather.current.wind} km/h</div>
                    <div className="flex items-center gap-1"><Droplets size={16} /> {weather.current.humidity}%</div>
                </div>
            </div>
            <div className="md:col-span-2 space-y-4 flex flex-col justify-center">
                 <div>
                    <h3 className="font-semibold mb-2 text-lg">7-Day Forecast</h3>
                    <div className="grid grid-cols-7 gap-2">
                        {weather.daily.map((day) => {
                            const Icon = iconMap[day.icon] || Tornado;
                            return (
                            <div key={day.day} className="flex flex-col items-center p-2 rounded-lg hover:bg-muted text-center space-y-1">
                                <div className="font-semibold text-sm">{day.day}</div>
                                <Icon className="w-8 h-8 text-primary" />
                                <div className="text-muted-foreground">{day.temp}°</div>
                            </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}


function WeatherSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg space-y-2">
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <Skeleton className="h-16 w-32" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <div className="md:col-span-2 space-y-4">
                     <div>
                        <h3 className="font-semibold mb-2 text-lg">7-Day Forecast</h3>
                         <div className="grid grid-cols-7 gap-2">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="flex flex-col items-center space-y-2 p-2">
                                    <Skeleton className="h-5 w-8" />
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <Skeleton className="h-5 w-6" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
