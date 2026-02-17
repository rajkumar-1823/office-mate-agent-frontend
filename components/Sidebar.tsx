import React from 'react';
import { LayoutDashboard, Settings } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'manage';
  onViewChange: (view: 'dashboard' | 'manage') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col border-r border-slate-800 flex-shrink-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
            AI Office
        </h1>
      </div>
      
      <nav className="flex-grow p-4 space-y-2">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            currentView === 'dashboard' 
              ? 'bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/5' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => onViewChange('manage')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            currentView === 'manage' 
              ? 'bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/5' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          <Settings size={20} />
          <span className="font-medium">Manage Office</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-500">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <span className="text-xs font-bold text-slate-300">JD</span>
              </div>
              <div className="flex-col flex">
                   <span className="text-sm font-medium text-slate-300">John Doe</span>
                   <span className="text-xs text-slate-500">Admin</span>
              </div>
          </div>
      </div>
    </div>
  );
};
