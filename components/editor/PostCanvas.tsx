// components/editor/PostCanvas.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Text,
  Group,
  Circle,
  Line,
  Image as KonvaImage,
  Path,
  Wedge,
} from 'react-konva';
import Konva from 'konva';
import type {
  CanvasElement,
  PostConfig,
  PaperBg,
  SnapPosition,
  CardElement,
  SplitImageElement,
  HeadingTextElement,
  BodyTextElement,
  AttributionElement,
  CrownElement,
} from '@/lib/types';
import { konvaFontFamily } from '@/lib/fonts';

export const CANVAS_W = 432;
export const CANVAS_H = 540;

type Props = {
  config: PostConfig;
  onChange: (partial: Partial<PostConfig>) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  onRequestImage: (elementId: string) => void;
  onRequestSplitImage?: (elementId: string, side: 'left' | 'right') => void;
  slideIndex?: number;
  slideCount?: number;
};

const SNAP_MARGIN = 24;
const HEADER_H = 56;

function snapPosition(snap: SnapPosition, w: number, h: number) {
  const m = SNAP_MARGIN;
  switch (snap) {
    case 'top-left': return { x: m / CANVAS_W, y: m / CANVAS_H };
    case 'top-center': return { x: (CANVAS_W - w) / 2 / CANVAS_W, y: m / CANVAS_H };
    case 'top-right': return { x: (CANVAS_W - m - w) / CANVAS_W, y: m / CANVAS_H };
    case 'middle-left': return { x: m / CANVAS_W, y: (CANVAS_H - h) / 2 / CANVAS_H };
    case 'middle-center': return { x: (CANVAS_W - w) / 2 / CANVAS_W, y: (CANVAS_H - h) / 2 / CANVAS_H };
    case 'middle-right': return { x: (CANVAS_W - m - w) / CANVAS_W, y: (CANVAS_H - h) / 2 / CANVAS_H };
    case 'bottom-left': return { x: m / CANVAS_W, y: (CANVAS_H - m - h) / CANVAS_H };
    case 'bottom-center': return { x: (CANVAS_W - w) / 2 / CANVAS_W, y: (CANVAS_H - m - h) / CANVAS_H };
    case 'bottom-right': return { x: (CANVAS_W - m - w) / CANVAS_W, y: (CANVAS_H - m - h) / CANVAS_H };
    default: return null;
  }
}

/** Returns a solid hex color for the paper background */
function getPaperColor(paperBg: PaperBg): string {
  switch (paperBg) {
    case 'cream': return '#faf7f0';
    case 'grid': return '#faf7f0';
    case 'lined': return '#fdfcf8';
    default: return '#ffffff';
  }
}

export default function PostCanvas({
  config,
  onChange,
  stageRef,
  onRequestImage,
  onRequestSplitImage,
  slideIndex = 0,
  slideCount = 1,
}: Props) {
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [bgProps, setBgProps] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts) {
      fonts.ready.then(() => {
        stageRef.current?.batchDraw();
      });
    }
  }, [stageRef]);

  useEffect(() => {
    if (!config.backgroundImage) {
      setBgImage(null);
      setBgProps(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = config.backgroundImage;
    img.onload = () => {
      setBgImage(img);
      const scale = Math.max(CANVAS_W / img.width, CANVAS_H / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      setBgProps({
        x: (CANVAS_W - w) / 2,
        y: (CANVAS_H - h) / 2,
        width: w,
        height: h,
      });
    };
    img.onerror = () => {
      setBgImage(null);
      setBgProps(null);
    };
  }, [config.backgroundImage]);

  const updateElement = (id: string, patch: Partial<CanvasElement>) => {
    const next = config.elements.map((el) =>
      el.id === id ? ({ ...el, ...patch } as CanvasElement) : el
    );
    onChange({ elements: next });
  };

  const headerOffset = config.header?.enabled ? HEADER_H : 0;
  const showEmptyHint =
    !config.backgroundImage && config.paperBg === 'none';
  const paperColor = getPaperColor(config.paperBg);
  const edgeColor = config.edgeColor ?? paperColor;

  return (
    <Stage ref={stageRef} width={CANVAS_W} height={CANVAS_H}>
      <Layer>
        {config.paperBg !== 'none' && <PaperBackground type={config.paperBg} />}

        {!bgImage && config.paperBg === 'none' && (
          <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="#f3f4f6" />
        )}

        {bgImage && bgProps && (
          <KonvaImage
            image={bgImage}
            x={bgProps.x} y={bgProps.y}
            width={bgProps.width} height={bgProps.height}
            listening={false}
            filters={config.blurBackground ? [Konva.Filters.Blur] : undefined}
            blurRadius={config.blurBackground ? 20 : 0}
            // Re-cache when blur changes so filters re-apply
            ref={(node) => {
              if (node && config.blurBackground) {
                node.cache();
              }
            }}
          />
        )}

        {/* Edge effects — draw AFTER image so they overlay it */}
        {bgImage && config.edgeEffect !== 'none' && (
          <EdgeEffect
            type={config.edgeEffect}
            intensity={config.edgeIntensity}
            color={edgeColor}
          />
        )}

        {showEmptyHint && (
          <>
            <Text text="📸" x={0} y={CANVAS_H / 2 - 60} width={CANVAS_W} align="center" fontSize={48} />
            <Text
              text="Add a photo or pick a paper style"
              x={0} y={CANVAS_H / 2 + 4} width={CANVAS_W} align="center"
              fontSize={16} fontFamily="Inter, system-ui, sans-serif"
              fontStyle="bold" fill="#9ca3af"
            />
          </>
        )}

        {bgImage && (
          <Overlay style={config.overlayStyle} opacity={config.overlayOpacity} />
        )}

        {config.headline.trim().length > 0 && (
          <HighlightedHeadline config={config} offsetY={headerOffset} />
        )}

        {config.elements.map((el) => (
          <ElementRenderer
            key={el.id}
            element={el}
            onChange={(patch) => updateElement(el.id, patch)}
            onRequestImage={() => onRequestImage(el.id)}
            onRequestSplitImage={(side) =>
              onRequestSplitImage
                ? onRequestSplitImage(el.id, side)
                : onRequestImage(el.id)
            }
          />
        ))}

        {config.header?.enabled && (
          <AutoHeader config={config} slideIndex={slideIndex} slideCount={slideCount} />
        )}

        {/* Grain texture — drawn on top of everything for authentic film look */}
        {config.grainTexture && <GrainTexture />}
      </Layer>
    </Stage>
  );
}

// ---------------- Paper ----------------
function PaperBackground({ type }: { type: PaperBg }) {
  const baseColor = getPaperColor(type);

  const lines = [];
  if (type === 'grid') {
    const step = 14;
    for (let x = 0; x <= CANVAS_W; x += step)
      lines.push(<Line key={`v${x}`} points={[x, 0, x, CANVAS_H]} stroke="rgba(0,0,0,0.045)" strokeWidth={1} listening={false} />);
    for (let y = 0; y <= CANVAS_H; y += step)
      lines.push(<Line key={`h${y}`} points={[0, y, CANVAS_W, y]} stroke="rgba(0,0,0,0.045)" strokeWidth={1} listening={false} />);
  }
  if (type === 'lined') {
    const step = 26;
    for (let y = step; y < CANVAS_H; y += step)
      lines.push(<Line key={`l${y}`} points={[0, y, CANVAS_W, y]} stroke="rgba(120,120,180,0.15)" strokeWidth={1} listening={false} />);
  }

  return (
    <>
      <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={baseColor} />
      {lines}
    </>
  );
}

// ---------------- Edge Effect ----------------
function EdgeEffect({
  type,
  intensity,
  color,
}: {
  type: PostConfig['edgeEffect'];
  intensity: number;
  color: string;
}) {
  const steps = 30;
  const safeIntensity = Math.max(0, Math.min(1, intensity));

  if (type === 'feather') {
    // Fade all 4 edges toward the background color
    // Edge thickness grows with intensity (10% → 45% of dimension)
    const thickness = 0.10 + safeIntensity * 0.35;
    const bands = Math.max(3, Math.floor(steps / 3));

    const rects: React.ReactNode[] = [];

    // Top edge
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const y = t * (CANVAS_H * thickness);
      const alpha = (1 - t) * safeIntensity;
      const bandH = (CANVAS_H * thickness) / bands + 1;
      rects.push(
        <Rect
          key={`top-${i}`}
          x={0} y={y}
          width={CANVAS_W} height={bandH}
          fill={color}
          opacity={alpha}
          listening={false}
        />
      );
    }
    // Bottom edge
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const y = CANVAS_H - (t * (CANVAS_H * thickness)) - (CANVAS_H * thickness) / bands;
      const alpha = (1 - t) * safeIntensity;
      const bandH = (CANVAS_H * thickness) / bands + 1;
      rects.push(
        <Rect
          key={`bottom-${i}`}
          x={0} y={y}
          width={CANVAS_W} height={bandH}
          fill={color}
          opacity={alpha}
          listening={false}
        />
      );
    }
    // Left edge
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const x = t * (CANVAS_W * thickness);
      const alpha = (1 - t) * safeIntensity;
      const bandW = (CANVAS_W * thickness) / bands + 1;
      rects.push(
        <Rect
          key={`left-${i}`}
          x={x} y={0}
          width={bandW} height={CANVAS_H}
          fill={color}
          opacity={alpha}
          listening={false}
        />
      );
    }
    // Right edge
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const x = CANVAS_W - (t * (CANVAS_W * thickness)) - (CANVAS_W * thickness) / bands;
      const alpha = (1 - t) * safeIntensity;
      const bandW = (CANVAS_W * thickness) / bands + 1;
      rects.push(
        <Rect
          key={`right-${i}`}
          x={x} y={0}
          width={bandW} height={CANVAS_H}
          fill={color}
          opacity={alpha}
          listening={false}
        />
      );
    }
    return <>{rects}</>;
  }

  if (type === 'radial') {
    // Simulate radial fade with concentric wedge-shaped rings
    // Konva doesn't have a native radial gradient on canvas, so we use
    // a big circle with increasing opacity toward the edges.
    const outerRadius = Math.max(CANVAS_W, CANVAS_H) * 0.85;
    const centerX = CANVAS_W / 2;
    const centerY = CANVAS_H / 2;
    const rings = 24;

    const ringNodes: React.ReactNode[] = [];
    for (let i = 0; i < rings; i++) {
      const t = i / (rings - 1);
      // Innermost rings have 0 opacity, outermost have full
      const innerRadius = t * outerRadius;
      const alpha = Math.pow(t, 2) * safeIntensity;

      ringNodes.push(
        <Circle
          key={`ring-${i}`}
          x={centerX}
          y={centerY}
          radius={innerRadius}
          stroke={color}
          strokeWidth={outerRadius / rings + 1}
          opacity={alpha}
          listening={false}
        />
      );
    }
    return <>{ringNodes}</>;
  }

  if (type === 'fade-to-color') {
    // Bottom-to-top gradient fading to the color
    const bands = 30;
    const fadeHeight = CANVAS_H * (0.3 + safeIntensity * 0.5);
    const rects: React.ReactNode[] = [];

    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1);
      const y = CANVAS_H - fadeHeight * (i / bands);
      const alpha = Math.pow(t, 1.5) * safeIntensity;
      const bandH = fadeHeight / bands + 1;
      rects.push(
        <Rect
          key={`fade-${i}`}
          x={0} y={y}
          width={CANVAS_W} height={bandH}
          fill={color}
          opacity={alpha}
          listening={false}
        />
      );
    }
    return <>{rects}</>;
  }

  return null;
}

// ---------------- Grain Texture ----------------
function GrainTexture() {
  // Pre-generate a noise pattern SVG once
  const patternRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const c = document.createElement('canvas');
    c.width = 200;
    c.height = 200;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(200, 200);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      imageData.data[i] = v;
      imageData.data[i + 1] = v;
      imageData.data[i + 2] = v;
      imageData.data[i + 3] = 40; // low alpha per pixel
    }
    ctx.putImageData(imageData, 0, 0);
    patternRef.current = c;
    setDataUrl(c.toDataURL());
  }, []);

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!dataUrl) return;
    const i = new window.Image();
    i.src = dataUrl;
    i.onload = () => setImg(i);
  }, [dataUrl]);

  if (!img) return null;

  // Tile the noise pattern by repeating small images
  const tiles: React.ReactNode[] = [];
  const tileSize = 100;
  const cols = Math.ceil(CANVAS_W / tileSize);
  const rows = Math.ceil(CANVAS_H / tileSize);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      tiles.push(
        <KonvaImage
          key={`grain-${x}-${y}`}
          image={img}
          x={x * tileSize}
          y={y * tileSize}
          width={tileSize}
          height={tileSize}
          listening={false}
          opacity={0.5}
        />
      );
    }
  }

  return <>{tiles}</>;
}

// ---------------- Auto header ----------------
function AutoHeader({
  config, slideIndex, slideCount,
}: {
  config: PostConfig;
  slideIndex: number;
  slideCount: number;
}) {
  const h = config.header;
  if (!h?.enabled) return null;
  const PAD = 20;
  const counter = h.showCounter
    ? `${String(slideIndex + 1).padStart(2, '0')} / ${String(slideCount).padStart(2, '0')}`
    : '';

  return (
    <>
      <Text text={h.handle} x={PAD} y={PAD} fontSize={12}
        fontFamily="Inter, system-ui, sans-serif" fontStyle="bold"
        fill={h.textColor} listening={false} />
      {counter && (
        <Text text={counter} x={0} y={PAD} width={CANVAS_W - PAD} align="right"
          fontSize={12} fontFamily="Inter, system-ui, sans-serif"
          fontStyle="bold" fill={h.textColor} opacity={0.85} listening={false} />
      )}
      {h.showProgress && (
        <>
          <Rect x={PAD} y={PAD + 24} width={CANVAS_W - PAD * 2} height={3}
            cornerRadius={1.5} fill="rgba(0,0,0,0.08)" listening={false} />
          <Rect x={PAD} y={PAD + 24}
            width={((slideIndex + 1) / slideCount) * (CANVAS_W - PAD * 2)}
            height={3} cornerRadius={1.5} fill={h.accentColor} listening={false} />
        </>
      )}
    </>
  );
}

// ---------------- Overlay ----------------
function Overlay({
  style, opacity,
}: {
  style: PostConfig['overlayStyle'];
  opacity: number;
}) {
  if (style === 'none') return null;
  const o = typeof opacity === 'number' ? opacity : 0.45;
  const steps = 22;

  const buildGradient = (points: { y: number; alpha: number }[]) => {
    const rects: React.ReactNode[] = [];
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const y = t * CANVAS_H;
      let alpha = 0;
      for (let p = 0; p < points.length - 1; p++) {
        const a = points[p];
        const b = points[p + 1];
        if (y >= a.y && y <= b.y) {
          const local = (y - a.y) / (b.y - a.y);
          alpha = a.alpha + (b.alpha - a.alpha) * local;
          break;
        }
      }
      const bandH = CANVAS_H / steps;
      rects.push(
        <Rect key={i} x={0} y={y} width={CANVAS_W} height={bandH + 1}
          fill={`rgba(0,0,0,${alpha * o})`} listening={false} />
      );
    }
    return rects;
  };

  if (style === 'solid') {
    return <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H}
      fill={`rgba(0,0,0,${o})`} listening={false} />;
  }
  if (style === 'gradient-bottom') {
    return <>{buildGradient([
      { y: 0, alpha: 0 }, { y: CANVAS_H * 0.5, alpha: 0 }, { y: CANVAS_H, alpha: 1 },
    ])}</>;
  }
  if (style === 'gradient-top') {
    return <>{buildGradient([
      { y: 0, alpha: 1 }, { y: CANVAS_H * 0.5, alpha: 0 }, { y: CANVAS_H, alpha: 0 },
    ])}</>;
  }
  if (style === 'cinematic') {
    return <>{buildGradient([
      { y: 0, alpha: 0 }, { y: CANVAS_H * 0.4, alpha: 0 },
      { y: CANVAS_H * 0.55, alpha: 0.15 }, { y: CANVAS_H * 0.7, alpha: 0.5 },
      { y: CANVAS_H * 0.85, alpha: 0.8 }, { y: CANVAS_H, alpha: 0.95 },
    ])}</>;
  }
  if (style === 'cinematic-soft') {
    return <>{buildGradient([
      { y: 0, alpha: 0 }, { y: CANVAS_H * 0.5, alpha: 0 },
      { y: CANVAS_H * 0.7, alpha: 0.1 }, { y: CANVAS_H * 0.9, alpha: 0.5 },
      { y: CANVAS_H, alpha: 0.7 },
    ])}</>;
  }
  if (style === 'double') {
    return (
      <>
        <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H}
          fill={`rgba(0,0,0,${0.18 * o})`} listening={false} />
        {buildGradient([
          { y: 0, alpha: 0 }, { y: CANVAS_H * 0.4, alpha: 0 },
          { y: CANVAS_H * 0.55, alpha: 0.2 }, { y: CANVAS_H * 0.75, alpha: 0.55 },
          { y: CANVAS_H, alpha: 1 },
        ])}
      </>
    );
  }
  if (style === 'vignette') {
    return (
      <>
        {buildGradient([
          { y: 0, alpha: 0.55 }, { y: CANVAS_H * 0.35, alpha: 0 },
          { y: CANVAS_H * 0.65, alpha: 0 }, { y: CANVAS_H, alpha: 0.55 },
        ])}
        <Rect x={0} y={0} width={CANVAS_W * 0.25} height={CANVAS_H}
          fill={`rgba(0,0,0,${0.35 * o})`} listening={false} opacity={0.6} />
        <Rect x={CANVAS_W * 0.75} y={0} width={CANVAS_W * 0.25} height={CANVAS_H}
          fill={`rgba(0,0,0,${0.35 * o})`} listening={false} opacity={0.6} />
      </>
    );
  }
  if (style === 'bottom-half') {
    return (
      <Rect x={0} y={CANVAS_H * 0.5} width={CANVAS_W} height={CANVAS_H * 0.5}
        fill={`rgba(0,0,0,${0.65 * o})`} listening={false} />
    );
  }
  return null;
}

// ---------------- Headline (multi-highlight) ----------------
function HighlightedHeadline({
  config, offsetY = 0,
}: {
  config: PostConfig;
  offsetY?: number;
}) {
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  useEffect(() => {
    const c = document.createElement('canvas');
    setCtx(c.getContext('2d'));
  }, []);
  if (!ctx) return null;

  const safeFont = konvaFontFamily(config.font ?? 'Impact, "Arial Black", sans-serif');
  const safeFontSize = config.fontSize || 36;
  const safeTextColor = config.textColor ?? '#ffffff';
  const safeHighlightColor = config.highlightColor ?? '#00d97e';
  const safeAlign = config.align ?? 'left';
  const uppercase = config.uppercase ?? true;
  const letterSpacing = config.letterSpacing ?? 0;
  const textY = typeof config.textY === 'number' ? config.textY : 1;

  const stroke = config.textStroke ?? { color: '#000', width: 0 };
  const shadow = config.textShadow ?? { color: '#000', blur: 0, offsetX: 0, offsetY: 0 };

  const upperText = uppercase
    ? (config.headline ?? '').toUpperCase()
    : (config.headline ?? '');

  const highlightWords: string[] = [];
  if (Array.isArray(config.highlightWords)) {
    for (const w of config.highlightWords) {
      const clean = (w ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/gi, '');
      if (clean) highlightWords.push(clean);
    }
  } else if (config.highlightWord) {
    const clean = config.highlightWord.trim().toUpperCase().replace(/[^A-Z0-9]/gi, '');
    if (clean) highlightWords.push(clean);
  }

  const LINE_HEIGHT = safeFontSize * 1.12;
  const PADDING_X = 24;
  const MAX_WIDTH = CANVAS_W - PADDING_X * 2;

  ctx.font = `bold ${safeFontSize}px ${safeFont}`;

  const measureWord = (word: string) =>
    ctx.measureText(word).width + Math.max(0, word.length - 1) * letterSpacing;
  const measureWordWithSpace = (word: string) => measureWord(word) + measureWord(' ');

  const words = upperText.split(' ');
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let currentWidth = 0;
  for (const word of words) {
    const w = measureWordWithSpace(word);
    if (currentWidth + w > MAX_WIDTH && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [word];
      currentWidth = w;
    } else {
      currentLine.push(word);
      currentWidth += w;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);

  const totalTextHeight = lines.length * LINE_HEIGHT;
  const topPadding = 40 + offsetY;
  const bottomPadding = 40;
  const availableHeight = CANVAS_H - topPadding - bottomPadding;
  const startY = topPadding + (availableHeight - totalTextHeight) * textY;

  const elements: React.ReactNode[] = [];
  let y = startY;

  lines.forEach((lineWords, lineIdx) => {
    const lineWidth = lineWords.reduce(
      (acc, w, i) => acc + measureWord(w) + (i < lineWords.length - 1 ? measureWord(' ') : 0),
      0
    );
    const availableWidth = CANVAS_W - PADDING_X * 2;
    let x = PADDING_X;
    if (safeAlign === 'center') x = PADDING_X + (availableWidth - lineWidth) / 2;
    else if (safeAlign === 'right') x = PADDING_X + (availableWidth - lineWidth);

    lineWords.forEach((word, wordIdx) => {
      const cleanWord = word.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const isHighlighted =
        highlightWords.length > 0 && highlightWords.includes(cleanWord);
      const fill = isHighlighted ? safeHighlightColor : safeTextColor;

      const chars = Array.from(word);
      chars.forEach((char, charIdx) => {
        elements.push(
          <Text
            key={`${lineIdx}-${wordIdx}-${charIdx}`}
            text={char} x={x} y={y}
            fontSize={safeFontSize}
            fontFamily={safeFont}
            fontStyle="bold"
            fill={fill}
            stroke={stroke.width > 0 ? stroke.color : undefined}
            strokeWidth={stroke.width > 0 ? stroke.width : undefined}
            fillAfterStrokeEnabled
            shadowColor={shadow.blur > 0 ? shadow.color : undefined}
            shadowBlur={shadow.blur > 0 ? shadow.blur : undefined}
            shadowOffsetX={shadow.blur > 0 ? shadow.offsetX : undefined}
            shadowOffsetY={shadow.blur > 0 ? shadow.offsetY : undefined}
            shadowOpacity={shadow.blur > 0 ? 0.9 : 0}
            listening={false}
          />
        );
        x += measureWord(char) + letterSpacing;
      });
      if (wordIdx < lineWords.length - 1) {
        x += measureWord(' ') + letterSpacing;
      }
    });
    y += LINE_HEIGHT;
  });

  return <>{elements}</>;
}

// ---------------- Element Renderer ----------------
function ElementRenderer({
  element, onChange, onRequestImage, onRequestSplitImage,
}: {
  element: CanvasElement;
  onChange: (patch: Partial<CanvasElement>) => void;
  onRequestImage: () => void;
  onRequestSplitImage: (side: 'left' | 'right') => void;
}) {
  const groupRef = useRef<Konva.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    const node = groupRef.current;
    const w = node.width() || 60;
    const h = node.height() || 30;
    const snap = snapPosition(element.snap, w, h);
    if (snap) {
      node.position({ x: snap.x * CANVAS_W, y: snap.y * CANVAS_H });
    } else {
      node.position({
        x: (element.x ?? 0) * CANVAS_W,
        y: (element.y ?? 0) * CANVAS_H,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.snap]);

  const handleDragEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    onChange({
      x: node.x() / CANVAS_W,
      y: node.y() / CANVAS_H,
      snap: 'free',
    } as Partial<CanvasElement>);
  };

  const x = (element.x ?? 0) * CANVAS_W;
  const y = (element.y ?? 0) * CANVAS_H;

  if (element.type === 'circleImage') {
    const size = (element.size ?? 0.22) * CANVAS_W;
    const hasImage = !!element.imageUrl;
    return (
      <Group ref={groupRef} x={x} y={y}
        draggable={hasImage} onDragEnd={handleDragEnd}
        onClick={() => { if (!hasImage) onRequestImage(); }}
        onTap={() => { if (!hasImage) onRequestImage(); }}>
        {hasImage ? (
          <CircleImage imageUrl={element.imageUrl} size={size} ringColor="#ffffff" />
        ) : (
          <>
            <Circle x={size / 2} y={size / 2} radius={size / 2}
              fill="rgba(255,255,255,0.15)" stroke="#ffffff" strokeWidth={2} dash={[8, 6]} />
            <Line points={[size * 0.35, size / 2, size * 0.65, size / 2]} stroke="#ffffff" strokeWidth={2} lineCap="round" />
            <Line points={[size / 2, size * 0.35, size / 2, size * 0.65]} stroke="#ffffff" strokeWidth={2} lineCap="round" />
          </>
        )}
      </Group>
    );
  }

  if (element.type === 'splitImage') {
    return (
      <Group ref={groupRef} x={x} y={y}>
        <SplitImage element={element} onRequestSide={onRequestSplitImage} />
      </Group>
    );
  }

  if (element.type === 'logoPill') {
    const text = element.text ?? 'BRAND';
    const fSize = element.fontSize ?? 12;
    const width = text.length * fSize * 0.6 + 28;
    const height = fSize + 12;
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <Rect x={0} y={0} width={width} height={height} cornerRadius={height / 2}
          fill={element.bgColor ?? '#ef4444'} />
        <Text key={`pill-${text}-${fSize}`}
          text={text} x={0} y={6} width={width} align="center"
          fontSize={fSize} fontFamily="Inter, system-ui, sans-serif"
          fontStyle="bold" fill={element.textColor ?? '#ffffff'} />
      </Group>
    );
  }

  if (element.type === 'swipeArrow') {
    const size = (element.size ?? 0.08) * CANVAS_W;
    const r = size / 2;
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <Circle x={r} y={r} radius={r} fill="rgba(255,255,255,0.9)" />
        <Line points={[r * 0.45, r * 0.5, r * 0.7, r, r * 0.45, r * 1.5]}
          stroke="#000" strokeWidth={2} lineCap="round" lineJoin="round" />
      </Group>
    );
  }

  if (element.type === 'headingNumber') {
    const num = element.number ?? '01';
    const family = konvaFontFamily(element.font ?? 'Georgia, serif');
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <Text
          key={`num-${num}-${element.fontSize}-${element.italic}-${family}`}
          text={num} fontSize={element.fontSize ?? 90}
          fontFamily={family}
          fontStyle={element.italic ? 'italic' : 'normal'}
          fill={element.color ?? '#e07a3f'} />
      </Group>
    );
  }

  if (element.type === 'headingText') {
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <HeadingText element={element} />
      </Group>
    );
  }

  if (element.type === 'bodyText') {
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <BodyText element={element} />
      </Group>
    );
  }

  if (element.type === 'attribution') {
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <Attribution element={element} />
      </Group>
    );
  }

  if (element.type === 'quoteMark') {
    const c = element.char ?? '"';
    const family = konvaFontFamily(element.font ?? 'Georgia, serif');
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <Text key={`qm-${c}-${element.fontSize}-${family}`}
          text={c} fontSize={element.fontSize ?? 90}
          fontFamily={family}
          fontStyle="bold"
          fill={element.color ?? '#ffffff'} />
      </Group>
    );
  }

  if (element.type === 'card') {
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <CardRenderer element={element} />
      </Group>
    );
  }

  if (element.type === 'crossout') {
    const width = (element.width ?? 0.5) * CANVAS_W;
    const thickness = element.height ?? 4;
    return (
      <Group
        ref={groupRef}
        x={x} y={y}
        draggable
        onDragEnd={handleDragEnd}
        rotation={element.rotation ?? 0}
      >
        <Rect
          x={0} y={0}
          width={width} height={thickness}
          fill={element.color ?? '#dc2626'}
          cornerRadius={thickness / 2}
        />
      </Group>
    );
  }

  if (element.type === 'crown') {
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <Crown element={element} />
      </Group>
    );
  }

  if (element.type === 'tag') {
    const family = konvaFontFamily(element.font ?? 'var(--font-permanent-marker), cursive');
    return (
      <Group
        ref={groupRef}
        x={x} y={y}
        draggable
        onDragEnd={handleDragEnd}
        rotation={element.rotation ?? 0}
      >
        <Text
          key={`tag-${element.text}-${element.fontSize}-${family}`}
          text={element.text ?? 'tag'}
          fontSize={element.fontSize ?? 14}
          fontFamily={family}
          fill={element.color ?? '#111111'}
        />
      </Group>
    );
  }

  return null;
}

// ---------------- SplitImage ----------------
function SplitImage({
  element, onRequestSide,
}: {
  element: SplitImageElement;
  onRequestSide: (side: 'left' | 'right') => void;
}) {
  const width = (element.width ?? 1) * CANVAS_W;
  const height = (element.height ?? 0.5) * CANVAS_H;
  const ratio = element.splitRatio ?? 0.5;
  const leftW = width * ratio;
  const rightW = width - leftW;
  const leftMissing = !element.leftImageUrl;
  const rightMissing = !element.rightImageUrl;

  return (
    <>
      {element.leftImageUrl ? (
        <ImageWithCover imageUrl={element.leftImageUrl} x={0} y={0} width={leftW} height={height} />
      ) : (
        <Rect x={0} y={0} width={leftW} height={height} fill="#1a1a1a" />
      )}
      {element.rightImageUrl ? (
        <ImageWithCover imageUrl={element.rightImageUrl} x={leftW} y={0} width={rightW} height={height} />
      ) : (
        <Rect x={leftW} y={0} width={rightW} height={height} fill="#1a1a1a" />
      )}
      {element.divider === 'line' && (
        <Line points={[leftW, 0, leftW, height]}
          stroke={element.dividerColor ?? '#ffffff'} strokeWidth={2} />
      )}
      {element.divider === 'gap' && (
        <Rect x={leftW - 2} y={0} width={4} height={height} fill="rgba(0,0,0,0.6)" />
      )}
      {leftMissing && (
        <>
          <Text text="📸" x={0} y={height / 2 - 24} width={leftW} align="center" fontSize={22} opacity={0.7} />
          <Text text="Tap to add photo" x={0} y={height / 2 + 6} width={leftW} align="center"
            fontSize={11} fontFamily="Inter, system-ui, sans-serif"
            fill="#ffffff" opacity={0.9} />
        </>
      )}
      {rightMissing && (
        <>
          <Text text="📸" x={leftW} y={height / 2 - 24} width={rightW} align="center" fontSize={22} opacity={0.7} />
          <Text text="Tap to add photo" x={leftW} y={height / 2 + 6} width={rightW} align="center"
            fontSize={11} fontFamily="Inter, system-ui, sans-serif"
            fill="#ffffff" opacity={0.9} />
        </>
      )}
      <Rect x={0} y={0} width={leftW} height={height}
        fill="#000000" opacity={0.001}
        onClick={() => onRequestSide('left')}
        onTap={() => onRequestSide('left')} />
      <Rect x={leftW} y={0} width={rightW} height={height}
        fill="#000000" opacity={0.001}
        onClick={() => onRequestSide('right')}
        onTap={() => onRequestSide('right')} />
    </>
  );
}

// ---------------- Crown ----------------
function Crown({ element }: { element: CrownElement }) {
  const size = (element.size ?? 0.25) * CANVAS_W;
  const fill = element.color ?? '#fbbf24';
  const strokeColor = element.strokeColor ?? '#000000';
  const strokeWidth = element.strokeWidth ?? 3;
  const pathData = 'M 5 55 L 5 25 L 25 38 L 50 10 L 75 38 L 95 25 L 95 55 Z';

  if (element.style === 'outline') {
    return (
      <Path
        data={pathData}
        x={0} y={0}
        scaleX={size / 100}
        scaleY={size / 100}
        stroke={strokeColor}
        strokeWidth={strokeWidth / (size / 100)}
        fillEnabled={false}
      />
    );
  }

  return (
    <Path
      data={pathData}
      x={0} y={0}
      scaleX={size / 100}
      scaleY={size / 100}
      fill={fill}
      stroke={strokeColor}
      strokeWidth={strokeWidth / (size / 100)}
      lineJoin="round"
    />
  );
}

// ---------------- ImageWithCover ----------------
function ImageWithCover({
  imageUrl, x, y, width, height,
}: {
  imageUrl: string;
  x: number; y: number;
  width: number; height: number;
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const i = new window.Image();
    i.crossOrigin = 'anonymous';
    i.src = imageUrl;
    i.onload = () => setImg(i);
  }, [imageUrl]);

  if (!img) return <Rect x={x} y={y} width={width} height={height} fill="#1a1a1a" />;

  const imgRatio = img.width / img.height;
  const boxRatio = width / height;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = (img.height - sh) / 2;
  }

  return (
    <KonvaImage image={img} crop={{ x: sx, y: sy, width: sw, height: sh }}
      x={x} y={y} width={width} height={height} />
  );
}

// ---------------- HeadingText ----------------
function HeadingText({ element }: { element: HeadingTextElement }) {
  const w = (element.width ?? 0.85) * CANVAS_W;
  const text = element.text ?? 'Headline here';
  const family = konvaFontFamily(element.font ?? 'Inter, system-ui, sans-serif');
  return (
    <Text
      key={`ht-${text}-${element.fontSize}-${element.color}-${element.bold}-${element.shadow}-${element.align}-${family}`}
      text={text}
      fontSize={element.fontSize ?? 34}
      fontFamily={family}
      fontStyle={element.bold === false ? 'normal' : 'bold'}
      fill={element.color ?? '#1a1a1a'}
      width={w}
      lineHeight={element.lineHeight ?? 1.05}
      align={element.align ?? 'left'}
      shadowColor={element.shadow ? '#000000' : undefined}
      shadowBlur={element.shadow ? 8 : 0}
      shadowOffsetY={element.shadow ? 2 : 0}
      shadowOpacity={element.shadow ? 0.6 : 0}
    />
  );
}

// ---------------- BodyText ----------------
function BodyText({ element }: { element: BodyTextElement }) {
  const w = (element.width ?? 0.85) * CANVAS_W;
  const text = element.text ?? 'Body text goes here.';
  const family = konvaFontFamily(element.font ?? 'Inter, system-ui, sans-serif');
  return (
    <Text
      key={`bt-${text}-${element.fontSize}-${element.color}-${element.align}-${family}`}
      text={text}
      fontSize={element.fontSize ?? 14}
      fontFamily={family}
      fill={element.color ?? '#4a4a4a'}
      width={w}
      lineHeight={element.lineHeight ?? 1.4}
      align={element.align ?? 'left'}
    />
  );
}

// ---------------- Attribution ----------------
function Attribution({ element }: { element: AttributionElement }) {
  const raw = element.text ?? '';
  const text = (element.uppercase ?? false) ? raw.toUpperCase() : raw;
  const w = (element.width ?? 0.85) * CANVAS_W;
  const family = konvaFontFamily(element.font ?? 'Inter, system-ui, sans-serif');
  return (
    <Text
      key={`at-${text}-${element.fontSize}-${element.color}-${element.align}-${element.bold}-${family}`}
      text={text}
      fontSize={element.fontSize ?? 12}
      fontFamily={family}
      fontStyle={element.bold === false ? 'normal' : 'bold'}
      fill={element.color ?? '#ffffff'}
      width={w}
      align={element.align ?? 'left'}
      letterSpacing={element.letterSpacing ?? 1}
      opacity={0.9}
    />
  );
}

// ---------------- Card ----------------
function CardRenderer({ element }: { element: CardElement }) {
  const width = (element.width ?? 0.85) * CANVAS_W;
  const PAD = 16;
  const TITLE_SIZE = 16;
  const SUB_SIZE = 11;
  const STAT_SIZE = 12;
  const STAT_LABEL_SIZE = 9;

  const titleHeight = TITLE_SIZE * 1.3;
  const subtitleHeight = SUB_SIZE * 1.4 * 2;
  const statsHeight = 40;
  const height = PAD + titleHeight + 6 + subtitleHeight + 10 + statsHeight + PAD + 4;

  const bg = element.bgColor ?? '#ffffff';
  const accent = element.accentColor ?? '#fbbf24';

  const statsCount = Math.min(3, element.stats?.length ?? 0);
  const statColW = (width - PAD * 2) / Math.max(1, statsCount);
  const shadowEnabled = element.shadow !== false;

  return (
    <>
      <Rect x={0} y={0} width={width} height={height}
        cornerRadius={14} fill={bg}
        shadowColor={shadowEnabled ? '#000' : undefined}
        shadowBlur={shadowEnabled ? 12 : 0}
        shadowOffsetY={shadowEnabled ? 4 : 0}
        shadowOpacity={shadowEnabled ? 0.12 : 0} />
      <Rect x={0} y={height - 5} width={width} height={5}
        cornerRadius={[0, 0, 14, 14] as unknown as number} fill={accent} />
      <Text key={`card-title-${element.title}`}
        text={element.title ?? 'Title'} x={PAD} y={PAD}
        width={width - PAD * 2} fontSize={TITLE_SIZE}
        fontFamily="Inter, system-ui, sans-serif" fontStyle="bold"
        fill={element.titleColor ?? '#111111'} />
      <Text key={`card-sub-${element.subtitle}`}
        text={element.subtitle ?? 'Subtitle goes here.'}
        x={PAD} y={PAD + titleHeight + 4} width={width - PAD * 2}
        fontSize={SUB_SIZE} fontFamily="Inter, system-ui, sans-serif"
        fill={element.subtitleColor ?? '#666666'} lineHeight={1.35} />
      {(element.stats ?? []).slice(0, 3).map((stat, i) => {
        const sx = PAD + i * statColW;
        const sy = height - PAD - statsHeight + 4;
        return (
          <Group key={i} x={sx} y={sy}>
            <Text key={`stat-icon-${i}-${stat.icon}`}
              text={stat.icon ?? '★'} x={0} y={0} fontSize={STAT_SIZE + 1}
              fontFamily="Inter, system-ui, sans-serif"
              fill={element.titleColor ?? '#111111'} />
            <Text key={`stat-val-${i}-${stat.value}`}
              text={stat.value ?? '—'} x={16} y={-2}
              fontSize={STAT_SIZE} fontFamily="Inter, system-ui, sans-serif"
              fontStyle="bold" fill={element.titleColor ?? '#111111'} />
            <Text key={`stat-lbl-${i}-${stat.label}`}
              text={stat.label ?? ''} x={16} y={STAT_SIZE + 1}
              fontSize={STAT_LABEL_SIZE}
              fontFamily="Inter, system-ui, sans-serif"
              fill={element.subtitleColor ?? '#888888'} />
          </Group>
        );
      })}
    </>
  );
}

// ---------------- Circle image ----------------
function CircleImage({
  imageUrl, size, ringColor,
}: {
  imageUrl: string;
  size: number;
  ringColor: string;
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const i = new window.Image();
    i.crossOrigin = 'anonymous';
    i.src = imageUrl;
    i.onload = () => setImg(i);
  }, [imageUrl]);

  if (!img) return <Circle x={size / 2} y={size / 2} radius={size / 2} fill="#333" />;

  const minSide = Math.min(img.width, img.height);
  const sx = (img.width - minSide) / 2;
  const sy = (img.height - minSide) / 2;

  return (
    <Group clipFunc={(ctx) => {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, false);
      ctx.closePath();
    }}>
      <KonvaImage image={img} crop={{ x: sx, y: sy, width: minSide, height: minSide }}
        x={0} y={0} width={size} height={size} />
      <Circle x={size / 2} y={size / 2} radius={size / 2 - 1}
        stroke={ringColor} strokeWidth={3} />
    </Group>
  );
}