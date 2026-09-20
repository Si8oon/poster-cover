// components/editor/EditorScreen.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type Konva from 'konva';
import { savePost, updatePost } from '@/lib/storage';
import {
  DEFAULT_CONFIG,
  createEmptySlide,
  normalizeConfig,
  extractTheme,
  applyTheme,
  DEFAULT_MOTION,
  type PostConfig,
  type CanvasElement,
  type CardElement,
  type CardStat,
  type SplitImageElement,
  type SlideTheme,
} from '@/lib/types';
import { TEMPLATES, getTemplate, type TemplateId } from '@/lib/templates';
import { ALL_FONTS, fontEntryToFamily, findFontEntry, warmupFonts } from '@/lib/fonts';
import { useHistory } from '@/lib/useHistory';
import { getTheme as getAppTheme } from '@/lib/themes';
import type { ThemeId } from '@/lib/themes';
import TemplatePreview from '../TemplatePreview';

const PostCanvas = dynamic(() => import('./PostCanvas'), {
  ssr: false,
  loading: () => (
    <div
      className="w-[432px] h-[540px] flex items-center justify-center text-sm"
      style={{ color: 'var(--text-muted)' }}
    >
      Loading canvas...
    </div>
  ),
});

type Tab = 'theme' | 'template' | 'text' | 'fx' | 'style' | 'elements';

type Props = {
  onClose: () => void;
  onSaved?: () => void;
  initialTemplate?: TemplateId;
  editingPostId?: string;
  initialSlides?: PostConfig[];
  initialTheme?: SlideTheme;
};

type EditorSnapshot = {
  slides: PostConfig[];
  theme: SlideTheme;
};

const COLORS = [
  '#ffffff', '#000000', '#00d97e', '#fbbf24', '#ef4444',
  '#8b5cf6', '#22d3ee', '#ec4899', '#22c55e', '#f97316',
  '#0ea5e9', '#a855f7', '#14b8a6', '#f43f5e', '#eab308',
  '#e07a3f', '#faf7f0', '#1a1a1a', '#4a4a4a', '#666666',
];

const THEME_KEY = 'postgen:theme';

export default function EditorScreen({
  onClose, onSaved, initialTemplate, editingPostId, initialSlides, initialTheme,
}: Props) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const elementImageInputRef = useRef<HTMLInputElement>(null);

  const pendingElementIdRef = useRef<string | null>(null);
  const pendingSplitSideRef = useRef<'left' | 'right' | null>(null);

  const isEditing = !!editingPostId;

  useEffect(() => {
    warmupFonts();
  }, []);

  const initialSnapshot: EditorSnapshot = (() => {
    // Read the currently-active app theme's default motion (for new posts only)
    let appThemeMotion = { ...DEFAULT_MOTION };
    if (!isEditing && typeof window !== 'undefined') {
      const savedThemeId = (localStorage.getItem(THEME_KEY) as ThemeId | null) ?? 'white';
      const appTheme = getAppTheme(savedThemeId);
      if (appTheme) {
        appThemeMotion = { ...appTheme.defaultMotion };
      }
    }

    const computeSlides = (): PostConfig[] => {
      if (initialSlides && initialSlides.length > 0)
        return initialSlides.map((s) => normalizeConfig(s));
      const base = { ...DEFAULT_CONFIG };
      if (initialTemplate) {
        const t = getTemplate(initialTemplate);
        if (t) {
          Object.assign(base, t.config);
          if (t.elements) base.elements = t.elements;
        }
      }
      // Apply the app theme's motion to the new slide
      base.motion = appThemeMotion;
      return [base];
    };

    const slides = computeSlides();

    const theme: SlideTheme = (() => {
      if (initialTheme) return initialTheme;
      if (slides.length > 0) {
        const extracted = extractTheme(slides[0]);
        return extracted;
      }
      const base = { ...DEFAULT_CONFIG };
      if (initialTemplate) {
        const t = getTemplate(initialTemplate);
        if (t) {
          Object.assign(base, t.config);
          if (t.elements) base.elements = t.elements;
        }
      }
      base.motion = appThemeMotion;
      return extractTheme(base);
    })();

    return { slides, theme };
  })();

  const history = useHistory<EditorSnapshot>(initialSnapshot);
  const { slides, theme } = history.value;

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = slides[currentIndex];
  const isCurrentLinked = currentSlide.linkedTheme !== false;

  const setSlides = (
    updater: PostConfig[] | ((prev: PostConfig[]) => PostConfig[]),
    opts?: { immediate?: boolean }
  ) => {
    history.set(
      (prev) => ({
        ...prev,
        slides: typeof updater === 'function' ? updater(prev.slides) : updater,
      }),
      opts
    );
  };

  const updateCurrentSlide = (patch: Partial<PostConfig>) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === currentIndex ? { ...s, ...patch } : s))
    );
  };

  const updateTheme = (patch: Partial<SlideTheme>) => {
    const next = { ...theme, ...patch };
    history.set(
      (prev) => ({
        theme: next,
        slides: prev.slides.map((s) =>
          s.linkedTheme === false ? s : applyTheme(s, next)
        ),
      }),
      { immediate: true }
    );
  };

  const updateThemeHeader = (patch: Partial<SlideTheme['header']>) => {
    updateTheme({ header: { ...theme.header, ...patch } });
  };

  const detachCurrentSlide = () => {
    updateCurrentSlide({ linkedTheme: false });
  };

  const attachCurrentSlide = () => {
    const linked = applyTheme(currentSlide, theme);
    setSlides((prev) =>
      prev.map((s, i) =>
        i === currentIndex ? { ...linked, linkedTheme: true } : s
      )
    );
  };

  const addSlide = () => {
    const fresh = applyTheme(createEmptySlide(), theme);
    setSlides((prev) => [...prev, fresh], { immediate: true });
    setCurrentIndex(slides.length);
  };
  const duplicateSlide = () => {
    const copy: PostConfig = JSON.parse(JSON.stringify(currentSlide));
    copy.elements = copy.elements.map((el) => ({
      ...el,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }));
    setSlides((prev) => {
      const next = [...prev];
      next.splice(currentIndex + 1, 0, copy);
      return next;
    }, { immediate: true });
    setCurrentIndex((i) => i + 1);
  };
  const deleteSlide = () => {
    if (slides.length === 1) {
      setSlides([applyTheme(createEmptySlide(), theme)], { immediate: true });
      setCurrentIndex(0);
      return;
    }
    const next = slides.filter((_, i) => i !== currentIndex);
    setSlides(next, { immediate: true });
    setCurrentIndex(Math.min(currentIndex, next.length - 1));
  };
  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex((i) => Math.min(slides.length - 1, i + 1));

  useEffect(() => {
    const isMac =
      typeof navigator !== 'undefined' &&
      /Mac|iPhone|iPad/.test(navigator.platform);
    const modKey = isMac ? 'metaKey' : 'ctrlKey';

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isEditingField =
        tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if ((e as KeyboardEvent & Record<string, boolean>)[modKey] && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          history.redo();
        } else {
          if (isEditingField) return;
          e.preventDefault();
          history.undo();
        }
        return;
      }

      if ((e as KeyboardEvent & Record<string, boolean>)[modKey] && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        history.redo();
        return;
      }

      if (isEditingField) return;

      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, history.canUndo, history.canRedo]);

  const [bgFile, setBgFile] = useState<File | null>(null);
  const openBgPicker = () => { bgInputRef.current?.click(); };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setBgFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        updateCurrentSlide({
          backgroundImage: reader.result as string,
          paperBg: 'none',
        });
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const [activeTemplate, setActiveTemplate] = useState<TemplateId | null>(
    initialTemplate ?? null
  );

  const applyTemplate = (id: TemplateId) => {
    const t = getTemplate(id);
    if (!t) return;
    setActiveTemplate(id);

    history.set((prev) => {
      const nextSlides = prev.slides.map((s, i) => {
        if (i !== currentIndex) return s;
        const merged: PostConfig = {
          ...s,
          ...t.config,
          elements: t.elements ? t.elements : s.elements,
        };
        return merged;
      });

      const isLinked = prev.slides[currentIndex]?.linkedTheme !== false;
      if (isLinked) {
        const merged = { ...prev.slides[currentIndex], ...t.config };
        if (t.elements) merged.elements = t.elements;
        const newTheme = extractTheme(merged as PostConfig);

        return {
          theme: newTheme,
          slides: nextSlides.map((s, i) =>
            i === currentIndex
              ? ({ ...merged, linkedTheme: true } as PostConfig)
              : s.linkedTheme === false
              ? s
              : applyTheme(s, newTheme)
          ),
        };
      }

      return { ...prev, slides: nextSlides };
    }, { immediate: true });
  };

  const addElement = (type: CanvasElement['type']) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let el: CanvasElement;

    if (type === 'circleImage') {
      el = { id, type: 'circleImage', x: 0.7, y: 0.2, size: 0.22, imageUrl: '', snap: 'top-right' };
    } else if (type === 'logoPill') {
      el = { id, type: 'logoPill', x: 0.05, y: 0.08, text: 'BRAND', bgColor: '#ef4444', textColor: '#ffffff', fontSize: 12, snap: 'top-left' };
    } else if (type === 'swipeArrow') {
      el = { id, type: 'swipeArrow', x: 0.93, y: 0.5, size: 0.08, bgColor: '#ffffff', textColor: '#000000', snap: 'middle-right' };
    } else if (type === 'headingNumber') {
      el = { id, type: 'headingNumber', x: 0.06, y: 0.12, number: '01', fontSize: 80, color: '#e07a3f', font: fontEntryToFamily(findFontEntry('Georgia, serif')), italic: true, snap: 'free' };
    } else if (type === 'headingText') {
      el = { id, type: 'headingText', x: 0.06, y: 0.22, text: 'Your big headline goes here', fontSize: 34, color: '#1a1a1a', font: fontEntryToFamily(findFontEntry('Inter, system-ui, sans-serif')), lineHeight: 1.05, bold: true, width: 0.85, align: 'left', shadow: false, snap: 'free' };
    } else if (type === 'bodyText') {
      el = { id, type: 'bodyText', x: 0.06, y: 0.45, text: 'A short paragraph that describes your story in one or two sentences.', fontSize: 14, color: '#4a4a4a', font: fontEntryToFamily(findFontEntry('Inter, system-ui, sans-serif')), lineHeight: 1.4, width: 0.85, align: 'left', snap: 'free' };
    } else if (type === 'splitImage') {
      el = {
        id, type: 'splitImage',
        x: 0, y: 0,
        width: 1,
        height: 0.55,
        leftImageUrl: '',
        rightImageUrl: '',
        splitRatio: 0.5,
        divider: 'none',
        dividerColor: '#ffffff',
        snap: 'free',
      };
    } else if (type === 'quoteMark') {
      el = { id, type: 'quoteMark', x: 0.06, y: 0.5, char: '"', fontSize: 100, color: '#ffffff', font: fontEntryToFamily(findFontEntry('Georgia, serif')), snap: 'free' };
    } else if (type === 'attribution') {
      el = {
        id, type: 'attribution',
        x: 0.06, y: 0.87,
        text: '- Author Name, Source (Year)',
        fontSize: 13,
        color: '#ffffff',
        font: fontEntryToFamily(findFontEntry('Inter, system-ui, sans-serif')),
        letterSpacing: 1,
        uppercase: false,
        bold: true,
        width: 0.85,
        align: 'left',
        snap: 'free',
      };
    } else if (type === 'crossout') {
      el = {
        id, type: 'crossout',
        x: 0.15, y: 0.3,
        width: 0.5,
        height: 4,
        color: '#dc2626',
        rotation: -2,
        snap: 'free',
      };
    } else if (type === 'crown') {
      el = {
        id, type: 'crown',
        x: 0.35, y: 0.1,
        size: 0.25,
        color: '#fbbf24',
        strokeColor: '#000000',
        strokeWidth: 3,
        style: 'solid',
        snap: 'free',
      };
    } else if (type === 'tag') {
      el = {
        id, type: 'tag',
        x: 0.06, y: 0.9,
        text: '© 2026',
        fontSize: 14,
        color: '#111111',
        font: 'var(--font-permanent-marker), cursive',
        rotation: -3,
        snap: 'free',
      };
    } else {
      el = {
        id, type: 'card',
        x: 0.06, y: 0.62,
        width: 0.88,
        title: 'username/project-name',
        subtitle: 'A short description of what this thing is and why it matters.',
        stats: [
          { icon: '★', value: '10.5k', label: 'Stars' },
          { icon: '⑂', value: '2.2k', label: 'Forks' },
          { icon: '◎', value: '88', label: 'Issues' },
        ],
        bgColor: '#ffffff',
        titleColor: '#111111',
        subtitleColor: '#666666',
        accentColor: '#fbbf24',
        shadow: true,
        snap: 'free',
      };
    }
    updateCurrentSlide({ elements: [...currentSlide.elements, el] });
  };

  const removeElement = (id: string) => {
    updateCurrentSlide({ elements: currentSlide.elements.filter((e) => e.id !== id) });
  };
  const updateElement = (id: string, patch: Partial<CanvasElement>) => {
    updateCurrentSlide({
      elements: currentSlide.elements.map((el) =>
        el.id === id ? ({ ...el, ...patch } as CanvasElement) : el
      ),
    });
  };

  const handleRequestImage = (elementId: string) => {
    pendingElementIdRef.current = elementId;
    pendingSplitSideRef.current = null;
    elementImageInputRef.current?.click();
  };

  const handleSplitImageRequest = (elementId: string, side: 'left' | 'right') => {
    pendingElementIdRef.current = elementId;
    pendingSplitSideRef.current = side;
    elementImageInputRef.current?.click();
  };

  const handleElementImagePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = pendingElementIdRef.current;
    const file = e.target.files?.[0];
    if (!id || !file) {
      pendingElementIdRef.current = null;
      pendingSplitSideRef.current = null;
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const el = currentSlide.elements.find((x) => x.id === id);
      if (el && el.type === 'splitImage' && pendingSplitSideRef.current) {
        if (pendingSplitSideRef.current === 'left') {
          updateElement(id, { leftImageUrl: dataUrl } as Partial<CanvasElement>);
        } else {
          updateElement(id, { rightImageUrl: dataUrl } as Partial<CanvasElement>);
        }
      } else {
        updateElement(id, { imageUrl: dataUrl } as Partial<CanvasElement>);
      }
      pendingElementIdRef.current = null;
      pendingSplitSideRef.current = null;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const hasSplitImage = currentSlide.elements.some((e) => e.type === 'splitImage');
  const splitEl = currentSlide.elements.find((e) => e.type === 'splitImage') as
    | SplitImageElement
    | undefined;

  const hasCircleImage = currentSlide.elements.some(
    (e) => e.type === 'circleImage' && !(e as { imageUrl?: string }).imageUrl
  );

  const [tab, setTab] = useState<Tab>('theme');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleDownloadAll = async () => {
    for (let i = 0; i < slides.length; i++) {
      setCurrentIndex(i);
      await new Promise((r) => setTimeout(r, 350));
      const dataUrl = stageRef.current?.toDataURL({ pixelRatio: 2.5 });
      if (!dataUrl) continue;
      const link = document.createElement('a');
      link.download = `post-slide-${i + 1}.png`;
      link.href = dataUrl;
      link.click();
      await new Promise((r) => setTimeout(r, 250));
    }
    setToast(`Exported ${slides.length} slide${slides.length > 1 ? 's' : ''}`);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSave = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const hasContent =
      currentSlide.backgroundImage ||
      currentSlide.paperBg !== 'none' ||
      currentSlide.elements.some((e) => e.type === 'splitImage');
    if (!hasContent) {
      setToast('Add a photo or pick a paper style');
      setTimeout(() => setToast(null), 2200);
      return;
    }
    setSaving(true);
    try {
      const previewDataUrl = stage.toDataURL({ pixelRatio: 0.4 });
      const post = {
        id: editingPostId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        slides: [...slides],
        theme,
        previewDataUrl,
        createdAt: Date.now(),
      };

      if (isEditing) {
        updatePost(post);
      } else {
        savePost(post);
      }

      setToast(isEditing ? 'Updated!' : 'Saved!');
      setTimeout(() => { onSaved?.(); onClose(); }, 700);
    } catch (err) {
      console.error(err);
      setToast('Could not save');
      setTimeout(() => setToast(null), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col slide-up" style={{ background: 'var(--bg)' }}>
      <input
        ref={bgInputRef}
        type="file"
        accept="image/*"
        onChange={handleBgChange}
        style={{ position: 'fixed', left: -9999, top: -9999, width: 1, height: 1, opacity: 0 }}
      />
      <input
        ref={elementImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleElementImagePicked}
        style={{ position: 'fixed', left: -9999, top: -9999, width: 1, height: 1, opacity: 0 }}
      />

      <header className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="px-3 py-2 rounded-xl text-sm font-medium"
            style={{ color: 'var(--text-muted)' }}>✕</button>
          <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />
          <button
            onClick={history.undo}
            disabled={!history.canUndo}
            title="Undo (Ctrl+Z)"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            ↶
          </button>
          <button
            onClick={history.redo}
            disabled={!history.canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            ↷
          </button>
        </div>

        <p className="text-sm font-semibold">{isEditing ? 'Edit Post' : 'New Post'}</p>

        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 disabled:opacity-50 transition"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
          {saving ? 'Saving…' : isEditing ? 'Update' : 'Save'}
        </button>
      </header>

      <div className="px-4 py-3 flex items-center justify-between gap-3 shrink-0 overflow-x-auto no-scrollbar"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={goPrev} disabled={currentIndex === 0}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>◀</button>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            {isCurrentLinked ? '🔗' : '🔓'} Slide {currentIndex + 1} / {slides.length}
          </span>
          <button onClick={goNext} disabled={currentIndex === slides.length - 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>▶</button>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isCurrentLinked ? (
            <button onClick={detachCurrentSlide}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              🔓 Detach
            </button>
          ) : (
            <button onClick={attachCurrentSlide}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ color: 'var(--accent-fg)', background: 'var(--accent)', border: '1px solid var(--accent)' }}>
              🔗 Link
            </button>
          )}
          <button onClick={addSlide} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>+ Add</button>
          <button onClick={duplicateSlide} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>⧉ Dup</button>
          <button onClick={deleteSlide} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ color: '#ef4444', background: 'var(--card)', border: '1px solid var(--border)' }}>🗑</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1100px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col items-center gap-4">
            <div className="shadow-2xl rounded-3xl overflow-hidden relative"
              style={{ border: '1px solid var(--border)' }}>
              {isCurrentLinked && (
                <div className="absolute top-3 left-3 z-10 text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>
                  🔗 Linked to theme
                </div>
              )}
              <PostCanvas config={currentSlide} onChange={updateCurrentSlide}
                stageRef={stageRef} onRequestImage={handleRequestImage}
                onRequestSplitImage={handleSplitImageRequest}
                slideIndex={currentIndex} slideCount={slides.length} />
            </div>

            <div className="w-full max-w-[432px] flex flex-col gap-2">
              <button type="button" onClick={openBgPicker}
                className="w-full py-3 rounded-2xl text-sm font-semibold transition active:scale-95"
                style={{
                  background: 'var(--card)', border: '1px dashed var(--border)',
                  color: bgFile ? 'var(--accent)' : 'var(--text)',
                }}>
                📸 {bgFile ? 'Change background photo' : 'Upload background photo'}
              </button>

              {hasSplitImage && splitEl && (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => handleSplitImageRequest(splitEl.id, 'left')}
                    className="py-3 rounded-2xl text-xs font-semibold transition active:scale-95"
                    style={{
                      background: 'var(--card)', border: '1px dashed var(--border)',
                      color: splitEl.leftImageUrl ? 'var(--accent)' : 'var(--text)',
                    }}>
                    🖼️ {splitEl.leftImageUrl ? 'Change left photo' : 'Add left photo'}
                  </button>
                  <button type="button" onClick={() => handleSplitImageRequest(splitEl.id, 'right')}
                    className="py-3 rounded-2xl text-xs font-semibold transition active:scale-95"
                    style={{
                      background: 'var(--card)', border: '1px dashed var(--border)',
                      color: splitEl.rightImageUrl ? 'var(--accent)' : 'var(--text)',
                    }}>
                    🖼️ {splitEl.rightImageUrl ? 'Change right photo' : 'Add right photo'}
                  </button>
                </div>
              )}

              {hasCircleImage && (
                <button type="button"
                  onClick={() => {
                    const circleEl = currentSlide.elements.find(
                      (e) => e.type === 'circleImage' && !(e as { imageUrl?: string }).imageUrl
                    );
                    if (circleEl) handleRequestImage(circleEl.id);
                  }}
                  className="w-full py-3 rounded-2xl text-xs font-semibold transition active:scale-95"
                  style={{
                    background: 'var(--card)', border: '1px dashed var(--border)',
                    color: 'var(--text)',
                  }}>
                  ⭕ Add circle photo
                </button>
              )}

              <button type="button" onClick={handleDownloadAll}
                className="w-full py-3 rounded-2xl text-sm font-semibold active:scale-95 transition"
                style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}>
                ⬇ Download {slides.length > 1 ? `all ${slides.length} slides` : 'PNG'}
              </button>
            </div>

            {slides.length > 1 && (
              <div className="w-full max-w-[432px] flex gap-2 overflow-x-auto no-scrollbar py-1">
                {slides.map((s, i) => {
                  const linked = s.linkedTheme !== false;
                  return (
                    <button key={i} onClick={() => setCurrentIndex(i)}
                      className="relative w-14 h-16 rounded-xl shrink-0 transition overflow-hidden"
                      style={{
                        background: s.backgroundImage
                          ? `url(${s.backgroundImage}) center/cover`
                          : 'var(--card)',
                        border: i === currentIndex ? '2px solid var(--accent)' : '1px solid var(--border)',
                      }}>
                      <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold px-1 rounded"
                        style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>{i + 1}</span>
                      <span className="absolute top-0.5 left-0.5 text-[9px]">{linked ? '🔗' : '🔓'}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <p className="text-[10px] hidden lg:block" style={{ color: 'var(--text-muted)' }}>
              Tip: ← → switch slides · Ctrl+Z undo · Esc close
            </p>
          </div>

          <aside className="w-full lg:w-[400px] flex flex-col gap-4">
            <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto no-scrollbar"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {(['theme', 'template', 'text', 'fx', 'style', 'elements'] as Tab[]).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2 rounded-xl text-[11px] font-semibold capitalize transition shrink-0 px-2"
                  style={{
                    background: tab === t ? 'var(--accent)' : 'transparent',
                    color: tab === t ? 'var(--accent-fg)' : 'var(--text-muted)',
                  }}>{t}</button>
              ))}
            </div>

            {tab === 'theme' && (
              <div className="flex flex-col gap-5">
                <div className="rounded-2xl p-3 text-xs"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  🔗 Changes here apply to all <strong>linked</strong> slides.
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Font (all slides)</Label>
                  <FontPicker
                    value={theme.font}
                    onChange={(family) => updateTheme({ font: family })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Text color</Label>
                  <ColorRow colors={COLORS} value={theme.textColor}
                    onChange={(c) => updateTheme({ textColor: c })} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Highlight color</Label>
                  <ColorRow colors={COLORS} value={theme.highlightColor}
                    onChange={(c) => updateTheme({ highlightColor: c })} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Paper background</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['none', 'cream', 'grid', 'lined'] as const).map((p) => (
                      <button key={p} onClick={() => updateTheme({ paperBg: p })}
                        className="py-2 rounded-xl text-[10px] font-semibold capitalize"
                        style={{
                          background: theme.paperBg === p ? 'var(--accent)' : 'var(--card)',
                          color: theme.paperBg === p ? 'var(--accent-fg)' : 'var(--text)',
                          border: '1px solid var(--border)',
                        }}>{p}</button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-3 rounded-2xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}>Auto header</span>
                    <button onClick={() => updateThemeHeader({ enabled: !theme.header.enabled })}
                      className="w-11 h-6 rounded-full relative transition"
                      style={{ background: theme.header.enabled ? 'var(--accent)' : 'var(--border)' }}>
                      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                        style={{ left: theme.header.enabled ? '22px' : '2px' }} />
                    </button>
                  </div>
                  {theme.header.enabled && (
                    <>
                      <input value={theme.header.handle}
                        onChange={(e) => updateThemeHeader({ handle: e.target.value })}
                        placeholder="@yourhandle"
                        className="w-full rounded-xl px-3 py-2 text-xs outline-none"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Progress accent</span>
                        <ColorRow colors={COLORS} value={theme.header.accentColor}
                          onChange={(c) => updateThemeHeader({ accentColor: c })} />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Overlay style</Label>
                  <select value={theme.overlayStyle}
                    onChange={(e) => updateTheme({
                      overlayStyle: e.target.value as SlideTheme['overlayStyle'],
                    })}
                    className="w-full rounded-2xl p-3 text-sm outline-none"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option value="none">None</option>
                    <option value="solid">Solid</option>
                    <option value="gradient-bottom">Gradient (bottom)</option>
                    <option value="gradient-top">Gradient (top)</option>
                    <option value="cinematic">🎬 Cinematic</option>
                    <option value="cinematic-soft">🎬 Cinematic (soft)</option>
                    <option value="double">🎬 Double</option>
                    <option value="vignette">🎬 Vignette</option>
                    <option value="bottom-half">🎬 Bottom half</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Overlay darkness · {Math.round(theme.overlayOpacity * 100)}%</Label>
                  <input type="range" min={0} max={100} value={theme.overlayOpacity * 100}
                    onChange={(e) => updateTheme({ overlayOpacity: Number(e.target.value) / 100 })}
                    className="w-full" />
                </div>

                <div className="flex flex-col gap-3 p-3 rounded-2xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}>🎬 Motion</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      Bring decorative elements to life
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['none', 'breathing', 'floating'] as const).map((m) => (
                      <button key={m}
                        onClick={() => updateTheme({ motion: { ...theme.motion, type: m } })}
                        className="py-2 rounded-xl text-[10px] font-semibold capitalize"
                        style={{
                          background: theme.motion.type === m ? 'var(--accent)' : 'var(--bg)',
                          color: theme.motion.type === m ? 'var(--accent-fg)' : 'var(--text-muted)',
                          border: '1px solid var(--border)',
                        }}>
                        {m === 'none' ? 'Off' : m}
                      </button>
                    ))}
                  </div>

                  {theme.motion.type !== 'none' && (
                    <>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] flex justify-between" style={{ color: 'var(--text-muted)' }}>
                          <span>Speed</span>
                          <span>{theme.motion.speed.toFixed(1)}×</span>
                        </span>
                        <input type="range" min={0.5} max={2} step={0.1}
                          value={theme.motion.speed}
                          onChange={(e) => updateTheme({
                            motion: { ...theme.motion, speed: Number(e.target.value) }
                          })}
                          className="w-full" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] flex justify-between" style={{ color: 'var(--text-muted)' }}>
                          <span>Intensity</span>
                          <span>{theme.motion.intensity.toFixed(1)}×</span>
                        </span>
                        <input type="range" min={0.5} max={1.5} step={0.1}
                          value={theme.motion.intensity}
                          onChange={(e) => updateTheme({
                            motion: { ...theme.motion, intensity: Number(e.target.value) }
                          })}
                          className="w-full" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {tab === 'template' && (
              <div className="grid grid-cols-1 gap-3">
                {TEMPLATES.map((t) => {
                  const isActive = activeTemplate === t.id;
                  return (
                    <button key={t.id} onClick={() => applyTemplate(t.id)}
                      className="p-3 rounded-2xl text-left transition active:scale-[0.98] flex gap-3"
                      style={{
                        background: isActive ? 'var(--card-hover)' : 'var(--card)',
                        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      }}>
                      <div className="shrink-0">
                        <TemplatePreview templateId={t.id} baseConfig={currentSlide} width={72} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{t.emoji}</span>
                          <span className="text-sm font-semibold truncate">{t.name}</span>
                          {isActive && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0"
                              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>ON</span>
                          )}
                        </div>
                        <p className="text-[10px] leading-tight mt-1 line-clamp-2"
                          style={{ color: 'var(--text-muted)' }}>{t.tagline}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {tab === 'text' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Headline</Label>
                  <textarea value={currentSlide.headline}
                    onChange={(e) => updateCurrentSlide({ headline: e.target.value })}
                    rows={3}
                    className="w-full rounded-2xl p-3 text-sm outline-none resize-none"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Highlight word</Label>
                  <input value={currentSlide.highlightWord}
                    onChange={(e) => updateCurrentSlide({ highlightWord: e.target.value })}
                    className="w-full rounded-2xl p-3 text-sm outline-none"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>
            )}

            {tab === 'fx' && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label>Letter spacing · {currentSlide.letterSpacing.toFixed(1)}px</Label>
                  <input type="range" min={-2} max={12} step={0.5}
                    value={currentSlide.letterSpacing}
                    onChange={(e) => updateCurrentSlide({ letterSpacing: Number(e.target.value) })}
                    className="w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Text position · {Math.round(currentSlide.textY * 100)}%</Label>
                  <input type="range" min={0} max={100} value={currentSlide.textY * 100}
                    onChange={(e) => updateCurrentSlide({ textY: Number(e.target.value) / 100 })}
                    className="w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Outline · {currentSlide.textStroke.width.toFixed(1)}px</Label>
                  <input type="range" min={0} max={6} step={0.5}
                    value={currentSlide.textStroke.width}
                    onChange={(e) => updateCurrentSlide({
                      textStroke: { ...currentSlide.textStroke, width: Number(e.target.value) },
                    })}
                    className="w-full" />
                  {currentSlide.textStroke.width > 0 && (
                    <ColorRow colors={COLORS} value={currentSlide.textStroke.color}
                      onChange={(c) => updateCurrentSlide({
                        textStroke: { ...currentSlide.textStroke, color: c },
                      })} />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Shadow blur · {currentSlide.textShadow.blur.toFixed(0)}px</Label>
                  <input type="range" min={0} max={30} value={currentSlide.textShadow.blur}
                    onChange={(e) => updateCurrentSlide({
                      textShadow: { ...currentSlide.textShadow, blur: Number(e.target.value) },
                    })}
                    className="w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Quick presets</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <PresetButton label="Clean" onClick={() => updateCurrentSlide({
                      textStroke: { color: '#000', width: 0 },
                      textShadow: { color: '#000', blur: 0, offsetX: 0, offsetY: 0 },
                    })} />
                    <PresetButton label="Outline" onClick={() => updateCurrentSlide({
                      textStroke: { color: '#000000', width: 2.5 },
                    })} />
                    <PresetButton label="Glow" onClick={() => updateCurrentSlide({
                      textShadow: { color: currentSlide.highlightColor, blur: 18, offsetX: 0, offsetY: 0 },
                    })} />
                    <PresetButton label="Meme" onClick={() => updateCurrentSlide({
                      textStroke: { color: '#000000', width: 3 },
                      textShadow: { color: '#000000', blur: 4, offsetX: 3, offsetY: 3 },
                    })} />
                    <PresetButton label="Editorial" onClick={() => updateCurrentSlide({
                      textShadow: { color: '#000000', blur: 8, offsetX: 0, offsetY: 2 },
                      letterSpacing: -0.5,
                    })} />
                    <PresetButton label="Neon" onClick={() => updateCurrentSlide({
                      textShadow: { color: '#22d3ee', blur: 22, offsetX: 0, offsetY: 0 },
                    })} />
                  </div>
                </div>
              </div>
            )}

            {tab === 'style' && (
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl p-3 text-xs"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  💡 Most styling is shared. Change the whole set in <strong>Theme</strong>.
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Alignment</Label>
                  <div className="flex gap-2">
                    {(['left', 'center', 'right'] as const).map((a) => (
                      <button key={a} onClick={() => updateCurrentSlide({ align: a })}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize"
                        style={{
                          background: currentSlide.align === a ? 'var(--accent)' : 'var(--card)',
                          color: currentSlide.align === a ? 'var(--accent-fg)' : 'var(--text)',
                          border: '1px solid var(--border)',
                        }}>{a}</button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Font size · {currentSlide.fontSize}px</Label>
                  <input type="range" min={16} max={72} value={currentSlide.fontSize}
                    onChange={(e) => updateCurrentSlide({ fontSize: Number(e.target.value) })}
                    className="w-full" />
                </div>
              </div>
            )}

            {tab === 'elements' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Shapes & elements</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <AddButton onClick={() => addElement('circleImage')} emoji="⭕" label="Circle" />
                    <AddButton onClick={() => addElement('logoPill')} emoji="🏷️" label="Logo" />
                    <AddButton onClick={() => addElement('swipeArrow')} emoji="➡️" label="Arrow" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Editorial</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <AddButton onClick={() => addElement('headingNumber')} emoji="🔢" label="Big Number" />
                    <AddButton onClick={() => addElement('headingText')} emoji="📰" label="Heading" />
                    <AddButton onClick={() => addElement('bodyText')} emoji="📄" label="Body Text" />
                    <AddButton onClick={() => addElement('card')} emoji="🗂️" label="Card" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Split quote kit ⭐</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <AddButton onClick={() => addElement('splitImage')} emoji="🖼️" label="Split Image" />
                    <AddButton onClick={() => addElement('quoteMark')} emoji="❝" label="Quote Mark" />
                    <AddButton onClick={() => addElement('attribution')} emoji="🖋️" label="Attribution" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>🎨 Basquiat kit</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <AddButton onClick={() => addElement('crown')} emoji="👑" label="Crown" />
                    <AddButton onClick={() => addElement('crossout')} emoji="✏️" label="Cross-out" />
                    <AddButton onClick={() => addElement('tag')} emoji="🏷️" label="Tag" />
                  </div>
                </div>
                {currentSlide.elements.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                    No elements on this slide yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {currentSlide.elements.map((el) => (
                      <ElementControls key={el.id} element={el}
                        onChange={(patch) => updateElement(el.id, patch)}
                        onRemove={() => removeElement(el.id)}
                        onRequestImage={() => handleRequestImage(el.id)}
                        onSplitImageRequest={(side) => handleSplitImageRequest(el.id, side)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 fade-in">
          <div className="px-5 py-3 rounded-2xl text-sm font-medium shadow-lg"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Helpers ----------
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-wider"
      style={{ color: 'var(--text-muted)' }}>{children}</label>
  );
}

function FontPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (family: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentEntry = findFontEntry(value);
  const currentLabel = currentEntry?.name ?? 'Custom';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-2xl p-3 text-sm outline-none text-left flex items-center justify-between"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
      >
        <span style={{ fontFamily: value }}>{currentLabel}</span>
        <span style={{ color: 'var(--text-muted)' }}>▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl overflow-hidden shadow-xl fade-in"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              maxHeight: 320,
              overflowY: 'auto',
            }}
          >
            <div
              className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider sticky top-0"
              style={{ background: 'var(--card)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
            >
              Fonts
            </div>
            {ALL_FONTS.map((f) => {
              const family = fontEntryToFamily(f);
              const isActive = value === family;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    onChange(family);
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 transition flex items-center justify-between"
                  style={{
                    background: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? 'var(--accent-fg)' : 'var(--text)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontFamily: family, fontSize: 16 }}>{f.name}</span>
                  <span className="text-[10px] opacity-60">{f.category}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ColorRow({
  colors, value, onChange,
}: { colors: string[]; value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {colors.map((c) => (
        <button key={c} onClick={() => onChange(c)}
          className="w-8 h-8 rounded-full transition active:scale-90"
          style={{
            background: c,
            border: value.toLowerCase() === c.toLowerCase() ? '3px solid var(--accent)' : '1px solid var(--border)',
          }} />
      ))}
    </div>
  );
}

function AddButton({
  onClick, emoji, label,
}: { onClick: () => void; emoji: string; label: string }) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-1 py-3 rounded-2xl transition active:scale-95"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <span className="text-xl">{emoji}</span>
      <span className="text-[10px] text-center px-1" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </button>
  );
}

function PresetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="py-2 rounded-xl text-xs font-semibold transition active:scale-95"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
      {label}
    </button>
  );
}

function RangeRow({
  label, min, max, value, display, onChange,
}: {
  label: string; min: number; max: number; value: number; display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] flex justify-between" style={{ color: 'var(--text-muted)' }}>
        <span>{label}</span>
        <span>{display}</span>
      </span>
      <input type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </div>
  );
}

function MiniColorRow({
  label, colors, value, onChange,
}: {
  label: string; colors: string[]; value: string; onChange: (c: string) => void;
}) {
  return (
    <div className="flex gap-2 items-center flex-wrap">
      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
      {colors.map((c) => (
        <button key={c} onClick={() => onChange(c)}
          className="w-6 h-6 rounded-full transition active:scale-90"
          style={{
            background: c,
            border: value.toLowerCase() === c.toLowerCase() ? '2px solid var(--accent)' : '1px solid var(--border)',
          }} />
      ))}
    </div>
  );
}

function ElementControls({
  element, onChange, onRemove, onRequestImage, onSplitImageRequest,
}: {
  element: CanvasElement;
  onChange: (patch: Partial<CanvasElement>) => void;
  onRemove: () => void;
  onRequestImage: () => void;
  onSplitImageRequest: (side: 'left' | 'right') => void;
}) {
  const typeLabel: Record<CanvasElement['type'], string> = {
    circleImage: '⭕ Circle image',
    logoPill: '🏷️ Logo pill',
    swipeArrow: '➡️ Swipe arrow',
    headingNumber: '🔢 Big number',
    headingText: '📰 Heading text',
    bodyText: '📄 Body text',
    card: '🗂️ Info card',
    splitImage: '🖼️ Split image',
    quoteMark: '❝ Quote mark',
    attribution: '🖋️ Attribution',
    crossout: '✏️ Cross-out',
    crown: '👑 Crown',
    tag: '🏷️ Tag',
  };

  return (
    <div className="p-3 rounded-2xl flex flex-col gap-3"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold">{typeLabel[element.type]}</span>
        <button onClick={onRemove} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#ef4444' }}>
          Remove
        </button>
      </div>

      {element.type === 'circleImage' && (
        <>
          <button onClick={onRequestImage}
            className="text-xs py-2 px-3 rounded-xl text-center transition"
            style={{
              background: 'var(--bg)', border: '1px dashed var(--border)',
              color: element.imageUrl ? 'var(--accent)' : 'var(--text-muted)',
            }}>
            {element.imageUrl ? '✓ Image set' : 'Pick image'}
          </button>
          <RangeRow label="Size" min={10} max={50} value={element.size * 100}
            display={`${Math.round(element.size * 100)}%`}
            onChange={(v) => onChange({ size: v / 100 } as Partial<CanvasElement>)} />
        </>
      )}

      {element.type === 'splitImage' && (
        <SplitImageControls element={element} onChange={onChange} onRequestImage={onSplitImageRequest} />
      )}

      {element.type === 'quoteMark' && (
        <>
          <input value={element.char}
            onChange={(e) => onChange({ char: e.target.value } as Partial<CanvasElement>)}
            placeholder={'"'}
            className="w-full rounded-xl px-3 py-2 text-xs outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <RangeRow label="Size" min={40} max={180} value={element.fontSize}
            display={`${element.fontSize}px`}
            onChange={(v) => onChange({ fontSize: v } as Partial<CanvasElement>)} />
          <MiniColorRow label="Color" colors={['#ffffff', '#e07a3f', '#fbbf24', '#22c55e', '#ef4444']}
            value={element.color} onChange={(c) => onChange({ color: c } as Partial<CanvasElement>)} />
        </>
      )}

      {element.type === 'attribution' && (
        <>
          <input value={element.text}
            onChange={(e) => onChange({ text: e.target.value } as Partial<CanvasElement>)}
            placeholder="- Author, Source (Year)"
            className="w-full rounded-xl px-3 py-2 text-xs outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <RangeRow label="Size" min={9} max={22} value={element.fontSize}
            display={`${element.fontSize}px`}
            onChange={(v) => onChange({ fontSize: v } as Partial<CanvasElement>)} />
          <MiniColorRow label="Color" colors={['#ffffff', '#e07a3f', '#fbbf24', '#000000', '#666666']}
            value={element.color} onChange={(c) => onChange({ color: c } as Partial<CanvasElement>)} />
        </>
      )}

      {element.type === 'logoPill' && (
        <>
          <input value={element.text}
            onChange={(e) => onChange({ text: e.target.value } as Partial<CanvasElement>)}
            placeholder="Logo text"
            className="w-full rounded-xl px-3 py-2 text-xs outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <MiniColorRow label="BG" colors={['#ef4444', '#fbbf24', '#22d3ee', '#8b5cf6', '#22c55e', '#e07a3f', '#000000']}
            value={element.bgColor}
            onChange={(c) => onChange({ bgColor: c } as Partial<CanvasElement>)} />
        </>
      )}

      {element.type === 'swipeArrow' && (
        <RangeRow label="Size" min={5} max={20} value={element.size * 100}
          display={`${Math.round(element.size * 100)}%`}
          onChange={(v) => onChange({ size: v / 100 } as Partial<CanvasElement>)} />
      )}

      {element.type === 'headingNumber' && (
        <>
          <input value={element.number}
            onChange={(e) => onChange({ number: e.target.value } as Partial<CanvasElement>)}
            placeholder="01"
            className="w-full rounded-xl px-3 py-2 text-xs outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <RangeRow label="Size" min={30} max={140} value={element.fontSize}
            display={`${element.fontSize}px`}
            onChange={(v) => onChange({ fontSize: v } as Partial<CanvasElement>)} />
          <MiniColorRow label="Color" colors={['#e07a3f', '#111111', '#fbbf24', '#22c55e', '#ef4444', '#22d3ee']}
            value={element.color} onChange={(c) => onChange({ color: c } as Partial<CanvasElement>)} />
        </>
      )}

      {element.type === 'headingText' && (
        <>
          <textarea value={element.text}
            onChange={(e) => onChange({ text: e.target.value } as Partial<CanvasElement>)}
            rows={2}
            placeholder="Your big headline"
            className="w-full rounded-xl px-3 py-2 text-xs outline-none resize-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <RangeRow label="Size" min={16} max={60} value={element.fontSize}
            display={`${element.fontSize}px`}
            onChange={(v) => onChange({ fontSize: v } as Partial<CanvasElement>)} />
          <MiniColorRow label="Color" colors={['#111111', '#ffffff', '#e07a3f', '#fbbf24', '#22c55e', '#ef4444']}
            value={element.color} onChange={(c) => onChange({ color: c } as Partial<CanvasElement>)} />
          <button onClick={() => onChange({ shadow: !element.shadow } as Partial<CanvasElement>)}
            className="py-2 rounded-xl text-[10px] font-semibold"
            style={{
              background: element.shadow ? 'var(--accent)' : 'var(--bg)',
              color: element.shadow ? 'var(--accent-fg)' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}>Text Shadow {element.shadow ? 'ON' : 'OFF'}</button>
        </>
      )}

      {element.type === 'bodyText' && (
        <>
          <textarea value={element.text}
            onChange={(e) => onChange({ text: e.target.value } as Partial<CanvasElement>)}
            rows={3}
            placeholder="Paragraph text"
            className="w-full rounded-xl px-3 py-2 text-xs outline-none resize-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <RangeRow label="Size" min={10} max={24} value={element.fontSize}
            display={`${element.fontSize}px`}
            onChange={(v) => onChange({ fontSize: v } as Partial<CanvasElement>)} />
          <MiniColorRow label="Color" colors={['#4a4a4a', '#111111', '#ffffff', '#666666', '#e07a3f']}
            value={element.color} onChange={(c) => onChange({ color: c } as Partial<CanvasElement>)} />
        </>
      )}

      {element.type === 'card' && (
        <CardControls element={element} onChange={onChange} />
      )}

      {element.type === 'crossout' && (
        <>
          <RangeRow label="Width" min={10} max={100} value={element.width * 100}
            display={`${Math.round(element.width * 100)}%`}
            onChange={(v) => onChange({ width: v / 100 } as Partial<CanvasElement>)} />
          <RangeRow label="Thickness" min={2} max={14} value={element.height}
            display={`${element.height}px`}
            onChange={(v) => onChange({ height: v } as Partial<CanvasElement>)} />
          <RangeRow label="Rotation" min={-15} max={15} value={element.rotation}
            display={`${element.rotation}°`}
            onChange={(v) => onChange({ rotation: v } as Partial<CanvasElement>)} />
          <MiniColorRow label="Color"
            colors={['#dc2626', '#111111', '#fbbf24', '#1d4ed8', '#16a34a']}
            value={element.color}
            onChange={(c) => onChange({ color: c } as Partial<CanvasElement>)} />
        </>
      )}

      {element.type === 'crown' && (
        <>
          <RangeRow label="Size" min={5} max={60} value={element.size * 100}
            display={`${Math.round(element.size * 100)}%`}
            onChange={(v) => onChange({ size: v / 100 } as Partial<CanvasElement>)} />
          <RangeRow label="Stroke" min={0} max={10} value={element.strokeWidth}
            display={`${element.strokeWidth}px`}
            onChange={(v) => onChange({ strokeWidth: v } as Partial<CanvasElement>)} />
          <div className="flex gap-2">
            <button onClick={() => onChange({ style: 'solid' } as Partial<CanvasElement>)}
              className="flex-1 py-2 rounded-xl text-[10px] font-semibold"
              style={{
                background: element.style === 'solid' ? 'var(--accent)' : 'var(--bg)',
                color: element.style === 'solid' ? 'var(--accent-fg)' : 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>Solid</button>
            <button onClick={() => onChange({ style: 'outline' } as Partial<CanvasElement>)}
              className="flex-1 py-2 rounded-xl text-[10px] font-semibold"
              style={{
                background: element.style === 'outline' ? 'var(--accent)' : 'var(--bg)',
                color: element.style === 'outline' ? 'var(--accent-fg)' : 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>Outline</button>
          </div>
          <MiniColorRow label="Fill"
            colors={['#fbbf24', '#dc2626', '#1d4ed8', '#16a34a', '#111111', '#ffffff']}
            value={element.color}
            onChange={(c) => onChange({ color: c } as Partial<CanvasElement>)} />
          <MiniColorRow label="Stroke"
            colors={['#000000', '#ffffff', '#dc2626', '#1d4ed8']}
            value={element.strokeColor}
            onChange={(c) => onChange({ strokeColor: c } as Partial<CanvasElement>)} />
        </>
      )}

      {element.type === 'tag' && (
        <>
          <input value={element.text}
            onChange={(e) => onChange({ text: e.target.value } as Partial<CanvasElement>)}
            placeholder="© 2026"
            className="w-full rounded-xl px-3 py-2 text-xs outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <RangeRow label="Size" min={8} max={32} value={element.fontSize}
            display={`${element.fontSize}px`}
            onChange={(v) => onChange({ fontSize: v } as Partial<CanvasElement>)} />
          <RangeRow label="Rotation" min={-15} max={15} value={element.rotation}
            display={`${element.rotation}°`}
            onChange={(v) => onChange({ rotation: v } as Partial<CanvasElement>)} />
          <MiniColorRow label="Color"
            colors={['#111111', '#dc2626', '#1d4ed8', '#16a34a', '#fbbf24']}
            value={element.color}
            onChange={(c) => onChange({ color: c } as Partial<CanvasElement>)} />
        </>
      )}
    </div>
  );
}

function SplitImageControls({
  element, onChange, onRequestImage,
}: {
  element: SplitImageElement;
  onChange: (patch: Partial<CanvasElement>) => void;
  onRequestImage: (side: 'left' | 'right') => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => onRequestImage('left')}
          className="text-[10px] py-2 px-2 rounded-xl text-center transition"
          style={{
            background: 'var(--bg)', border: '1px dashed var(--border)',
            color: element.leftImageUrl ? 'var(--accent)' : 'var(--text-muted)',
          }}>
          {element.leftImageUrl ? '✓ Left set' : 'Left image'}
        </button>
        <button onClick={() => onRequestImage('right')}
          className="text-[10px] py-2 px-2 rounded-xl text-center transition"
          style={{
            background: 'var(--bg)', border: '1px dashed var(--border)',
            color: element.rightImageUrl ? 'var(--accent)' : 'var(--text-muted)',
          }}>
          {element.rightImageUrl ? '✓ Right set' : 'Right image'}
        </button>
      </div>
      <RangeRow label="Split ratio" min={20} max={80} value={element.splitRatio * 100}
        display={`${Math.round(element.splitRatio * 100)} / ${Math.round(100 - element.splitRatio * 100)}`}
        onChange={(v) => onChange({ splitRatio: v / 100 } as Partial<CanvasElement>)} />
      <RangeRow label="Height" min={20} max={100} value={element.height * 100}
        display={`${Math.round(element.height * 100)}%`}
        onChange={(v) => onChange({ height: v / 100 } as Partial<CanvasElement>)} />
    </>
  );
}

function CardControls({
  element, onChange,
}: {
  element: CardElement;
  onChange: (patch: Partial<CanvasElement>) => void;
}) {
  const stats = element.stats ?? [];
  const updateStat = (i: number, patch: Partial<CardStat>) => {
    const next = stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    onChange({ stats: next } as Partial<CanvasElement>);
  };

  return (
    <>
      <input value={element.title}
        onChange={(e) => onChange({ title: e.target.value } as Partial<CanvasElement>)}
        placeholder="Card title"
        className="w-full rounded-xl px-3 py-2 text-xs outline-none font-semibold"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
      <textarea value={element.subtitle}
        onChange={(e) => onChange({ subtitle: e.target.value } as Partial<CanvasElement>)}
        rows={2} placeholder="Short description"
        className="w-full rounded-xl px-3 py-2 text-xs outline-none resize-none"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />

      <div className="flex flex-col gap-2 mt-1">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Stats (3)
        </span>
        {[0, 1, 2].map((i) => {
          const s = stats[i] ?? { icon: '★', value: '', label: '' };
          return (
            <div key={i} className="flex gap-1">
              <input value={s.icon} onChange={(e) => updateStat(i, { icon: e.target.value })}
                placeholder="★"
                className="w-10 rounded-lg px-2 py-1 text-xs text-center outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              <input value={s.value} onChange={(e) => updateStat(i, { value: e.target.value })}
                placeholder="10.5k"
                className="flex-1 rounded-lg px-2 py-1 text-xs outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              <input value={s.label} onChange={(e) => updateStat(i, { label: e.target.value })}
                placeholder="Stars"
                className="flex-1 rounded-lg px-2 py-1 text-xs outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
          );
        })}
      </div>

      <MiniColorRow label="Card" colors={['#ffffff', '#faf7f0', '#111111', '#1a1a1a']}
        value={element.bgColor}
        onChange={(c) => onChange({ bgColor: c } as Partial<CanvasElement>)} />
      <MiniColorRow label="Accent" colors={['#fbbf24', '#e07a3f', '#22c55e', '#22d3ee', '#ef4444', '#8b5cf6']}
        value={element.accentColor}
        onChange={(c) => onChange({ accentColor: c } as Partial<CanvasElement>)} />
    </>
  );
}