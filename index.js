import { GoogleGenAI } from "@google/genai";

// This is a placeholder for the HTML content. 
// In a real Cloudflare deployment, you would typically serve a static HTML file.
// For simplicity in this example, we are embedding it.
// Note: The HTML content is provided in the `index.html` file. 
// This worker assumes that content is available to it. For this playground,
// we will fetch it from a placeholder URL, but in a real project,
// you would use Cloudflare's static asset handling.
const HTML_CONTENT_PLACEHOLDER = `
<!DOCTYPE html>
<html>
  <head>
    <title>Gemini AI Playground</title>
  </head>
  <body>
    <h1>Loading...</h1>
    <p>If you see this message, the worker failed to load the HTML content. Please ensure index.html is deployed as a static asset.</p>
  </body>
</html>
`;


export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve the frontend HTML for the root path
    if (url.pathname === '/') {
       // In a real scenario with Cloudflare Pages, static assets are served automatically.
       // This code is a fallback for a worker-only environment.
       // We'll return a placeholder and assume the platform serves the real index.html.
       // The user should upload the provided index.html as a static asset.
      return new Response(HTML_CONTENT_PLACEHOLDER, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Handle the simple prompt API endpoint
    if (url.pathname === '/api/simple' && request.method === 'POST') {
      return handleSimpleApi(request, env);
    }

    // Handle the chat API endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChatApi(request, env);
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function handleApiRequest(request, env, handler) {
    if (!env.API_KEY) {
        return new Response(JSON.stringify({ error: 'API_KEY is not configured in worker secrets.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    try {
        const ai = new GoogleGenAI({ apiKey: env.API_KEY });
        return await handler(request, ai);
    } catch (e) {
        console.error('API Error:', e);
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

async function handleSimpleApi(request, env) {
    return handleApiRequest(request, env, async (req, ai) => {
        const { prompt } = await req.json();
        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required.' }), { status: 400 });
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return new Response(JSON.stringify({ text: response.text }), {
            headers: { 'Content-Type': 'application/json' },
        });
    });
}

async function handleChatApi(request, env) {
     return handleApiRequest(request, env, async (req, ai) => {
        const { history } = await req.json();
        if (!history) {
            return new Response(JSON.stringify({ error: 'Chat history is required.' }), { status: 400 });
        }

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are a helpful and friendly assistant.',
            },
            history: history.slice(0, -1) // Send all but the last message for context
        });

        const lastMessage = history[history.length - 1];
        const result = await chat.sendMessage({ message: lastMessage.parts[0].text });
        
        return new Response(JSON.stringify({ text: result.text }), {
            headers: { 'Content-Type': 'application/json' },
        });
    });
}

