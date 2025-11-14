
import React, { useState, useCallback } from 'react';
import { ai } from '../services/geminiService';
import { SpinnerIcon, GenerateIcon } from './icons';

const SimplePrompt: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
        if (!process.env.API_KEY || process.env.API_KEY === "MISSING_API_KEY") {
            throw new Error("Gemini API key is not configured. Please set the API_KEY environment variable.");
        }
      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setResponse(geminiResponse.text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate content: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-sky-400 mb-4">Simple Prompt</h2>
      <div className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Tell me a joke about Cloudflare"
          className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 self-end"
        >
          {isLoading ? <SpinnerIcon /> : <GenerateIcon />}
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <div className="mt-6">
        {error && <div className="p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">{error}</div>}
        
        {response && (
          <div className="mt-4 p-4 bg-slate-900/70 border border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold text-sky-300 mb-2">Response</h3>
            <p className="text-slate-300 whitespace-pre-wrap font-mono">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplePrompt;
