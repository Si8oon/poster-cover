// lib/types.ts

export type ElementType =
  | 'circleImage'
  | 'logoPill'
  | 'swipeArrow'
  | 'headingNumber'
  | 'headingText'
  | 'bodyText'
  | 'card';

export type SnapPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'free';

export type CircleImageElement = {
  id: string;
  type: 'circleImage';
  x: number;
  y: number;
  size: number;
  imageUrl: string;
  snap: SnapPosition;
};

export type LogoPillElement = {
  id: string;
  type: 'logoPill';
  x: number;
  y: number;
  text: string;
  bgColor: string;
  textColor: string;
  fontSize: number;
  snap: SnapPosition;
};

export type SwipeArrowElement = {
  id: string;
  type: 'swipeArrow';
  x: number;
  y: number;
  size: number;
  bgColor: string;
  textColor: string;
  snap: SnapPosition;
};

// ---------- NEW element types ----------

export type HeadingNumberElement = {
  id: string;
  type: 'headingNumber';
  x: number;
  y: number;
  number: string;      // "01", "02"
  fontSize: number;    // canvas units (default 90)
  color: string;
  font: string;        // serif by default
  italic: boolean;
  snap: SnapPosition;
};

export type HeadingTextElement = {
  id: string;
  type: 'headingText';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  font: string;
  lineHeight: number;
  bold: boolean;
  width: number;       // 0-1 relative to canvas
  snap: SnapPosition;
};

export type BodyTextElement = {
  id: string;
  type: 'bodyText';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  font: string;
  lineHeight: number;
  width: number;
  snap: SnapPosition;
};

export type CardStat = {
  icon: string;   // emoji or short symbol
  value: string;  // "10.5k"
  label: string;  // "Stars"
};

export type CardElement = {
  id: string;
  type: 'card';
  x: number;
  y: number;
  width: number;       // 0-1 relative
  title: string;       // "bilawalsidhu/gods-eye-view"
  subtitle: string;    // "Photorealistic 3D globe..."
  stats: CardStat[];   // up to 3
  bgColor: string;     // "#ffffff"
  titleColor: string;
  subtitleColor: string;
  accentColor: string; // bottom accent stripe
  shadow: boolean;
  snap: SnapPosition;
};

export type CanvasElement =
  | CircleImageElement
  | LogoPillElement
  | SwipeArrowElement
  | HeadingNumberElement
  | HeadingTextElement
  | BodyTextElement
  | CardElement;

// ---------- Shared ----------

export type OverlayStyle = 'none' | 'solid' | 'gradient-bottom' | 'gradient-top';
export type TextAlign = 'left' | 'center' | 'right';
export type PaperBg = 'none' | 'cream' | 'grid' | 'lined';

export type TextStroke = { color: string; width: number };
export type TextShadow = {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
};

export type HeaderConfig = {
  enabled: boolean;
  handle: string;
  showCounter: boolean;
  showProgress: boolean;
  accentColor: string;
  textColor: string;
};

export type PostConfig = {
  backgroundImage: string | null;
  paperBg: PaperBg;
  header: HeaderConfig;
  headline: string;
  highlightWord: string;
  font: string;
  fontSize: number;
  textColor: string;
  highlightColor: string;
  align: TextAlign;
  uppercase: boolean;
  letterSpacing: number;
  textY: number;
  textStroke: TextStroke;
  textShadow: TextShadow;
  overlayStyle: OverlayStyle;
  overlayOpacity: number;
  elements: CanvasElement[];
};

export const DEFAULT_CONFIG: PostConfig = {
  backgroundImage: null,
  paperBg: 'none',
  header: {
    enabled: false,
    handle: '@yourhandle',
    showCounter: true,
    showProgress: true,
    accentColor: '#e07a3f',
    textColor: '#1a1a1a',
  },
  headline: 'COLLEGE DEGREES CONSIDERED SAFEST FROM AI DISRUPTION',
  highlightWord: 'DEGREES',
  font: 'Impact, "Arial Black", sans-serif',
  fontSize: 36,
  textColor: '#ffffff',
  highlightColor: '#00d97e',
  align: 'left',
  uppercase: true,
  letterSpacing: 0,
  textY: 1,
  textStroke: { color: '#000000', width: 0 },
  textShadow: { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
  overlayStyle: 'solid',
  overlayOpacity: 0.45,
  elements: [],
};

export function createEmptySlide(): PostConfig {
  return {
    ...DEFAULT_CONFIG,
    backgroundImage: null,
    headline: '',
    highlightWord: '',
    elements: [],
  };
}

export type SavedPost = {
  id: string;
  slides: PostConfig[];
  previewDataUrl: string;
  createdAt: number;
};

export type LegacySavedPost = {
  id: string;
  config: PostConfig;
  previewDataUrl: string;
  createdAt: number;
};

export function isLegacyPost(
  post: SavedPost | LegacySavedPost
): post is LegacySavedPost {
  return 'config' in post && !('slides' in post);
}

export function normalizeConfig(config: Partial<PostConfig>): PostConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    paperBg: config.paperBg ?? 'none',
    header: {
      ...DEFAULT_CONFIG.header,
      ...(config.header ?? {}),
    },
    textStroke: {
      ...DEFAULT_CONFIG.textStroke,
      ...(config.textStroke ?? {}),
    },
    textShadow: {
      ...DEFAULT_CONFIG.textShadow,
      ...(config.textShadow ?? {}),
    },
    elements: (config.elements ?? []) as CanvasElement[],
  };
}

export function migrateLegacyPost(post: LegacySavedPost): SavedPost {
  return {
    id: post.id,
    slides: [normalizeConfig(post.config)],
    previewDataUrl: post.previewDataUrl,
    createdAt: post.createdAt,
  };
}