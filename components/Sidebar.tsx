import React from 'react';
import { LayoutDashboard, Settings, Bot, X } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'manage';
  onViewChange: (view: 'dashboard' | 'manage') => void;
  isOpen: boolean;        // Only used on mobile
  onToggle: () => void;   // Only used on mobile
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, onToggle }) => {
  const handleNav = (view: 'dashboard' | 'manage') => {
    onViewChange(view);
    onToggle(); // close drawer on mobile after navigating
  };

  return (
    <>
      {/* ── Mobile backdrop (hidden on lg+) ─────────────────────── */}
      <div
        onClick={onToggle}
        aria-hidden="true"
        className={`
          lg:hidden fixed inset-0 z-30
          bg-black/30
          transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* ── Sidebar Panel ───────────────────────────────────────── */}
      {/*
        Mobile:  fixed, slides in/out via translateX
        Desktop: relative, always visible, no transform
      */}
      <aside
        className={`
          fixed lg:relative
          top-0 left-0
          z-40 lg:z-auto
          h-screen w-64
          flex flex-col flex-shrink-0
          bg-white border-r border-gray-200
          shadow-2xl lg:shadow-sm
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header: Logo + Mobile close button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 flex-shrink-0">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">AI Office</h1>
              <p className="text-[10px] text-slate-400 font-medium">Smart Controller</p>
            </div>
          </div>

          {/* Close button — mobile only */}
          <button
            onClick={onToggle}
            className="lg:hidden cursor-pointer p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-gray-100 transition-all duration-200 active:scale-90"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-4 py-2 select-none">
            Navigation
          </p>

          <button
            onClick={() => handleNav('dashboard')}
            className={`
              cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
              transition-all duration-200 text-left
              ${currentView === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'}
            `}
          >
            <LayoutDashboard size={18} />
            <span className="font-medium text-sm">Dashboard</span>
          </button>

          <button
            onClick={() => handleNav('manage')}
            className={`
              cursor-pointer w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
              transition-all duration-200 text-left
              ${currentView === 'manage'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'}
            `}
          >
            <Settings size={18} />
            <span className="font-medium text-sm">Manage Office</span>
          </button>
        </nav>

        {/* Footer user pill */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-xs font-bold text-white">JD</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-800 truncate">John Doe</span>
              <span className="text-xs text-slate-400">Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
