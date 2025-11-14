import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ai } from '../services/geminiService';
import { type Message, type Role } from '../types';
import { SendIcon, SpinnerIcon } from './icons';

// Infer the chat session type from the `ai.chats.create` method.
// This is more robust than a direct type import.
type GeminiChat = ReturnType<typeof ai.chats.create>;

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<GeminiChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the chat session once.
    if (!process.env.API_KEY || process.env.API_KEY === "MISSING_API_KEY") {
        setError("Gemini API key is not configured. Please set the API_KEY environment variable.");
        return;
    }
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a helpful and friendly assistant.',
      },
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await chatRef.current.sendMessage({ message: input });
      const modelMessage: Message = { role: 'model', text: result.text };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to send message: ${errorMessage}`);
      console.error(e);
      // Remove the user's message if the API call fails, so they can try again.
      setMessages(prev => prev.slice(0, prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  }, [input]);
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  const MessageBubble = ({ role, text }: { role: Role; text: string }) => {
    const isUser = role === 'user';
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl ${isUser ? 'bg-sky-700 rounded-br-lg' : 'bg-slate-700 rounded-bl-lg'}`}>
          <p className="text-white whitespace-pre-wrap">{text}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <MessageBubble key={index} role={msg.role} text={msg.text} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex items-center gap-2 max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-lg">
               <SpinnerIcon />
               <p className="text-white">Thinking...</p>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700">
        {error && <div className="mb-2 p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm">{error}</div>}
        <div className="flex items-center gap-2 bg-slate-700 rounded-lg p-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-transparent p-2 text-slate-100 placeholder-slate-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-sky-600 rounded-md text-white hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
