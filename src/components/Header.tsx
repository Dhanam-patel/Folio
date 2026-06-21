import { Save, Download, RefreshCw, Sparkles } from 'lucide-react';
import { useApp, AppView } from '../context/AppContext';
import { useProfile } from '../context/ProfileContext';
import { exportProfilePackage } from '../lib/profilePackage';

const VIEW_META: Record<AppView, { title: string; badge?: string }> = {
  onboarding: { title: 'Welcome to Looma AI' },
  profile:    { title: 'Profile Editor',        badge: 'Your Data' },
  workspace:  { title: 'AI Workspace',          badge: 'Intelligence' },
  preview:    { title: 'Resume Preview',        badge: 'Harvard Format' },
  scores:     { title: 'Resume Intelligence',   badge: 'Analysis' },
  settings:   { title: 'Settings',              badge: 'Config' },
};

export function Header() {
  const { view, showToast } = useApp();
  const { profile, resumes, saveProfile, isDirty, isLoading } = useProfile();
  const meta = VIEW_META[view];

  const handleSave = async () => {
    await saveProfile();
    showToast('Profile saved successfully', 'success');
  };

  const handleExport = () => {
    exportProfilePackage(profile, resumes);
    showToast('Profile package downloaded', 'success');
  };

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-dark-200/40 flex items-center px-6 gap-4 flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <h1 className="text-dark-900 font-bold text-sm tracking-tight">{meta.title}</h1>
        {meta.badge && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 text-[10px] font-semibold uppercase tracking-wider rounded-full">
            <Sparkles size={9} />
            {meta.badge}
          </span>
        )}
      </div>

      {view !== 'onboarding' && profile.personal.name && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-dark-700 hover:text-dark-900 hover:bg-dark-100 rounded-lg transition-colors"
          >
            <Download size={13} />
            Export
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || isLoading}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isDirty
                ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-blue'
                : 'bg-dark-100 text-dark-200/50 cursor-not-allowed'
            }`}
          >
            {isLoading ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
            {isLoading ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}
    </header>
  );
}
