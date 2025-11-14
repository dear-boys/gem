import React from 'react';

const e = React.createElement;

export const SpinnerIcon = () => (
  e('svg', { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" },
    e('circle', { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
    e('path', { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
  )
);

export const GenerateIcon = () => (
    e('svg', { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "lucide lucide-wand-sparkles" },
        e('path', { d: "m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L11.8 9.2a1.21 1.21 0 0 0 0 1.72l5.8 5.8a1.21 1.21 0 0 0 1.72 0l6.84-6.84a1.21 1.21 0 0 0 0-1.72Z" }),
        e('path', { d: "m14 7 3 3" }),
        e('path', { d: "M5 6v4" }),
        e('path', { d: "M19 14v4" }),
        e('path', { d: "M10 2v2" }),
        e('path', { d: "M7 8H3" }),
        e('path', { d: "M21 16h-2" }),
        e('path', { d: "M11 3H9" })
    )
);

export const SendIcon = () => (
    e('svg', { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "lucide lucide-send-horizontal" },
        e('path', { d: "m3 3 3 9-3 9 19-9Z" }),
        e('path', { d: "M6 12h16" })
    )
);