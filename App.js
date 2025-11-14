import React, { useState } from 'react';
import SimplePrompt from './components/SimplePrompt';
import Chat from './components/Chat';

const e = React.createElement;

const App = () => {
  const [mode, setMode] = useState('simple');

  const commonButtonClasses = "px-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500";
  const activeButtonClasses = "bg-sky-600 text-white shadow-md";
  const inactiveButtonClasses = "bg-slate-700 hover:bg-slate-600 text-slate-300";

  return e('div', { className: "min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8" },
    e('div', { className: "w-full max-w-4xl mx-auto" },
      e('header', { className: "text-center mb-8" },
        e('h1', { className: "text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300" },
          "Gemini AI Playground"
        ),
        e('p', { className: "mt-2 text-slate-400" },
          "Switch between simple completion and conversational chat."
        )
      ),
      e('div', { className: "flex justify-center mb-8" },
        e('div', { className: "bg-slate-800 p-1 rounded-lg flex space-x-1" },
          e('button', {
            onClick: () => setMode('simple'),
            className: `${commonButtonClasses} ${mode === 'simple' ? activeButtonClasses : inactiveButtonClasses}`
          }, "Simple Prompt"),
          e('button', {
            onClick: () => setMode('chat'),
            className: `${commonButtonClasses} ${mode === 'chat' ? activeButtonClasses : inactiveButtonClasses}`
          }, "Chat")
        )
      ),
      e('main', { className: "bg-slate-800/50 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700" },
        mode === 'simple' ? e(SimplePrompt) : e(Chat)
      )
    )
  );
};

export default App;