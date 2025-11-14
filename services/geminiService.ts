
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  // The app will not work without an API key.
  // We log an error, and the UI will show a message.
  console.error("API_KEY environment variable not set.");
}

// Initialize with a placeholder key if it's not set, to avoid crashing the app.
// The components will handle the case where the key is missing.
export const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" });
