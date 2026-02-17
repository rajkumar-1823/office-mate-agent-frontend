import type { FC } from 'react';
import { Lightbulb, Wind, Tv, Speaker, Zap, Fan, MonitorPlay, Printer, Camera, Wifi, PanelTopClose } from 'lucide-react';
import { ElectronicsType, ElectronicsState } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ElectronicsItemProps {
  electronics: {
    _id: string;
    electronics_id: string;
    electronics_name: string;
    type: string;
    state: string;
  };
  onClick?: () => void;
}

const ICONS = {
  [ElectronicsType.LIGHT]: Lightbulb,
  [ElectronicsType.AC]: Wind,
  [ElectronicsType.TV]: Tv,
  [ElectronicsType.SPEAKER]: Speaker,
  [ElectronicsType.FAN]: Fan,
  [ElectronicsType.PROJECTOR]: MonitorPlay,
  [ElectronicsType.PRINTER]: Printer,
  [ElectronicsType.CAMERA]: Camera,
  [ElectronicsType.ROUTER]: Wifi,
  [ElectronicsType.CURTAIN]: PanelTopClose,
};

export const ElectronicsItem: FC<ElectronicsItemProps> = ({ electronics, onClick }) => {
  const isOn = electronics.state === ElectronicsState.ON;
  const Icon = ICONS[electronics.type as ElectronicsType] || Zap;

  return (
    <button
      onClick={onClick}
      className={twMerge(
        "group relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 w-full aspect-square",
        isOn 
          ? "bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-900/20" 
          : "bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 hover:shadow-sm hover:bg-slate-700/50"
      )}
    >
      {/* Indicator Dot */}
      <div className={twMerge(
        "absolute top-3 right-3 w-2 h-2 rounded-full transition-colors duration-300",
        isOn ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-slate-600"
      )} />

      {/* Icon */}
      <div className={twMerge(
        "p-3 rounded-xl mb-3 transition-colors duration-200",
        isOn ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-700 text-slate-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-400"
      )}>
        <Icon size={24} strokeWidth={isOn ? 2.5 : 2} />
      </div>

      {/* Label */}
      <span className={twMerge(
        "text-xs font-semibold text-center leading-tight line-clamp-2",
        isOn ? "text-cyan-100" : "text-slate-400 group-hover:text-slate-200"
      )}>
        {electronics.electronics_name}
      </span>
      
      {/* State Text */}
      <span className={twMerge(
        "text-[10px] font-medium uppercase tracking-wider mt-1",
        isOn ? "text-cyan-400" : "text-slate-500"
      )}>
        {isOn ? 'Active' : 'Off'}
      </span>
    </button>
  );
};
