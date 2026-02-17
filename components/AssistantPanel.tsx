import type { FC } from 'react';
import { Mic, Square, Loader2, Cpu } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AssistantPanelProps {
  isSessionActive: boolean;
  isProcessing: boolean;
  isBotSpeaking: boolean;
  statusText: string;
  userTranscription: string;
  botTranscription: string;
  onStart: () => void;
  onStop: () => void;
}

export const AssistantPanel: FC<AssistantPanelProps> = ({
  isSessionActive,
  isProcessing,
  isBotSpeaking,
  statusText,
  userTranscription,
  botTranscription,
  onStart,
  onStop,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Cpu className="text-brand-600" size={20} />
            <h2 className="font-semibold text-slate-800">Assistant</h2>
        </div>
        <div className="flex items-center gap-2">
            <div className={twMerge(
                "w-2 h-2 rounded-full",
                isSessionActive ? "bg-green-500 animate-pulse" : "bg-slate-300"
            )} />
            <span className="text-xs font-medium text-slate-500">
                {isSessionActive ? "Online" : "Offline"}
            </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto bg-slate-50/30">
        
        {/* Helper / Status Text */}
        {!userTranscription && !botTranscription && (
            <div className="flex flex-col items-center justify-center flex-1 text-center opacity-60">
                <p className="text-sm text-slate-500 mb-1">{statusText}</p>
            </div>
        )}

        {/* User Bubble */}
        {userTranscription && (
            <div className="flex justify-end">
                <div className="bg-brand-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                    <p className="text-sm">{userTranscription}</p>
                </div>
            </div>
        )}

        {/* Bot Bubble */}
        {botTranscription && (
            <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm">
                    <p className="text-sm">{botTranscription}</p>
                </div>
            </div>
        )}
        
        {/* Processing Indicator */}
        {isProcessing && !isBotSpeaking && isSessionActive && (
            <div className="flex justify-start">
                 <div className="bg-slate-100 text-slate-500 px-4 py-2 rounded-full flex items-center gap-2 text-xs">
                    <Loader2 size={12} className="animate-spin" />
                    Processing...
                </div>
            </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 border-t border-slate-100 bg-white">
        <div className="flex flex-col items-center gap-3">
             <button
                onClick={isSessionActive ? onStop : onStart}
                disabled={isProcessing}
                className={twMerge(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg focus:ring-4 focus:ring-offset-2",
                    isProcessing ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
                    isSessionActive 
                        ? "bg-red-500 hover:bg-red-600 text-white focus:ring-red-200" 
                        : "bg-brand-600 hover:bg-brand-700 text-white focus:ring-brand-200",
                    isSessionActive && !isBotSpeaking && !isProcessing && "animate-pulse ring-4 ring-brand-100"
                )}
            >
                {isProcessing ? <Loader2 className="animate-spin" /> : 
                 isSessionActive ? <Square size={24} fill="currentColor" /> : <Mic size={28} />}
            </button>
            <p className="text-xs text-slate-400 font-medium">
                {isSessionActive ? "Tap to Stop" : "Tap to Start"}
            </p>
        </div>
      </div>
    </div>
  );
};
