import React from 'react';
import { User, FileText, BarChart3, Settings, ChevronRight, Zap, Download, Layers } from 'lucide-react';
import { useApp, AppView } from '../context/AppContext';
import { useProfile } from '../context/ProfileContext';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ReactNode;
}

const NAV: NavItem[] = [
  { id: 'profile',   label: 'Profile',       icon: <User size={17} /> },
  { id: 'workspace', label: 'Workspace',      icon: <Zap size={17} /> },
  { id: 'preview',   label: 'Resume',         icon: <FileText size={17} /> },
  { id: 'scores',    label: 'Intelligence',   icon: <BarChart3 size={17} /> },
  { id: 'settings',  label: 'Settings',       icon: <Settings size={17} /> },
];

export function Sidebar() {
  const { view, setView } = useApp();
  const { profile, saveProfile, isDirty } = useProfile();
  const hasProfile = !!profile.personal.name;

  return (
    <aside className="w-60 min-h-screen bg-dark-900 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-blue">
            <Layers size={15} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">Looma AI</span>
            <div className="text-dark-700 text-[10px] font-medium uppercase tracking-widest -mt-0.5">Resume Intelligence</div>
          </div>
        </div>
      </div>

      {/* Profile chip */}
      {hasProfile && (
        <div className="mx-3 mb-4 bg-dark-800 rounded-xl px-4 py-3 border border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
              {profile.personal.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{profile.personal.name}</p>
              <p className="text-dark-200/40 text-[10px] truncate">v{profile.version}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-dark-200/30 px-3 mb-2">Navigation</div>
        {NAV.map(item => {
          const active = view === item.id;
          const disabled = !hasProfile && item.id !== 'settings';
          return (
            <button
              key={item.id}
              onClick={() => !disabled && setView(item.id)}
              disabled={disabled}
              className={`w-full nav-item ${
                active
                  ? 'bg-brand-600 text-white shadow-blue'
                  : disabled
                  ? 'text-dark-200/20 cursor-not-allowed'
                  : 'text-dark-200/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`flex-shrink-0 ${active ? 'text-white' : ''}`}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight size={13} className="text-blue-200 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="p-3 space-y-2 border-t border-white/5 mt-4">
        {isDirty && (
          <button
            onClick={saveProfile}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-all shadow-blue"
          >
            Save Changes
          </button>
        )}
        <button
          onClick={() => setView('onboarding' as AppView)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-dark-200/50 hover:text-white text-xs font-medium rounded-xl transition-colors"
        >
          <Download size={12} />
          New / Import Profile
        </button>
      </div>
    </aside>
  );
}
