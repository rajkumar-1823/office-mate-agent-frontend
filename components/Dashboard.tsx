import React from 'react';
import { OfficeLayout } from './OfficeLayout';
import { ControlPanel } from './ControlPanel';
import type { OfficeLayout as OfficeLayoutType } from '../types';

interface DashboardProps {
  officeLayout: OfficeLayoutType;
  isSessionActive: boolean;
  isProcessing: boolean;
  isBotSpeaking: boolean;
  statusText: string;
  userTranscription: string;
  botTranscription: string;
  onStartSession: () => void;
  onStopSession: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  officeLayout,
  isSessionActive,
  isProcessing,
  isBotSpeaking,
  statusText,
  userTranscription,
  botTranscription,
  onStartSession,
  onStopSession,
}) => {
  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full">
      <div className="flex-grow flex flex-col gap-6 h-full min-h-0">
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-xl shadow-cyan-900/5 flex flex-col h-full backdrop-blur-sm overflow-hidden">
          <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4 flex-shrink-0">
               <h2 className="text-xl font-semibold text-slate-100">Live Office Map</h2>
               <div className="flex gap-2">
                   <span className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-700/50">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> Online
                   </span>
               </div>
          </div>
          <div className="flex-grow overflow-y-auto">
             <OfficeLayout layout={officeLayout} />
          </div>
        </div>
      </div>
      
      <div className="xl:w-96 flex-shrink-0 flex flex-col h-full min-h-0">
         <ControlPanel
            isSessionActive={isSessionActive}
            isProcessing={isProcessing}
            isBotSpeaking={isBotSpeaking}
            statusText={statusText}
            userTranscription={userTranscription}
            botTranscription={botTranscription}
            onStart={onStartSession}
            onStop={onStopSession}
          />
      </div>
    </div>
  );
};
