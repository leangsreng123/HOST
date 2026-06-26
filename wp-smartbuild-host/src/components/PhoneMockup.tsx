import React from 'react';
import { Smartphone, Laptop, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

interface PhoneMockupProps {
  children: React.ReactNode;
  isFullscreen: boolean;
  onToggleFullscreen: (val: boolean) => void;
  siteTitle: string;
}

export default function PhoneMockup({ children, isFullscreen, onToggleFullscreen, siteTitle }: PhoneMockupProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-2 bg-slate-900/5 select-none">
      
      {/* Dynamic Device Control Bar */}
      <div className="flex items-center justify-between w-full max-w-sm bg-white border border-slate-100 rounded-xl p-2.5 mb-4 shadow-xs">
        <span className="text-xs font-semibold text-slate-500 font-display">Device Mode:</span>
        <div className="flex space-x-1 bg-slate-100 p-0.5 rounded-lg">
          <button
            onClick={() => onToggleFullscreen(false)}
            className={`p-1.5 rounded-md flex items-center space-x-1.5 text-xs font-bold transition ${!isFullscreen ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Frame</span>
          </button>
          <button
            onClick={() => onToggleFullscreen(true)}
            className={`p-1.5 rounded-md flex items-center space-x-1.5 text-xs font-bold transition ${isFullscreen ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Fullscreen</span>
          </button>
        </div>
      </div>

      {isFullscreen ? (
        /* Fullscreen View */
        <div className="w-full h-[650px] bg-white rounded-2xl border border-slate-150 shadow-md overflow-hidden relative">
          {children}
        </div>
      ) : (
        /* iPhone-style Device Wrapper */
        <div className="relative mx-auto border-[12px] border-slate-950 rounded-[44px] shadow-2xl w-[365px] h-[720px] bg-white flex flex-col overflow-hidden ring-4 ring-slate-800">
          
          {/* iOS Top Speaker & Camera Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-36 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
            {/* Small camera dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800/40 ml-16" />
          </div>

          {/* iOS Simulated Status Bar */}
          <div className="h-10 bg-white/95 px-6 flex items-center justify-between text-slate-900 font-bold text-xs select-none z-40 relative pt-1.5 flex-shrink-0">
            {/* Time matches user's screenshot! "4:58" with a cute paw emoji or walk icon */}
            <div className="flex items-center space-x-1">
              <span>4:58</span>
              <span className="text-[10px]">🐾</span>
            </div>
            {/* Right-side status icons (Signal, Wifi, Battery) */}
            <div className="flex items-center space-x-1.5">
              <svg className="w-4 h-3 text-slate-900 fill-current" viewBox="0 0 24 24">
                <path d="M2 22h20V2z" />
              </svg>
              <svg className="w-4 h-3 text-slate-900 fill-current" viewBox="0 0 24 24">
                <path d="M12 21l-12-18h24z" />
              </svg>
              {/* Battery */}
              <div className="w-6 h-3 border border-slate-900 rounded-sm p-0.5 flex items-center">
                <div className="bg-slate-900 h-full w-4/5 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Device Inner Content Frame */}
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>

          {/* iOS Simulated Home Indicator Bar */}
          <div className="h-5 bg-white/95 flex items-center justify-center z-40 relative flex-shrink-0 pb-1.5">
            <div className="w-28 h-1 bg-slate-900 rounded-full" />
          </div>

        </div>
      )}

      {/* Helpful Hint */}
      <div className="mt-3 flex items-center text-[11px] text-slate-400 max-w-sm text-center">
        <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-slate-500 flex-shrink-0" />
        <span>This live-responsive frame simulates exactly how clients see and interact with your hosted site on mobile devices!</span>
      </div>

    </div>
  );
}
