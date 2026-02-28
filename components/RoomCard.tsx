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
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 text-base sm:text-lg truncate">{room.room_name}</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{room.room_key}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {activeCount > 0 && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {activeCount} Active
            </span>
          )}
          <button className="cursor-pointer text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-gray-200/70 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5 bg-white flex-1">
        {room.electronics.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8 opacity-60">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg">🔌</span>
            </div>
            <p className="text-sm text-slate-400">No devices mapped</p>
          </div>
        ) : (
          // 2 cols on very small screens, 3 on sm+, 4 on xl
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
            {room.electronics.map(device => (
              <ElectronicsItem
                key={device._id}
                electronics={device}
                onClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
