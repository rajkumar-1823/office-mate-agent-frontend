
import React from 'react';

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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12v0a9 9 0 01-9 9s-9-2.55-9-9S3 3 12 3s9 2.55 9 9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" />
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
  const buttonBaseClasses = "w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50";
  const startClasses = "bg-cyan-600 hover:bg-cyan-500 focus:ring-cyan-400";
  const stopClasses = "bg-red-600 hover:bg-red-500 focus:ring-red-400";
  const recordingPulseClass = isSessionActive && !isBotSpeaking ? "animate-pulse ring-4 ring-cyan-500/50" : "";
  const speakingPulseClass = isBotSpeaking ? "animate-pulse ring-4 ring-purple-500/50" : "";
  const processingClasses = "bg-gray-600 cursor-not-allowed";

  const buttonContent = isSessionActive
    ? <StopIcon className="w-10 h-10" />
    : <MicrophoneIcon className="w-10 h-10" />;

  const buttonClasses = isProcessing
    ? `${buttonBaseClasses} ${processingClasses}`
    : isSessionActive
    ? `${buttonBaseClasses} ${stopClasses} ${speakingPulseClass}`
    : `${buttonBaseClasses} ${startClasses} ${recordingPulseClass}`;
    
  return (
    <div className="bg-gray-800/50 rounded-2xl p-4 sm:p-6 border border-gray-700 flex flex-col h-full shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-cyan-300 border-b-2 border-cyan-500/30 pb-2">Controls</h2>
      <div className="flex flex-col items-center justify-center gap-4 my-6 flex-grow">
        <button
          onClick={isSessionActive ? onStop : onStart}
          disabled={isProcessing}
          className={buttonClasses}
        >
          {buttonContent}
        </button>
        <p className="text-gray-300 text-center h-6 transition-opacity duration-300">{statusText}</p>
      </div>

      <div className="space-y-4 flex-shrink-0">
          <div className="bg-gray-700/60 p-3 rounded-lg min-h-[6rem]">
              <h3 className="font-bold text-gray-400 text-sm mb-1">You said:</h3>
              <p className="text-gray-200 italic">{userTranscription || '...'}</p>
          </div>
          <div className="bg-gray-700/60 p-3 rounded-lg min-h-[6rem]">
              <h3 className="font-bold text-cyan-400 text-sm mb-1">Bot says:</h3>
              <p className="text-cyan-200">{botTranscription || '...'}</p>
          </div>
      </div>
    </div>
  );
};
