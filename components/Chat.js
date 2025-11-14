import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ai } from '../services/geminiService';
import { SendIcon, SpinnerIcon } from './icons';

const e = React.createElement;

const MessageBubble = ({ role, text }) => {
  const isUser = role === 'user';
  return e('div', { className: `flex ${isUser ? 'justify-end' : 'justify-start'}` },
    e('div', { className: `max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl ${isUser ? 'bg-sky-700 rounded-br-lg' : 'bg-slate-700 rounded-bl-lg'}` },
      e('p', { className: "text-white whitespace-pre-wrap" }, text)
    )
  );
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize the chat session once.
    if (!process.env.API_KEY || process.env.API_KEY === "MISSING_API_KEY") {
        setError("Gemini API key is not configured. This application must be run in an environment where the API key is provided.");
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

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await chatRef.current.sendMessage({ message: input });
      const modelMessage = { role: 'model', text: result.text };
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
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return e('div', { className: "flex flex-col h-[70vh]" },
    e('div', { className: "flex-1 overflow-y-auto p-6 space-y-4" },
      messages.map((msg, index) => e(MessageBubble, { key: index, role: msg.role, text: msg.text })),
      isLoading && e('div', { className: "flex justify-start" },
        e('div', { className: "flex items-center gap-2 max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl bg-slate-700 rounded-bl-lg" },
          e(SpinnerIcon),
          e('p', { className: "text-white" }, "Thinking...")
        )
      ),
      e('div', { ref: messagesEndRef })
    ),
    e('div', { className: "p-4 border-t border-slate-700" },
      error && e('div', { className: "mb-2 p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm" }, error),
      e('div', { className: "flex items-center gap-2 bg-slate-700 rounded-lg p-1" },
        e('input', {
          type: "text",
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyPress: handleKeyPress,
          placeholder: "Type your message...",
          className: "flex-1 bg-transparent p-2 text-slate-100 placeholder-slate-400 focus:outline-none",
          disabled: isLoading,
        }),
        e('button', {
          onClick: sendMessage,
          disabled: isLoading || !input.trim(),
          className: "p-2 bg-sky-600 rounded-md text-white hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors",
          'aria-label': "Send message",
        }, e(SendIcon))
      )
    )
  );
};

export default Chat;