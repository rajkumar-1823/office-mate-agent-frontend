import type { FC } from 'react';
import type { OfficeLayout as OfficeLayoutType } from '../types';
import { RoomCard } from './RoomCard';
import { Box } from 'lucide-react';

interface OfficeLayoutProps {
  layout: OfficeLayoutType;
}

export const OfficeLayout: FC<OfficeLayoutProps> = ({ layout }) => {
  if (layout.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-4">
          <Box className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-700">No Rooms Found</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-xs">Use voice commands or the Management page to create your first room.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-4xl mx-auto w-full">
      {layout.map((room) => (
        <RoomCard key={room._id} room={room} />
      ))}
    </div>
  );
};
