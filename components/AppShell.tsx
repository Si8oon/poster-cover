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
import NewPostSheet from './NewPostSheet';
import Welcome from './Welcome';
import { useTheme } from '@/lib/useTheme';
import { getPost, type SavedPost } from '@/lib/storage';
import { getSlideSet, type SlideSetId } from '@/lib/slideSets';
import type { PostConfig } from '@/lib/types';
import type { TemplateId } from '@/lib/templates';

export type Tab = 'home' | 'templates' | 'posts' | 'settings';

const WELCOME_KEY = 'postgen:welcome-done:v2';

export default function AppShell() {
  const [tab, setTab] = useState<Tab>('home');
  const [editorOpen, setEditorOpen] = useState(false);
  const [newSheetOpen, setNewSheetOpen] = useState(false);
  const [newSheetStep, setNewSheetStep] = useState<'choice' | 'setConfig'>('choice');
  const [newSheetSetId, setNewSheetSetId] = useState<SlideSetId | undefined>(undefined);
  const [pendingTemplate, setPendingTemplate] = useState<TemplateId | undefined>(undefined);
  const [pendingSlides, setPendingSlides] = useState<PostConfig[] | undefined>(undefined);
  const [editingPost, setEditingPost] = useState<SavedPost | null>(null);
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

  // ---------- Sheet openers ----------
  const openNewSheet = () => {
    setNewSheetStep('choice');
    setNewSheetSetId(undefined);
    setNewSheetOpen(true);
  };

  const openNewSheetOnSet = (id: SlideSetId) => {
    setNewSheetStep('setConfig');
    setNewSheetSetId(id);
    setNewSheetOpen(true);
  };

  // ---------- Create flows ----------
  const handleCreateSingle = () => {
    setNewSheetOpen(false);
    setPendingTemplate(undefined);
    setPendingSlides(undefined);
    setEditingPost(null);
    setEditorOpen(true);
  };

  const handleCreateSet = (slides: PostConfig[], themeId: SlideSetId) => {
    const def = getSlideSet(themeId);
    setNewSheetOpen(false);
    setPendingTemplate(undefined);
    setPendingSlides(slides);
    setEditingPost(
      def
        ? {
            id: '',
            slides,
            theme: def.theme,
            previewDataUrl: '',
            createdAt: Date.now(),
          }
        : null
    );
    setEditorOpen(true);
  };

  const openEditorWithTemplate = (template?: TemplateId) => {
    setPendingTemplate(template);
    setPendingSlides(undefined);
    setEditingPost(null);
    setEditorOpen(true);
  };

  const openEditorWithPost = (postId: string) => {
    const post = getPost(postId);
    if (!post) return;
    setEditingPost(post);
    setPendingSlides(undefined);
    setPendingTemplate(undefined);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setPendingTemplate(undefined);
    setPendingSlides(undefined);
    setEditingPost(null);
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
            className="flex-1 overflow-y-auto no-scrollbar pb-28 screen-in"
            style={{ background: 'var(--bg)' }}
          >
            {tab === 'home' && (
              <HomeScreen
                onNewPost={openNewSheet}
                onPickTemplate={(id) => openEditorWithTemplate(id)}
                onOpenPost={openEditorWithPost}
                refreshKey={refreshKey}
              />
            )}
            {tab === 'templates' && (
              <TemplatesScreen onPick={(id) => openEditorWithTemplate(id)} />
            )}
            {tab === 'posts' && (
              <PostsScreen
                onNewPost={openNewSheet}
                onOpenPost={openEditorWithPost}
                refreshKey={refreshKey}
              />
            )}
            {tab === 'settings' && (
              <SettingsScreen onResetWelcome={resetWelcome} />
            )}
          </main>
          <FAB onClick={openNewSheet} />
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
        <DesktopSidebar
          active={tab}
          onChange={setTab}
          onCreate={openNewSheet}
        />
        <div className="relative z-10 pt-24 pb-12">
          {tab === 'home' && (
            <DesktopHome
              onCreate={openNewSheet}
              onPickTemplate={(id) => openEditorWithTemplate(id)}
              onOpenPost={openEditorWithPost}
              onOpenSlideSet={openNewSheetOnSet}
              onOpenTemplates={() => setTab('templates')}
              refreshKey={refreshKey}
            />
          )}
          {tab === 'templates' && (
            <div className="px-10 py-10">
              <TemplatesScreen onPick={(id) => openEditorWithTemplate(id)} />
            </div>
          )}
          {tab === 'posts' && (
            <div className="px-10 py-10">
              <PostsScreen
                onNewPost={openNewSheet}
                onOpenPost={openEditorWithPost}
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

      {/* NEW POST SHEET */}
      {newSheetOpen && (
        <NewPostSheet
          onClose={() => setNewSheetOpen(false)}
          onCreateSingle={handleCreateSingle}
          onCreateSet={handleCreateSet}
          initialStep={newSheetStep}
          initialSetId={newSheetSetId}
        />
      )}

      {/* EDITOR */}
      {editorOpen && (
        <EditorScreen
          onClose={closeEditor}
          onSaved={handleSaved}
          initialTemplate={pendingTemplate}
          editingPostId={editingPost?.id || undefined}
          initialSlides={editingPost?.slides ?? pendingSlides}
          initialTheme={editingPost?.theme}
        />
      )}
    </>
  );
}