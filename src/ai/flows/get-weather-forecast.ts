
'use server';
/**
 * @fileOverview A server-side flow to fetch weather data from OpenWeather API.
 *
 * - getWeatherForecast - Fetches current weather and 7-day forecast.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WeatherInputSchema = z.object({
  lat: z.number().describe('Latitude for the weather forecast.'),
  lon: z.number().describe('Longitude for the weather forecast.'),
});

const CurrentWeatherSchema = z.object({
  temp: z.number(),
  condition: z.string(),
  icon: z.string(),
  wind: z.number(),
  humidity: z.number(),
});

const DailyForecastSchema = z.object({
  day: z.string(),
  temp: z.number(),
  icon: z.string(),
});

const WeatherOutputSchema = z.object({
  current: CurrentWeatherSchema,
  daily: z.array(DailyForecastSchema),
  alerts: z.array(z.object({ title: z.string(), description: z.string() })),
});

export type WeatherOutput = z.infer<typeof WeatherOutputSchema>;

export async function getWeatherForecast(
  input: z.infer<typeof WeatherInputSchema>
): Promise<WeatherOutput> {
  return getWeatherForecastFlow(input);
}

const getWeatherForecastFlow = ai.defineFlow(
  {
    name: 'getWeatherForecastFlow',
    inputSchema: WeatherInputSchema,
    outputSchema: WeatherOutputSchema,
  },
  async ({ lat, lon }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === 'YOUR_OPENWEATHER_API_KEY') {
      throw new Error('OpenWeather API key is not configured.');
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }
    const data = await response.json();

    if (data.cod !== "200") {
        throw new Error(data.message || "City not found");
    }

    const getDayString = (date: Date, index: number) => {
        if (index === 0) return 'Today';
        if (index === 1) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    // Process forecast data to group by day
    const dailyData: { [key: string]: { temps: number[], icons: string[] } } = {};
    data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        if (!dailyData[date]) {
            dailyData[date] = { temps: [], icons: [] };
        }
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].icons.push(item.weather[0].icon);
    });

    const dailyForecasts = Object.keys(dailyData).slice(0, 7).map((date, index) => {
        const dayInfo = dailyData[date];
        const avgTemp = dayInfo.temps.reduce((a, b) => a + b, 0) / dayInfo.temps.length;
        
        // Find most frequent icon for the day
        const iconCounts = dayInfo.icons.reduce((acc, icon) => {
            acc[icon] = (acc[icon] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const mostFrequentIcon = Object.keys(iconCounts).reduce((a, b) => iconCounts[a] > iconCounts[b] ? a : b);

        return {
            day: getDayString(new Date(date), index),
            temp: Math.round(avgTemp),
            icon: mostFrequentIcon.replace('n', 'd'), // Prefer day icons
        };
    });

    const currentData = data.list[0];

    return {
      current: {
        temp: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        icon: currentData.weather[0].icon,
        wind: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
        humidity: currentData.main.humidity,
      },
      daily: dailyForecasts,
      alerts: (data.alerts || []).map((alert: any) => ({ // This might be empty with the new endpoint
        title: alert.event,
        description: alert.description,
      })),
    };
  }
);
