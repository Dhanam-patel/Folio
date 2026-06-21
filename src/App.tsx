import { AppProvider, useApp } from './context/AppContext';
import { ProfileProvider } from './context/ProfileContext';
import { AIProvider_ } from './context/AIContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { Onboarding } from './views/Onboarding';
import { ProfileEditor } from './views/ProfileEditor';
import { Workspace } from './views/Workspace';
import { ResumePreview } from './views/ResumePreview';
import { Scores } from './views/Scores';
import { Settings } from './views/Settings';

function AppShell() {
  const { view } = useApp();

  if (view === 'onboarding') {
    return (
      <div className="flex min-h-screen">
        <Onboarding />
        <Toast />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4ff]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 flex overflow-hidden">
          {view === 'profile' && <ProfileEditor />}
          {view === 'workspace' && <Workspace />}
          {view === 'preview' && <ResumePreview />}
          {view === 'scores' && <Scores />}
          {view === 'settings' && <Settings />}
        </main>
      </div>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ProfileProvider>
        <AIProvider_>
          <AppShell />
        </AIProvider_>
      </ProfileProvider>
    </AppProvider>
  );
}
