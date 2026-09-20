// components/editor/EditorScreen.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type Konva from 'konva';
import { savePost } from '@/lib/storage';
import {
  DEFAULT_CONFIG,
  createEmptySlide,
  normalizeConfig,
  type PostConfig,
  type CanvasElement,
  type CardElement,
  type CardStat,
  type SplitImageElement,
} from '@/lib/types';
import { TEMPLATES, getTemplate, type TemplateId } from '@/lib/templates';
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

type Tab = 'template' | 'text' | 'fx' | 'style' | 'elements';

type Props = {
  onClose: () => void;
  onSaved?: () => void;
  initialTemplate?: TemplateId;
  editingPostId?: string;
  initialSlides?: PostConfig[];
};

const FONTS = [
  { label: 'Impact', value: 'Impact, "Arial Black", sans-serif' },
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Georgia (serif)', value: 'Georgia, serif' },
  { label: 'Courier (mono)', value: '"Courier New", monospace' },
  { label: 'Trebuchet', value: '"Trebuchet MS", sans-serif' },
  { label: 'Arial Black', value: '"Arial Black", sans-serif' },
  { label: 'Comic Sans (fun)', value: '"Comic Sans MS", cursive' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
];

const COLORS = [
  '#ffffff', '#000000', '#00d97e', '#fbbf24', '#ef4444',
  '#8b5cf6', '#22d3ee', '#ec4899', '#22c55e', '#f97316',
  '#0ea5e9', '#a855f7', '#14b8a6', '#f43f5e', '#eab308',
  '#e07a3f', '#faf7f0', '#1a1a1a', '#4a4a4a', '#666666',
];

export default function EditorScreen({
  onClose, onSaved, initialTemplate, editingPostId, initialSlides,
}: Props) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const elementImageInputRef = useRef<HTMLInputElement>(null);

  const pendingElementIdRef = useRef<string | null>(null);
  const pendingSplitSideRef = useRef<'left' | 'right' | null>(null);

  const [slides, setSlides] = useState<PostConfig[]>(() => {
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
    return [base];
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentSlide = slides[currentIndex];

  const updateCurrentSlide = (patch: Partial<PostConfig>) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === currentIndex ? { ...s, ...patch } : s))
    );
  };

  const addSlide = () => {
    setSlides((prev) => [...prev, createEmptySlide()]);
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
    });
    setCurrentIndex((i) => i + 1);
  };
  const deleteSlide = () => {
    if (slides.length === 1) {
      setSlides([createEmptySlide()]);
      setCurrentIndex(0);
      return;
    }
    const next = slides.filter((_, i) => i !== currentIndex);
    setSlides(next);
    setCurrentIndex(Math.min(currentIndex, next.length - 1));
  };
  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex((i) => Math.min(slides.length - 1, i + 1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length]);

  const [bgFile, setBgFile] = useState<File | null>(null);

  const openBgPicker = () => {
    bgInputRef.current?.click();
  };

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
    setSlides((prev) =>
      prev.map((s, i) =>
        i === currentIndex
          ? {
              ...s,
              ...t.config,
              elements: t.elements ? t.elements : s.elements,
            }
          : s
      )
    );
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
      el = { id, type: 'headingNumber', x: 0.06, y: 0.12, number: '01', fontSize: 80, color: '#e07a3f', font: 'Georgia, serif', italic: true, snap: 'free' };
    } else if (type === 'headingText') {
      el = { id, type: 'headingText', x: 0.06, y: 0.22, text: 'Your big headline goes here', fontSize: 34, color: '#1a1a1a', font: 'Inter, system-ui, sans-serif', lineHeight: 1.05, bold: true, width: 0.85, align: 'left', shadow: false, snap: 'free' };
    } else if (type === 'bodyText') {
      el = { id, type: 'bodyText', x: 0.06, y: 0.45, text: 'A short paragraph that describes your story in one or two sentences.', fontSize: 14, color: '#4a4a4a', font: 'Inter, system-ui, sans-serif', lineHeight: 1.4, width: 0.85, align: 'left', snap: 'free' };
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
      el = { id, type: 'quoteMark', x: 0.06, y: 0.5, char: '"', fontSize: 100, color: '#ffffff', font: 'Georgia, serif', snap: 'free' };
    } else if (type === 'attribution') {
      el = {
        id, type: 'attribution',
        x: 0.06, y: 0.87,
        text: '- Author Name, Source (Year)',
        fontSize: 13,
        color: '#ffffff',
        font: 'Inter, system-ui, sans-serif',
        letterSpacing: 1,
        uppercase: false,
        bold: true,
        width: 0.85,
        align: 'left',
        snap: 'free',
      };
    } else {
      el = {
        id, type: 'card',
        x: 0.06, y: 0.62,
        width: 0.88,
        title: 'username/repo-name',
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

  const [tab, setTab] = useState<Tab>('template');
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
      savePost({
        id: editingPostId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        slides: [...slides],
        previewDataUrl,
        createdAt: Date.now(),
      });
      setToast('Saved!');
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
        <button onClick={onClose} className="px-3 py-2 rounded-xl text-sm font-medium"
          style={{ color: 'var(--text-muted)' }}>✕ Cancel</button>
        <p className="text-sm font-semibold">{editingPostId ? 'Edit Post' : 'New Post'}</p>
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 disabled:opacity-50 transition"
          style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </header>

      <div className="px-4 py-3 flex items-center justify-between gap-3 shrink-0 overflow-x-auto no-scrollbar"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={goPrev} disabled={currentIndex === 0}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>◀</button>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            Slide {currentIndex + 1} / {slides.length}
          </span>
          <button onClick={goNext} disabled={currentIndex === slides.length - 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>▶</button>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={addSlide} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>+ Add</button>
          <button onClick={duplicateSlide} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>⧉ Duplicate</button>
          <button onClick={deleteSlide} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ color: '#ef4444', background: 'var(--card)', border: '1px solid var(--border)' }}>🗑 Delete</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1100px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col items-center gap-4">
            <div className="shadow-2xl rounded-3xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}>
              <PostCanvas config={currentSlide} onChange={updateCurrentSlide}
                stageRef={stageRef} onRequestImage={handleRequestImage}
                onRequestSplitImage={handleSplitImageRequest}
                slideIndex={currentIndex} slideCount={slides.length} />
            </div>

            <div className="w-full max-w-[432px] flex flex-col gap-2">
              <button
                type="button"
                onClick={openBgPicker}
                className="w-full py-3 rounded-2xl text-sm font-semibold transition active:scale-95"
                style={{
                  background: 'var(--card)',
                  border: '1px dashed var(--border)',
                  color: bgFile ? 'var(--accent)' : 'var(--text)',
                }}
              >
                📸 {bgFile ? 'Change background photo' : 'Upload background photo'}
              </button>

              {hasSplitImage && splitEl && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSplitImageRequest(splitEl.id, 'left')}
                    className="py-3 rounded-2xl text-xs font-semibold transition active:scale-95"
                    style={{
                      background: 'var(--card)',
                      border: '1px dashed var(--border)',
                      color: splitEl.leftImageUrl ? 'var(--accent)' : 'var(--text)',
                    }}
                  >
                    🖼️ {splitEl.leftImageUrl ? 'Change left photo' : 'Add left photo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSplitImageRequest(splitEl.id, 'right')}
                    className="py-3 rounded-2xl text-xs font-semibold transition active:scale-95"
                    style={{
                      background: 'var(--card)',
                      border: '1px dashed var(--border)',
                      color: splitEl.rightImageUrl ? 'var(--accent)' : 'var(--text)',
                    }}
                  >
                    🖼️ {splitEl.rightImageUrl ? 'Change right photo' : 'Add right photo'}
                  </button>
                </div>
              )}

              {hasCircleImage && (
                <button
                  type="button"
                  onClick={() => {
                    const circleEl = currentSlide.elements.find(
                      (e) => e.type === 'circleImage' && !(e as { imageUrl?: string }).imageUrl
                    );
                    if (circleEl) handleRequestImage(circleEl.id);
                  }}
                  className="w-full py-3 rounded-2xl text-xs font-semibold transition active:scale-95"
                  style={{
                    background: 'var(--card)',
                    border: '1px dashed var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  ⭕ Add circle photo
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadAll}
                className="w-full py-3 rounded-2xl text-sm font-semibold active:scale-95 transition"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                ⬇ Download {slides.length > 1 ? `all ${slides.length} slides` : 'PNG'}
              </button>
            </div>

            {slides.length > 1 && (
              <div className="w-full max-w-[432px] flex gap-2 overflow-x-auto no-scrollbar py-1">
                {slides.map((s, i) => (
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
                  </button>
                ))}
              </div>
            )}

            <p className="text-[10px] hidden lg:block" style={{ color: 'var(--text-muted)' }}>
              Tip: use ← → to switch slides, Esc to close
            </p>
          </div>

          <aside className="w-full lg:w-[400px] flex flex-col gap-4">
            <div className="flex gap-1 p-1 rounded-2xl overflow-x-auto no-scrollbar"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {(['template', 'text', 'fx', 'style', 'elements'] as Tab[]).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2 rounded-xl text-[11px] font-semibold capitalize transition shrink-0 px-2"
                  style={{
                    background: tab === t ? 'var(--accent)' : 'transparent',
                    color: tab === t ? 'var(--accent-fg)' : 'var(--text-muted)',
                  }}>{t}</button>
              ))}
            </div>

            {tab === 'template' && (
              <div className="grid grid-cols-1 gap-3">
                {TEMPLATES.map((t) => {
                  const isActive = activeTemplate === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t.id)}
                      className="p-3 rounded-2xl text-left transition active:scale-[0.98] flex gap-3"
                      style={{
                        background: isActive ? 'var(--card-hover)' : 'var(--card)',
                        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                      }}
                    >
                      <div className="shrink-0">
                        <TemplatePreview
                          templateId={t.id}
                          baseConfig={currentSlide}
                          width={72}
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{t.emoji}</span>
                          <span className="text-sm font-semibold truncate">{t.name}</span>
                          {isActive && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0"
                              style={{
                                background: 'var(--accent)',
                                color: 'var(--accent-fg)',
                              }}
                            >
                              ON
                            </span>
                          )}
                        </div>
                        <p
                          className="text-[10px] leading-tight mt-1 line-clamp-2"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {t.tagline}
                        </p>
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
                <button onClick={() => updateCurrentSlide({ uppercase: !currentSlide.uppercase })}
                  className="flex items-center justify-between p-3 rounded-2xl transition"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <span className="text-sm font-medium">UPPERCASE</span>
                  <span className="w-11 h-6 rounded-full relative transition"
                    style={{ background: currentSlide.uppercase ? 'var(--accent)' : 'var(--border)' }}>
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                      style={{ left: currentSlide.uppercase ? '22px' : '2px' }} />
                  </span>
                </button>
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
                {currentSlide.textShadow.blur > 0 && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label>Offset · X {currentSlide.textShadow.offsetX}, Y {currentSlide.textShadow.offsetY}</Label>
                      <div className="flex gap-2">
                        <input type="range" min={-15} max={15} value={currentSlide.textShadow.offsetX}
                          onChange={(e) => updateCurrentSlide({
                            textShadow: { ...currentSlide.textShadow, offsetX: Number(e.target.value) },
                          })}
                          className="w-full" />
                        <input type="range" min={-15} max={15} value={currentSlide.textShadow.offsetY}
                          onChange={(e) => updateCurrentSlide({
                            textShadow: { ...currentSlide.textShadow, offsetY: Number(e.target.value) },
                          })}
                          className="w-full" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Shadow color</Label>
                      <ColorRow colors={COLORS} value={currentSlide.textShadow.color}
                        onChange={(c) => updateCurrentSlide({
                          textShadow: { ...currentSlide.textShadow, color: c },
                        })} />
                    </div>
                  </>
                )}
                <div className="flex flex-col gap-2">
                  <Label>Quick presets</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <PresetButton label="Clean" onClick={() => updateCurrentSlide({
                      textStroke: { color: '#000', width: 0 },
                      textShadow: { color: '#000', blur: 0, offsetX: 0, offsetY: 0 },
                    })} />
                    <PresetButton label="Outline" onClick={() => updateCurrentSlide({
                      textStroke: { color: '#000000', width: 2.5 },
                      textShadow: { color: '#000', blur: 0, offsetX: 0, offsetY: 0 },
                    })} />
                    <PresetButton label="Glow" onClick={() => updateCurrentSlide({
                      textStroke: { color: '#000', width: 0 },
                      textShadow: { color: currentSlide.highlightColor, blur: 18, offsetX: 0, offsetY: 0 },
                    })} />
                    <PresetButton label="Meme" onClick={() => updateCurrentSlide({
                      textStroke: { color: '#000000', width: 3 },
                      textShadow: { color: '#000000', blur: 4, offsetX: 3, offsetY: 3 },
                    })} />
                    <PresetButton label="Editorial" onClick={() => updateCurrentSlide({
                      textStroke: { color: '#000', width: 0 },
                      textShadow: { color: '#000000', blur: 8, offsetX: 0, offsetY: 2 },
                      letterSpacing: -0.5,
                    })} />
                    <PresetButton label="Neon" onClick={() => updateCurrentSlide({
                      textStroke: { color: '#000000', width: 0 },
                      textShadow: { color: '#22d3ee', blur: 22, offsetX: 0, offsetY: 0 },
                    })} />
                  </div>
                </div>
              </div>
            )}

            {tab === 'style' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Font</Label>
                  <select value={currentSlide.font}
                    onChange={(e) => updateCurrentSlide({ font: e.target.value })}
                    className="w-full rounded-2xl p-3 text-sm outline-none"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Font size · {currentSlide.fontSize}px</Label>
                  <input type="range" min={20} max={72} value={currentSlide.fontSize}
                    onChange={(e) => updateCurrentSlide({ fontSize: Number(e.target.value) })}
                    className="w-full" />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Text color</Label>
                  <ColorRow colors={COLORS} value={currentSlide.textColor}
                    onChange={(c) => updateCurrentSlide({ textColor: c })} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Highlight color</Label>
                  <ColorRow colors={COLORS} value={currentSlide.highlightColor}
                    onChange={(c) => updateCurrentSlide({ highlightColor: c })} />
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
                  <Label>Paper background</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['none', 'cream', 'grid', 'lined'] as const).map((p) => (
                      <button key={p} onClick={() => updateCurrentSlide({
                        paperBg: p,
                        backgroundImage: p !== 'none' ? null : currentSlide.backgroundImage,
                      })}
                        className="py-2 rounded-xl text-[10px] font-semibold capitalize"
                        style={{
                          background: currentSlide.paperBg === p ? 'var(--accent)' : 'var(--card)',
                          color: currentSlide.paperBg === p ? 'var(--accent-fg)' : 'var(--text)',
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
                    <button onClick={() => updateCurrentSlide({
                      header: { ...currentSlide.header, enabled: !currentSlide.header.enabled },
                    })}
                      className="w-11 h-6 rounded-full relative transition"
                      style={{ background: currentSlide.header.enabled ? 'var(--accent)' : 'var(--border)' }}>
                      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                        style={{ left: currentSlide.header.enabled ? '22px' : '2px' }} />
                    </button>
                  </div>
                  {currentSlide.header.enabled && (
                    <>
                      <input value={currentSlide.header.handle}
                        onChange={(e) => updateCurrentSlide({
                          header: { ...currentSlide.header, handle: e.target.value },
                        })}
                        placeholder="@yourhandle"
                        className="w-full rounded-xl px-3 py-2 text-xs outline-none"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                      <div className="flex gap-2">
                        <button onClick={() => updateCurrentSlide({
                          header: { ...currentSlide.header, showCounter: !currentSlide.header.showCounter },
                        })}
                          className="flex-1 py-2 rounded-xl text-[10px] font-semibold"
                          style={{
                            background: currentSlide.header.showCounter ? 'var(--accent)' : 'var(--bg)',
                            color: currentSlide.header.showCounter ? 'var(--accent-fg)' : 'var(--text-muted)',
                            border: '1px solid var(--border)',
                          }}>Counter</button>
                        <button onClick={() => updateCurrentSlide({
                          header: { ...currentSlide.header, showProgress: !currentSlide.header.showProgress },
                        })}
                          className="flex-1 py-2 rounded-xl text-[10px] font-semibold"
                          style={{
                            background: currentSlide.header.showProgress ? 'var(--accent)' : 'var(--bg)',
                            color: currentSlide.header.showProgress ? 'var(--accent-fg)' : 'var(--text-muted)',
                            border: '1px solid var(--border)',
                          }}>Progress</button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Progress accent</span>
                        <ColorRow colors={COLORS} value={currentSlide.header.accentColor}
                          onChange={(c) => updateCurrentSlide({
                            header: { ...currentSlide.header, accentColor: c },
                          })} />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Overlay style</Label>
                  <select value={currentSlide.overlayStyle}
                    onChange={(e) => updateCurrentSlide({
                      overlayStyle: e.target.value as PostConfig['overlayStyle'],
                    })}
                    className="w-full rounded-2xl p-3 text-sm outline-none"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                    <option value="none">None</option>
                    <option value="solid">Solid</option>
                    <option value="gradient-bottom">Gradient (bottom)</option>
                    <option value="gradient-top">Gradient (top)</option>
                    <option value="cinematic">🎬 Cinematic (bottom fade)</option>
                    <option value="cinematic-soft">🎬 Cinematic (soft)</option>
                    <option value="double">🎬 Double (wash + fade)</option>
                    <option value="vignette">🎬 Vignette (corners)</option>
                    <option value="bottom-half">🎬 Bottom half (hard)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Overlay darkness · {Math.round(currentSlide.overlayOpacity * 100)}%</Label>
                  <input type="range" min={0} max={100} value={currentSlide.overlayOpacity * 100}
                    onChange={(e) => updateCurrentSlide({ overlayOpacity: Number(e.target.value) / 100 })}
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
              background: 'var(--bg)',
              border: '1px dashed var(--border)',
              color: element.imageUrl ? 'var(--accent)' : 'var(--text-muted)',
            }}>
            {element.imageUrl ? '✓ Image set — tap to change' : 'Pick image'}
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
          <div className="flex gap-1">
            {['"', '❝', '„', '「', '❞'].map((c) => (
              <button key={c} onClick={() => onChange({ char: c } as Partial<CanvasElement>)}
                className="w-7 h-7 rounded-lg text-sm"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>{c}</button>
            ))}
          </div>
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
          <RangeRow label="Letter spacing" min={0} max={4} value={element.letterSpacing}
            display={`${element.letterSpacing.toFixed(1)}px`}
            onChange={(v) => onChange({ letterSpacing: v } as Partial<CanvasElement>)} />
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
          <RangeRow label="Width" min={40} max={100} value={element.width * 100}
            display={`${Math.round(element.width * 100)}%`}
            onChange={(v) => onChange({ width: v / 100 } as Partial<CanvasElement>)} />
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
          <RangeRow label="Width" min={40} max={100} value={element.width * 100}
            display={`${Math.round(element.width * 100)}%`}
            onChange={(v) => onChange({ width: v / 100 } as Partial<CanvasElement>)} />
          <MiniColorRow label="Color" colors={['#4a4a4a', '#111111', '#ffffff', '#666666', '#e07a3f']}
            value={element.color} onChange={(c) => onChange({ color: c } as Partial<CanvasElement>)} />
        </>
      )}

      {element.type === 'card' && (
        <CardControls element={element} onChange={onChange} />
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
            background: 'var(--bg)',
            border: '1px dashed var(--border)',
            color: element.leftImageUrl ? 'var(--accent)' : 'var(--text-muted)',
          }}>
          {element.leftImageUrl ? '✓ Left set' : 'Left image'}
        </button>
        <button onClick={() => onRequestImage('right')}
          className="text-[10px] py-2 px-2 rounded-xl text-center transition"
          style={{
            background: 'var(--bg)',
            border: '1px dashed var(--border)',
            color: element.rightImageUrl ? 'var(--accent)' : 'var(--text-muted)',
          }}>
          {element.rightImageUrl ? '✓ Right set' : 'Right image'}
        </button>
      </div>
      <RangeRow label="Split ratio" min={20} max={80} value={element.splitRatio * 100}
        display={`${Math.round(element.splitRatio * 100)} / ${Math.round(100 - element.splitRatio * 100)}`}
        onChange={(v) => onChange({ splitRatio: v / 100 } as Partial<CanvasElement>)} />
      <RangeRow label="Width" min={40} max={100} value={element.width * 100}
        display={`${Math.round(element.width * 100)}%`}
        onChange={(v) => onChange({ width: v / 100 } as Partial<CanvasElement>)} />
      <RangeRow label="Height" min={20} max={100} value={element.height * 100}
        display={`${Math.round(element.height * 100)}%`}
        onChange={(v) => onChange({ height: v / 100 } as Partial<CanvasElement>)} />
      <div className="flex flex-col gap-1">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Divider</span>
        <div className="grid grid-cols-3 gap-2">
          {(['none', 'line', 'gap'] as const).map((d) => (
            <button key={d} onClick={() => onChange({ divider: d } as Partial<CanvasElement>)}
              className="py-1.5 rounded-lg text-[10px] font-semibold capitalize"
              style={{
                background: element.divider === d ? 'var(--accent)' : 'var(--bg)',
                color: element.divider === d ? 'var(--accent-fg)' : 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}>{d}</button>
          ))}
        </div>
      </div>
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
      <RangeRow label="Width" min={50} max={100} value={element.width * 100}
        display={`${Math.round(element.width * 100)}%`}
        onChange={(v) => onChange({ width: v / 100 } as Partial<CanvasElement>)} />

      <div className="flex flex-col gap-2 mt-1">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Stats (3)
        </span>
        {[0, 1, 2].map((i) => {
          const s = stats[i] ?? { icon: '★', value: '', label: '' };
          return (
            <div key={i} className="flex gap-1">
              <input value={s.icon}
                onChange={(e) => updateStat(i, { icon: e.target.value })}
                placeholder="★"
                className="w-10 rounded-lg px-2 py-1 text-xs text-center outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              <input value={s.value}
                onChange={(e) => updateStat(i, { value: e.target.value })}
                placeholder="10.5k"
                className="flex-1 rounded-lg px-2 py-1 text-xs outline-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              <input value={s.label}
                onChange={(e) => updateStat(i, { label: e.target.value })}
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