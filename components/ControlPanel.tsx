
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ControlPanelProps {
  isSessionActive: boolean;
  isProcessing: boolean;
  isBotSpeaking: boolean;
  statusText: string;
  userTranscription: string;
  botTranscription: string;
  onStart: () => void;
  onStop: () => void;
}

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="5" y="5" width="14" height="14" rx="2" strokeWidth={2} />
  </svg>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isSessionActive,
  isProcessing,
  isBotSpeaking,
  statusText,
  userTranscription,
  botTranscription,
  onStart,
  onStop,
}) => {
  const recordingPulseClass = isSessionActive && !isBotSpeaking ? 'ring-4 ring-blue-400/40 animate-pulse' : '';
  const speakingPulseClass = isBotSpeaking ? 'ring-4 ring-violet-400/40 animate-pulse' : '';

  const buttonBaseClasses = 'cursor-pointer w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 focus:outline-none disabled:opacity-50 shadow-lg';
  const startClasses = `bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 ${recordingPulseClass}`;
  const stopClasses = `bg-red-500 hover:bg-red-600 shadow-red-500/30 ${speakingPulseClass}`;
  const processingClasses = 'bg-gray-300 cursor-not-allowed shadow-none';

  const buttonClasses = isProcessing
    ? `${buttonBaseClasses} ${processingClasses}`
    : isSessionActive
    ? `${buttonBaseClasses} ${stopClasses}`
    : `${buttonBaseClasses} ${startClasses}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <h2 className="text-base sm:text-lg font-bold text-slate-800">Voice Assistant</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-xs font-medium text-slate-400">
            {isSessionActive ? 'Active' : 'Idle'}
          </span>
        </div>
      </div>

      {/* Mic button — smaller vertical padding on mobile, more compact */}
      <div className="flex flex-col items-center justify-center gap-3 py-6 sm:py-10 flex-grow bg-gray-50/50">
        <div className={`rounded-full transition-all duration-500 ${
          isSessionActive && !isProcessing ? 'p-4 bg-blue-50 ring-8 ring-blue-100' : 'p-2'
        }`}>
          <button
            onClick={isSessionActive ? onStop : onStart}
            disabled={isProcessing}
            className={buttonClasses}
          >
            {isProcessing
              ? <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" />
              : isSessionActive
              ? <StopIcon className="w-8 h-8 sm:w-10 sm:h-10" />
              : <MicrophoneIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            }
          </button>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 text-center font-medium px-4 leading-snug">{statusText}</p>
      </div>

      {/* Transcription panels */}
      <div className="space-y-3 px-4 sm:px-6 pb-4 sm:pb-6 flex-shrink-0">
        <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-xl min-h-[4rem]">
          <h3 className="font-semibold text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1.5">You said</h3>
          <p className="text-slate-700 text-xs sm:text-sm italic leading-snug">{userTranscription || '—'}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-3 sm:p-4 rounded-xl min-h-[4rem]">
          <h3 className="font-semibold text-blue-400 text-[10px] sm:text-xs uppercase tracking-wider mb-1.5">Bot says</h3>
          <p className="text-blue-700 text-xs sm:text-sm leading-snug">{botTranscription || '—'}</p>
        </div>
      </div>
    </div>
  );
};
