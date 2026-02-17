import { type FC } from 'react';
import { ManageOffice } from './ManageOffice';

interface ManagementPanelProps {
  refreshLayout: () => void;
}

export const ManagementPanel: FC<ManagementPanelProps> = ({ refreshLayout }) => {
  return (
    <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden h-full flex flex-col border border-slate-700">
       <div className="p-6 border-b border-slate-700 bg-slate-800/90">
           <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">Office Management</h2>
                    <p className="text-slate-400 mt-1 text-sm">Configure your office rooms and devices.</p>
                </div>
           </div>
       </div>
       <div className="p-6 flex-grow overflow-y-auto bg-slate-900/40">
           <ManageOffice refreshLayout={refreshLayout} />
       </div>
    </div>
  );
};

