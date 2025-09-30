"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sun, Cloud, CloudRain, CloudSun, AlertTriangle, Wind, Droplets } from "lucide-react";
import { Alert, AlertTitle, AlertDescription as AlertDescriptionShadcn } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Mock Data
const mockCurrentWeather = {
  temp: 24,
  condition: "Partly Cloudy",
  icon: CloudSun,
  wind: 12,
  humidity: 65,
  description: "Pleasant weather with a light breeze."
};

const mockHourlyForecast = [
  { time: "3 PM", temp: 25, icon: CloudSun },
  { time: "4 PM", temp: 24, icon: Cloud },
  { time: "5 PM", temp: 23, icon: Cloud },
  { time: "6 PM", temp: 22, icon: CloudRain },
  { time: "7 PM", temp: 21, icon: CloudRain },
];

const mockWeeklyForecast = [
  { day: "Tue", temp: 26, icon: Sun },
  { day: "Wed", temp: 22, icon: CloudRain },
  { day: "Thu", temp: 24, icon: CloudSun },
  { day: "Fri", temp: 27, icon: Sun },
  { day: "Sat", temp: 28, icon: Sun },
  { day: "Sun", temp: 25, icon: CloudRain },
  { day: "Mon", temp: 23, icon: CloudSun },
];

const mockAlerts = [
  {
    title: "Heavy Rain Expected",
    action: "Ensure proper drainage for fields to prevent waterlogging. Consider delaying irrigation.",
    level: "warning"
  }
];


export default function WeatherForecast() {
  const CurrentIcon = mockCurrentWeather.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather Forecast</CardTitle>
        <CardDescription>Current conditions and 7-day outlook for your farm location.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {mockAlerts.map((alert, index) => (
          <Alert key={index} variant={alert.level === 'warning' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescriptionShadcn>{alert.action}</AlertDescriptionShadcn>
          </Alert>
        ))}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center justify-center text-center p-6 bg-muted/50 rounded-lg">
            <CurrentIcon className="w-20 h-20 text-accent" />
            <div className="text-6xl font-bold mt-2">{mockCurrentWeather.temp}°C</div>
            <div className="text-muted-foreground">{mockCurrentWeather.condition}</div>
            <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><Wind size={16} /> {mockCurrentWeather.wind} km/h</div>
                <div className="flex items-center gap-1"><Droplets size={16} /> {mockCurrentWeather.humidity}%</div>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
              <div>
                  <h3 className="font-semibold mb-2 text-lg">Hourly Forecast</h3>
                   <div className="flex justify-between items-center space-x-2 bg-muted/50 p-4 rounded-lg">
                    {mockHourlyForecast.map((hour) => {
                        const Icon = hour.icon;
                        return (
                        <div key={hour.time} className="flex flex-col items-center space-y-1">
                            <div className="text-sm text-muted-foreground">{hour.time}</div>
                            <Icon className="w-8 h-8 text-primary" />
                            <div className="font-semibold">{hour.temp}°</div>
                        </div>
                        );
                    })}
                  </div>
              </div>
          </div>
        </div>

        <Separator />
        
        <div>
            <h3 className="font-semibold mb-2 text-lg">7-Day Forecast</h3>
            <div className="flex justify-between items-center space-x-2">
                {mockWeeklyForecast.map((day) => {
                    const Icon = day.icon;
                    return (
                    <div key={day.day} className="flex flex-col items-center p-2 rounded-lg hover:bg-muted w-full text-center space-y-1">
                        <div className="font-semibold">{day.day}</div>
                        <Icon className="w-8 h-8 text-accent" />
                        <div className="text-muted-foreground">{day.temp}°</div>
                    </div>
                    );
                })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
