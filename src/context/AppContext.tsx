import React, { createContext, useContext, useState } from 'react';

export type AppView =
  | 'onboarding'
  | 'profile'
  | 'workspace'
  | 'preview'
  | 'scores'
  | 'settings';

interface AppContextValue {
  view: AppView;
  setView: (v: AppView) => void;
  toast: ToastMessage | null;
  showToast: (msg: string, type?: ToastType) => void;
  clearToast: () => void;
}

type ToastType = 'success' | 'error' | 'info';
interface ToastMessage { text: string; type: ToastType }

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<AppView>('onboarding');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  function showToast(text: string, type: ToastType = 'info') {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <AppContext.Provider value={{ view, setView, toast, showToast, clearToast: () => setToast(null) }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
