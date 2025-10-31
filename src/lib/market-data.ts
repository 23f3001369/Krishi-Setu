
// This file simulates a data source for crop prices.
// In a real-world application, this would fetch data from an API.

const marketData: Record<string, Record<string, number>> = {
    'punjab': {
        'corn': 1485,
        'wheat': 2275,
        'rice': 3100,
    },
    'maharashtra': {
        'tomato': 2500,
        'onion': 1800,
        'sugarcane': 3150,
    },
    'indore': {
        'soybean': 4800,
        'wheat': 2300,
    },
    'nashik': {
        'onion': 2000,
        'tomato': 2800,
        'grapes': 5000,
    }
};

/**
 * Simulates fetching the current price for a crop in a specific market.
 * The matching is case-insensitive.
 * @param crop The name of the crop.
 * @param location The market location (state or city).
 * @returns An object containing the price, or a default if not found.
 */
export async function getCropPrice(crop: string, location: string): Promise<{ price: number }> {
    const locationKey = location.toLowerCase();
    const cropKey = crop.toLowerCase();

    const locationData = marketData[locationKey];
    
    if (locationData && locationData[cropKey]) {
        return { price: locationData[cropKey] };
    }

    // Return a default/average price if specific data isn't found
    return { price: 2000 };
}
