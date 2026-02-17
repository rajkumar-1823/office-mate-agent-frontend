import type { FC } from 'react';
import type { OfficeLayout as OfficeLayoutType } from '../types';
import { ElectronicsItem } from './Device';
import { MoreHorizontal } from 'lucide-react';

interface RoomCardProps {
  room: OfficeLayoutType[0];
}

export const RoomCard: FC<RoomCardProps> = ({ room }) => {
  const activeCount = room.electronics.filter(e => e.state === 'ON').length;

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700 bg-slate-800/80 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-100 text-lg">{room.room_name}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{room.room_key}</p>
        </div>
        <div className="flex items-center gap-3">
            {activeCount > 0 && (
                <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                    {activeCount} Active
                </span>
            )}
            <button className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-700/50">
                <MoreHorizontal size={18} />
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 bg-slate-800/50 flex-1">
        {room.electronics.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8 opacity-60">
            <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mb-3 text-slate-400">
                <span className="text-xl">🔌</span>
            </div>
            <p className="text-sm text-slate-500">No devices mapped</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {room.electronics.map(device => (
              <ElectronicsItem 
                key={device._id} 
                electronics={device}
                onClick={() => {}} // Placeholder for future interactivity
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
