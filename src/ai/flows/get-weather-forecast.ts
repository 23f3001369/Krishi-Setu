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

    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=metric`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }
    const data = await response.json();

    const getDayString = (dt: number, index: number) => {
        if (index === 0) return 'Today';
        if (index === 1) return 'Tomorrow';
        return new Date(dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
    }

    return {
      current: {
        temp: Math.round(data.current.temp),
        condition: data.current.weather[0].main,
        icon: data.current.weather[0].icon,
        wind: Math.round(data.current.wind_speed * 3.6), // m/s to km/h
        humidity: data.current.humidity,
      },
      daily: data.daily.slice(0, 7).map((day: any, index: number) => ({
        day: getDayString(day.dt, index),
        temp: Math.round(day.temp.day),
        icon: day.weather[0].icon,
      })),
      alerts: (data.alerts || []).map((alert: any) => ({
        title: alert.event,
        description: alert.description,
      })),
    };
  }
);
