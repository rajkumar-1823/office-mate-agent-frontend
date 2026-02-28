import type { FC } from 'react';
import { Lightbulb, Wind, Tv, Speaker, Zap, Fan, MonitorPlay, Printer, Camera, Wifi, PanelTopClose } from 'lucide-react';
import { ElectronicsType, ElectronicsState } from '../types';
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
        'group relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 w-full aspect-square',
        isOn
          ? 'bg-blue-50 border-blue-200 shadow-md shadow-blue-100'
          : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm hover:bg-gray-50'
      )}
    >
      {/* Indicator Dot */}
      <div className={twMerge(
        'absolute top-3 right-3 w-2 h-2 rounded-full transition-colors duration-300',
        isOn ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-gray-300'
      )} />

      {/* Icon */}
      <div className={twMerge(
        'p-3 rounded-xl mb-3 transition-colors duration-200',
        isOn ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
      )}>
        <Icon size={24} strokeWidth={isOn ? 2.5 : 2} />
      </div>

      {/* Label */}
      <span className={twMerge(
        'text-xs font-semibold text-center leading-tight line-clamp-2',
        isOn ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'
      )}>
        {electronics.electronics_name}
      </span>

      {/* State Text */}
      <span className={twMerge(
        'text-[10px] font-medium uppercase tracking-wider mt-1',
        isOn ? 'text-blue-500' : 'text-gray-400'
      )}>
        {isOn ? 'Active' : 'Off'}
      </span>
    </button>
  );
};
