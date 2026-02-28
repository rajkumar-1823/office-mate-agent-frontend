import React from 'react';
import { OfficeLayout } from './OfficeLayout';
import { ControlPanel } from './ControlPanel';
import type { OfficeLayout as OfficeLayoutType } from '../types';
import { Loader2 } from 'lucide-react';

interface DashboardProps {
  officeLayout: OfficeLayoutType;
  isLayoutLoading: boolean;
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
  isLayoutLoading,
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
    // Stack on mobile, side-by-side on lg+
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">

      {/* ── Office Map ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden min-h-[320px] lg:min-h-0">
          <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Live Office Map</h2>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Real-time device status</p>
            </div>
            <span className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] inline-block" />
              Online
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {isLayoutLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <Loader2 size={32} className="animate-spin text-blue-500" />
                <p className="text-sm font-medium">Loading office layout…</p>
              </div>
            ) : (
              <OfficeLayout layout={officeLayout} />
            )}
          </div>
        </div>
      </div>

      {/* ── Control Panel ──────────────────────────────────── */}
      {/* Full width on mobile, fixed 384px on lg+ */}
      <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col min-h-0">
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
