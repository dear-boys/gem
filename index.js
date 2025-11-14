import { GoogleGenAI } from "@google/genai";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // This worker should ONLY handle API routes. 
    // Cloudflare Pages will automatically serve the static `index.html` file for non-API routes.
    
    // Handle the simple prompt API endpoint
    if (url.pathname === '/api/simple' && request.method === 'POST') {
      return handleSimpleApi(request, env);
    }

    // Handle the chat API endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChatApi(request, env);
    }

    // Let Cloudflare Pages handle all other requests (like serving the HTML, CSS, etc.)
    // by not returning a response here. The request will "fall through" to the static asset handler.
    // If running in a worker-only environment, you might return a 404 here.
    return new Response('Not Found. This worker only handles /api/simple and /api/chat.', { status: 404 });
  },
};

async function handleApiRequest(request, env, handler) {
    if (!env.API_KEY) {
        return new Response(JSON.stringify({ error: 'API_KEY is not configured in worker secrets.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
    }
    try {
        const ai = new GoogleGenAI({ apiKey: env.API_KEY });
        return await handler(request, ai);
    } catch (e) {
        console.error('API Error:', e);
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
    }
}

async function handleSimpleApi(request, env) {
    return handleApiRequest(request, env, async (req, ai) => {
        const { prompt } = await req.json();
        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required.' }), { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return new Response(JSON.stringify({ text: response.text }), {
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
    });
}

async function handleChatApi(request, env) {
     return handleApiRequest(request, env, async (req, ai) => {
        const { history } = await req.json();
        if (!history || !Array.isArray(history)) {
            return new Response(JSON.stringify({ error: 'Chat history is required and must be an array.' }), { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
        }

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are a helpful and friendly assistant.',
            },
            history: history.slice(0, -1) // Send all but the last user message for context
        });

        const lastMessage = history[history.length - 1];
        const lastMessageText = lastMessage?.parts?.[0]?.text;

        if (!lastMessageText) {
             return new Response(JSON.stringify({ error: 'The last message in history is invalid.' }), { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
        }

        const result = await chat.sendMessage(lastMessageText);
        
        return new Response(JSON.stringify({ text: result.text }), {
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
    });
}