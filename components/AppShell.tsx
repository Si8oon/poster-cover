// components/AppShell.tsx
'use client';

import { useEffect, useState } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import FAB from './FAB';
import HomeScreen from './screens/HomeScreen';
import TemplatesScreen from './screens/TemplatesScreen';
import PostsScreen from './screens/PostsScreen';
import SettingsScreen from './screens/SettingsScreen';
import DesktopSidebar from './desktop/DesktopSidebar';
import DesktopHome from './desktop/DesktopHome';
import EditorScreen from './editor/EditorScreen';
import Welcome from './Welcome';
import { useTheme } from '@/lib/useTheme';
import type { TemplateId } from '@/lib/templates';

export type Tab = 'home' | 'templates' | 'posts' | 'settings';

const WELCOME_KEY = 'postgen:welcome-done:v2';

export default function AppShell() {
  const [tab, setTab] = useState<Tab>('home');
  const [editorOpen, setEditorOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<TemplateId | undefined>(
    undefined
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);
  const { loaded } = useTheme();

  useEffect(() => {
    const done = localStorage.getItem(WELCOME_KEY);
    setShowWelcome(done !== '1');
  }, []);

  const finishWelcome = () => {
    localStorage.setItem(WELCOME_KEY, '1');
    setShowWelcome(false);
  };

  const resetWelcome = () => {
    localStorage.removeItem(WELCOME_KEY);
    setShowWelcome(true);
  };

  const openEditor = (template?: TemplateId) => {
    setPendingTemplate(template);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setPendingTemplate(undefined);
  };

  const handleSaved = () => {
    setRefreshKey((k) => k + 1);
    setTab('posts');
  };

  if (!loaded || showWelcome === null) {
    return <div className="min-h-screen" style={{ background: 'var(--bg)' }} />;
  }

  if (showWelcome) {
    return <Welcome onDone={finishWelcome} />;
  }

  return (
    <>
      {/* MOBILE */}
      <div
        className="lg:hidden min-h-screen flex justify-center relative overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        <div
          className="pointer-events-none fixed inset-0 opacity-70"
          style={{ background: 'var(--bg-gradient)' }}
        />
        <div
          className="relative z-10 w-full max-w-[430px] min-h-screen flex flex-col"
          style={{ background: 'var(--bg)' }}
        >
          <Header />
          <main
            className="flex-1 overflow-y-auto no-scrollbar pb-28"
            style={{ background: 'var(--bg)' }}
          >
            {tab === 'home' && (
              <HomeScreen
                onNewPost={() => openEditor()}
                refreshKey={refreshKey}
              />
            )}
            {tab === 'templates' && (
              <TemplatesScreen onPick={(id) => openEditor(id)} />
            )}
            {tab === 'posts' && (
              <PostsScreen
                onNewPost={() => openEditor()}
                refreshKey={refreshKey}
              />
            )}
            {tab === 'settings' && (
              <SettingsScreen onResetWelcome={resetWelcome} />
            )}
          </main>
          <FAB onClick={() => openEditor()} />
          <BottomNav active={tab} onChange={setTab} />
        </div>
      </div>

      {/* DESKTOP */}
      <div
        className="hidden lg:block min-h-screen relative overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        <div
          className="pointer-events-none fixed inset-0 opacity-60"
          style={{ background: 'var(--bg-gradient)' }}
        />

        {/* Floating top dock */}
        <DesktopSidebar
          active={tab}
          onChange={setTab}
          onCreate={() => openEditor()}
        />

        {/* Content — note the pt-24 to leave room for the dock */}
        <div className="relative z-10 pt-24 pb-12">
          {tab === 'home' && (
            <DesktopHome
              onCreate={() => openEditor()}
              onPickTemplate={(id) => openEditor(id)}
              refreshKey={refreshKey}
            />
          )}
          {tab === 'templates' && (
            <div className="px-10 py-10">
              <TemplatesScreen onPick={(id) => openEditor(id)} />
            </div>
          )}
          {tab === 'posts' && (
            <div className="px-10 py-10">
              <PostsScreen
                onNewPost={() => openEditor()}
                refreshKey={refreshKey}
              />
            </div>
          )}
          {tab === 'settings' && (
            <div className="px-10 py-10 max-w-2xl mx-auto">
              <SettingsScreen onResetWelcome={resetWelcome} />
            </div>
          )}
        </div>
      </div>

      {editorOpen && (
        <EditorScreen
          onClose={closeEditor}
          onSaved={handleSaved}
          initialTemplate={pendingTemplate}
        />
      )}
    </>
  );
}