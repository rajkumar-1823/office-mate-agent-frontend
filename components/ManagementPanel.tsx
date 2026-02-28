import { type FC } from 'react';
import { ManageOffice } from './ManageOffice';
import { Settings } from 'lucide-react';

interface ManagementPanelProps {
  refreshLayout: () => void;
}

export const ManagementPanel: FC<ManagementPanelProps> = ({ refreshLayout }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-full flex flex-col border border-gray-200">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30">
            <Settings size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Office Management</h2>
            <p className="text-slate-400 text-sm">Configure your office rooms and devices.</p>
          </div>
        </div>
      </div>
      <div className="p-6 flex-grow overflow-y-auto bg-gray-50/50">
        <ManageOffice refreshLayout={refreshLayout} />
      </div>
    </div>
  );
};
