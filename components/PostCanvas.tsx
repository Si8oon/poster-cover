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
} from 'react-konva';
import type Konva from 'konva';
import type {
  CanvasElement,
  PostConfig,
  PaperBg,
  SnapPosition,
  CardElement,
} from '@/lib/types';

export const CANVAS_W = 432;
export const CANVAS_H = 540;

type Props = {
  config: PostConfig;
  onChange: (partial: Partial<PostConfig>) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  onRequestImage: (elementId: string) => void;
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

export default function PostCanvas({
  config,
  onChange,
  stageRef,
  onRequestImage,
  slideIndex = 0,
  slideCount = 1,
}: Props) {
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [bgProps, setBgProps] = useState<{
    x: number; y: number; width: number; height: number;
  } | null>(null);

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
  const showEmptyHint = !config.backgroundImage && config.paperBg === 'none';

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
            x={bgProps.x}
            y={bgProps.y}
            width={bgProps.width}
            height={bgProps.height}
            listening={false}
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
          />
        ))}

        {config.header?.enabled && (
          <AutoHeader
            config={config}
            slideIndex={slideIndex}
            slideCount={slideCount}
          />
        )}
      </Layer>
    </Stage>
  );
}

// ---------------- Paper ----------------
function PaperBackground({ type }: { type: PaperBg }) {
  const baseColor =
    type === 'cream' ? '#faf7f0' :
    type === 'grid' ? '#faf7f0' :
    type === 'lined' ? '#fdfcf8' : '#f3f4f6';

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
  const safeOpacity = typeof opacity === 'number' ? opacity : 0.45;
  if (style === 'solid') {
    return <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H}
      fill={`rgba(0,0,0,${safeOpacity})`} listening={false} />;
  }
  const steps = 20;
  const dir = style === 'gradient-bottom' ? 'bottom' : 'top';
  const rects = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const bandHeight = CANVAS_H / steps;
    const alpha = safeOpacity * Math.pow(t, 2.2);
    const y = dir === 'bottom' ? CANVAS_H - bandHeight * (i + 1) : bandHeight * i;
    rects.push(<Rect key={i} x={0} y={y} width={CANVAS_W}
      height={bandHeight + 1} fill={`rgba(0,0,0,${alpha})`} listening={false} />);
  }
  return <>{rects}</>;
}

// ---------------- Headline ----------------
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

  const safeFont = config.font ?? 'Impact, "Arial Black", sans-serif';
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
  const upperHighlight = (config.highlightWord ?? '').trim();

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
  const cleanHighlight = upperHighlight.replace(/[^A-Z0-9]/gi, '').toUpperCase();

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
      const isHighlighted = cleanHighlight.length > 0 && cleanWord === cleanHighlight;
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

// ---------------- Element Renderer (with new types) ----------------
function ElementRenderer({
  element, onChange, onRequestImage,
}: {
  element: CanvasElement;
  onChange: (patch: Partial<CanvasElement>) => void;
  onRequestImage: () => void;
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

  // --- circleImage ---
  if (element.type === 'circleImage') {
    const size = (element.size ?? 0.22) * CANVAS_W;
    const hasImage = !!element.imageUrl;
    return (
      <Group
        ref={groupRef} x={x} y={y}
        draggable={hasImage}
        onDragEnd={handleDragEnd}
        onClick={() => { if (!hasImage) onRequestImage(); }}
        onTap={() => { if (!hasImage) onRequestImage(); }}
      >
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

  // --- logoPill ---
  if (element.type === 'logoPill') {
    const text = element.text ?? 'BRAND';
    const fSize = element.fontSize ?? 12;
    const paddingX = 14;
    const paddingY = 6;
    const width = text.length * fSize * 0.6 + paddingX * 2;
    const height = fSize + paddingY * 2;
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <Rect x={0} y={0} width={width} height={height}
          cornerRadius={height / 2} fill={element.bgColor ?? '#ef4444'} />
        <Text text={text} x={0} y={paddingY} width={width} align="center"
          fontSize={fSize} fontFamily="Inter, system-ui, sans-serif"
          fontStyle="bold" fill={element.textColor ?? '#ffffff'} />
      </Group>
    );
  }

  // --- swipeArrow ---
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

  // --- headingNumber ---
  if (element.type === 'headingNumber') {
    const fSize = element.fontSize ?? 90;
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <Text
          text={element.number ?? '01'}
          fontSize={fSize}
          fontFamily={element.font ?? 'Georgia, serif'}
          fontStyle={element.italic ? 'italic' : 'normal'}
          fill={element.color ?? '#e07a3f'}
        />
      </Group>
    );
  }

  // --- headingText (multi-line, wraps to width) ---
  if (element.type === 'headingText') {
    const fSize = element.fontSize ?? 34;
    const w = (element.width ?? 0.85) * CANVAS_W;
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <Text
          text={element.text ?? 'Headline here'}
          fontSize={fSize}
          fontFamily={element.font ?? 'Inter, system-ui, sans-serif'}
          fontStyle={element.bold === false ? 'normal' : 'bold'}
          fill={element.color ?? '#1a1a1a'}
          width={w}
          lineHeight={element.lineHeight ?? 1.05}
        />
      </Group>
    );
  }

  // --- bodyText ---
  if (element.type === 'bodyText') {
    const fSize = element.fontSize ?? 14;
    const w = (element.width ?? 0.85) * CANVAS_W;
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <Text
          text={element.text ?? 'Body text goes here.'}
          fontSize={fSize}
          fontFamily={element.font ?? 'Inter, system-ui, sans-serif'}
          fill={element.color ?? '#4a4a4a'}
          width={w}
          lineHeight={element.lineHeight ?? 1.4}
        />
      </Group>
    );
  }

  // --- card ---
  if (element.type === 'card') {
    return (
      <Group ref={groupRef} x={x} y={y} draggable onDragEnd={handleDragEnd}>
        <CardRenderer element={element} />
      </Group>
    );
  }

  return null;
}

// ---------------- Card renderer ----------------
function CardRenderer({ element }: { element: CardElement }) {
  const width = (element.width ?? 0.85) * CANVAS_W;
  const PAD = 16;
  const TITLE_SIZE = 16;
  const SUB_SIZE = 11;
  const STAT_SIZE = 12;
  const STAT_LABEL_SIZE = 9;

  // Rough height calculation
  const titleHeight = TITLE_SIZE * 1.3;
  const subtitleHeight = SUB_SIZE * 1.4 * 2; // allow 2 lines
  const statsHeight = 40;
  const height = PAD + titleHeight + 6 + subtitleHeight + 10 + statsHeight + PAD + 4;

  const bg = element.bgColor ?? '#ffffff';
  const accent = element.accentColor ?? '#fbbf24';

  // Layout: evenly space stats across bottom
  const statsCount = Math.min(3, element.stats?.length ?? 0);
  const statColW = (width - PAD * 2) / Math.max(1, statsCount);

  const shadowEnabled = element.shadow !== false;

  return (
    <>
      {/* Card body */}
      <Rect
        x={0} y={0}
        width={width}
        height={height}
        cornerRadius={14}
        fill={bg}
        shadowColor={shadowEnabled ? '#000' : undefined}
        shadowBlur={shadowEnabled ? 12 : 0}
        shadowOffsetY={shadowEnabled ? 4 : 0}
        shadowOpacity={shadowEnabled ? 0.12 : 0}
      />
      {/* Bottom accent stripe */}
      <Rect
        x={0}
        y={height - 5}
        width={width}
        height={5}
        cornerRadius={[0, 0, 14, 14] as unknown as number}
        fill={accent}
      />

      {/* Title */}
      <Text
        text={element.title ?? 'Title'}
        x={PAD} y={PAD}
        width={width - PAD * 2}
        fontSize={TITLE_SIZE}
        fontFamily="Inter, system-ui, sans-serif"
        fontStyle="bold"
        fill={element.titleColor ?? '#111111'}
      />

      {/* Subtitle */}
      <Text
        text={element.subtitle ?? 'Subtitle goes here.'}
        x={PAD} y={PAD + titleHeight + 4}
        width={width - PAD * 2}
        fontSize={SUB_SIZE}
        fontFamily="Inter, system-ui, sans-serif"
        fill={element.subtitleColor ?? '#666666'}
        lineHeight={1.35}
      />

      {/* Stats row */}
      {(element.stats ?? []).slice(0, 3).map((stat, i) => {
        const sx = PAD + i * statColW;
        const sy = height - PAD - statsHeight + 4;
        return (
          <Group key={i} x={sx} y={sy}>
            <Text
              text={stat.icon ?? '★'}
              x={0} y={0}
              fontSize={STAT_SIZE + 1}
              fontFamily="Inter, system-ui, sans-serif"
              fill={element.titleColor ?? '#111111'}
            />
            <Text
              text={stat.value ?? '—'}
              x={16} y={-2}
              fontSize={STAT_SIZE}
              fontFamily="Inter, system-ui, sans-serif"
              fontStyle="bold"
              fill={element.titleColor ?? '#111111'}
            />
            <Text
              text={stat.label ?? ''}
              x={16} y={STAT_SIZE + 1}
              fontSize={STAT_LABEL_SIZE}
              fontFamily="Inter, system-ui, sans-serif"
              fill={element.subtitleColor ?? '#888888'}
            />
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