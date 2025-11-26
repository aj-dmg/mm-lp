import { GoogleGenAI } from "@google/genai";

export const suggestItinerary = async (details: {
  pickup: string;
  dropoff: string;
  passengers: number;
  hours: number;
}): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API_KEY is not configured. Please set the environment variable.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Suggest a fun, detailed ${details.hours}-hour party bus itinerary for a group of ${details.passengers} people.
      The trip starts at "${details.pickup}" and ends at "${details.dropoff}".
      The tone should be exciting and appealing for a party atmosphere.
      Format the response as a markdown list with timestamps.
      
      Example:
      - **7:00 PM:** Kick off the night with pickup at [Pickup Location].
      - **7:30 PM - 8:30 PM:** Cruise to a scenic viewpoint for photos.
      ...
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I couldn't generate an itinerary at the moment. Please try again later.";
  }
};