'use server';

import { aiCropRecommendation } from '@/ai/flows/ai-crop-recommendation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Leaf, Lightbulb } from 'lucide-react';

type State = {
  data?: {
    optimalCrops: string;
    reasoning: string;
  };
  error?: string;
  loading: boolean;
};

async function recommendCrops(
  prevState: State,
  formData: FormData
): Promise<State> {
  const soilAnalysis = formData.get('soilAnalysis') as string;
  const realTimeWeatherConditions = formData.get(
    'realTimeWeatherConditions'
  ) as string;
  const seasonalData = formData.get('seasonalData') as string;

  if (!soilAnalysis || !realTimeWeatherConditions || !seasonalData) {
    return { ...prevState, loading: false, error: 'All fields are required.' };
  }

  try {
    const result = await aiCropRecommendation({
      soilAnalysis,
      realTimeWeatherConditions,
      seasonalData,
    });
    return { data: result, loading: false };
  } catch (e) {
    console.error(e);
    return {
      ...prevState,
      loading: false,
      error: 'Failed to get recommendations. Please try again.',
    };
  }
}

// A trick to use `useFormState` on the page and re-render the server component.
// We are not actually using `useFormState` here, but this is how you would
// if this was a client component.
export default async function CropRecommendationPage(props: {
  searchParams: {
    state: string;
  };
}) {
  const { state: stateParam } = props.searchParams;
  const state: State = stateParam ? JSON.parse(stateParam) : { loading: false };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          AI Crop Recommendation
        </h1>
        <p className="text-muted-foreground">
          Get expert advice on what to plant next based on your farm's data.
        </p>
      </div>

      <Card>
        <form
          action={async (formData) => {
            const result = await recommendCrops(state, formData);
            const searchParams = new URLSearchParams();
            searchParams.set('state', JSON.stringify(result));
            // A simple way to re-render the page with new state.
            // In a real app, you might use `router.refresh()` from a client component.
            const { headers } = await import('next/headers');
            const pathname = headers().get('next-url');
            const { redirect } = await import('next/navigation');
            redirect(`${pathname}?${searchParams.toString()}`);
          }}
        >
          <CardHeader>
            <CardTitle>Farm Data</CardTitle>
            <CardDescription>
              Enter the latest data from your farm to receive tailored crop
              recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="soilAnalysis">Soil Analysis</Label>
              <Textarea
                name="soilAnalysis"
                placeholder="e.g., pH: 6.8, Nitrogen: High, Phosphorus: Medium, Potassium: Low, Organic Matter: 3.5%"
                id="soilAnalysis"
                required
              />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="realTimeWeatherConditions">
                Real-time Weather Conditions
              </Label>
              <Textarea
                name="realTimeWeatherConditions"
                placeholder="e.g., Temp: 25°C, Humidity: 70%, Wind: 10km/h, Last rainfall: 2 days ago"
                id="realTimeWeatherConditions"
                required
              />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="seasonalData">Seasonal Data</Label>
              <Textarea
                name="seasonalData"
                placeholder="e.g., Current season: Late Spring, Average rainfall for this period: 50mm, Frost risk: Low"
                id="seasonalData"
                required
              />
            </div>
            {state.error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit">
              {state.loading ? 'Getting Recommendations...' : 'Get Recommendations'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {state.data && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Results</CardTitle>
            <CardDescription>
              Based on the data provided, here are the suggested crops.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-primary/5 border-primary/20">
              <Leaf className="h-4 w-4 !text-primary" />
              <AlertTitle className="text-primary">
                Optimal Crops
              </AlertTitle>
              <AlertDescription>
                <p className="text-lg font-semibold">{state.data.optimalCrops}</p>
              </AlertDescription>
            </Alert>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Reasoning</AlertTitle>
              <AlertDescription>
                <p>{state.data.reasoning}</p>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
