import React, { useState, useCallback } from 'react';
import { ai } from '../services/geminiService';
import { SpinnerIcon, GenerateIcon } from './icons';

const e = React.createElement;

const SimplePrompt = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
        if (!process.env.API_KEY || process.env.API_KEY === "MISSING_API_KEY") {
            throw new Error("Gemini API key is not configured. This application must be run in an environment where the API key is provided.");
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

  return e('div', { className: "p-6 sm:p-8" },
    e('h2', { className: "text-2xl font-bold text-sky-400 mb-4" }, "Simple Prompt"),
    e('div', { className: "flex flex-col gap-4" },
      e('textarea', {
        value: prompt,
        onChange: (e) => setPrompt(e.target.value),
        placeholder: "e.g., Tell me a joke about Cloudflare",
        className: "w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow",
        disabled: isLoading,
      }),
      e('button', {
        onClick: handleGenerate,
        disabled: isLoading || !prompt.trim(),
        className: "flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 self-end",
      },
        isLoading ? e(SpinnerIcon) : e(GenerateIcon),
        isLoading ? 'Generating...' : 'Generate'
      )
    ),
    e('div', { className: "mt-6" },
      error && e('div', { className: "p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg" }, error),
      response && e('div', { className: "mt-4 p-4 bg-slate-900/70 border border-slate-700 rounded-lg" },
        e('h3', { className: "text-lg font-semibold text-sky-300 mb-2" }, "Response"),
        e('p', { className: "text-slate-300 whitespace-pre-wrap font-mono" }, response)
      )
    )
  );
};

export default SimplePrompt;