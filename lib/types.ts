// lib/types.ts

export type ElementType =
  | 'circleImage'
  | 'logoPill'
  | 'swipeArrow'
  | 'headingNumber'
  | 'headingText'
  | 'bodyText'
  | 'card'
  | 'splitImage'
  | 'quoteMark'
  | 'attribution'
  | 'crossout'
  | 'crown'
  | 'tag';

export type SnapPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'free';

export type CircleImageElement = {
  id: string;
  type: 'circleImage';
  x: number; y: number;
  size: number;
  imageUrl: string;
  snap: SnapPosition;
};

export type LogoPillElement = {
  id: string;
  type: 'logoPill';
  x: number; y: number;
  text: string;
  bgColor: string;
  textColor: string;
  fontSize: number;
  snap: SnapPosition;
};

export type SwipeArrowElement = {
  id: string;
  type: 'swipeArrow';
  x: number; y: number;
  size: number;
  bgColor: string;
  textColor: string;
  snap: SnapPosition;
};

export type HeadingNumberElement = {
  id: string;
  type: 'headingNumber';
  x: number; y: number;
  number: string;
  fontSize: number;
  color: string;
  font: string;
  italic: boolean;
  snap: SnapPosition;
};

export type HeadingTextElement = {
  id: string;
  type: 'headingText';
  x: number; y: number;
  text: string;
  fontSize: number;
  color: string;
  font: string;
  lineHeight: number;
  bold: boolean;
  width: number;
  align?: 'left' | 'center' | 'right';
  shadow?: boolean;
  snap: SnapPosition;
};

export type BodyTextElement = {
  id: string;
  type: 'bodyText';
  x: number; y: number;
  text: string;
  fontSize: number;
  color: string;
  font: string;
  lineHeight: number;
  width: number;
  align?: 'left' | 'center' | 'right';
  snap: SnapPosition;
};

export type CardStat = { icon: string; value: string; label: string };

export type CardElement = {
  id: string;
  type: 'card';
  x: number; y: number;
  width: number;
  title: string;
  subtitle: string;
  stats: CardStat[];
  bgColor: string;
  titleColor: string;
  subtitleColor: string;
  accentColor: string;
  shadow: boolean;
  snap: SnapPosition;
};

export type SplitImageElement = {
  id: string;
  type: 'splitImage';
  x: number; y: number;
  width: number;
  height: number;
  leftImageUrl: string;
  rightImageUrl: string;
  splitRatio: number;
  divider: 'none' | 'line' | 'gap';
  dividerColor: string;
  snap: SnapPosition;
};

export type QuoteMarkElement = {
  id: string;
  type: 'quoteMark';
  x: number; y: number;
  char: string;
  fontSize: number;
  color: string;
  font: string;
  snap: SnapPosition;
};

export type AttributionElement = {
  id: string;
  type: 'attribution';
  x: number; y: number;
  text: string;
  fontSize: number;
  color: string;
  font: string;
  letterSpacing: number;
  uppercase?: boolean;
  bold?: boolean;
  width: number;
  align?: 'left' | 'center' | 'right';
  snap: SnapPosition;
};

export type CrossoutElement = {
  id: string;
  type: 'crossout';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  snap: SnapPosition;
};

export type CrownElement = {
  id: string;
  type: 'crown';
  x: number;
  y: number;
  size: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  style: 'solid' | 'outline';
  snap: SnapPosition;
};

export type TagElement = {
  id: string;
  type: 'tag';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  font: string;
  rotation: number;
  snap: SnapPosition;
};

export type CanvasElement =
  | CircleImageElement
  | LogoPillElement
  | SwipeArrowElement
  | HeadingNumberElement
  | HeadingTextElement
  | BodyTextElement
  | CardElement
  | SplitImageElement
  | QuoteMarkElement
  | AttributionElement
  | CrossoutElement
  | CrownElement
  | TagElement;

export type OverlayStyle =
  | 'none' | 'solid' | 'gradient-bottom' | 'gradient-top'
  | 'cinematic' | 'cinematic-soft' | 'double' | 'vignette' | 'bottom-half';

// ---------- NEW: Edge effects + polish ----------
export type EdgeEffect =
  | 'none'
  | 'feather'
  | 'radial'
  | 'fade-to-color';

export type TextAlign = 'left' | 'center' | 'right';
export type PaperBg = 'none' | 'cream' | 'grid' | 'lined';

export type TextStroke = { color: string; width: number };
export type TextShadow = { color: string; blur: number; offsetX: number; offsetY: number };

export type HeaderConfig = {
  enabled: boolean;
  handle: string;
  showCounter: boolean;
  showProgress: boolean;
  accentColor: string;
  textColor: string;
};

export type SlideTheme = {
  font: string;
  fontSize: number;
  textColor: string;
  highlightColor: string;
  align: TextAlign;
  paperBg: PaperBg;
  header: HeaderConfig;
  overlayStyle: OverlayStyle;
  overlayOpacity: number;
  textStroke: TextStroke;
  textShadow: TextShadow;
  letterSpacing: number;
  uppercase: boolean;
  // ---------- Edge effects (theme-level) ----------
  edgeEffect: EdgeEffect;
  edgeIntensity: number;
  edgeColor: string | null; // null = auto (use paper color)
  blurBackground: boolean;
  grainTexture: boolean;
};

export type PostConfig = {
  backgroundImage: string | null;
  paperBg: PaperBg;
  header: HeaderConfig;
  headline: string;
  highlightWords: string[];
  highlightWord?: string;
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
  linkedTheme?: boolean;
  // ---------- NEW: Edge effects ----------
  edgeEffect: EdgeEffect;
  edgeIntensity: number;
  edgeColor: string | null;
  blurBackground: boolean;
  grainTexture: boolean;
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
  headline: 'YOUR BIG HEADLINE GOES HERE',
  highlightWords: ['HEADLINE'],
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
  linkedTheme: true,
  edgeEffect: 'none',
  edgeIntensity: 0.5,
  edgeColor: null,
  blurBackground: false,
  grainTexture: false,
};

export function createEmptySlide(): PostConfig {
  return {
    ...DEFAULT_CONFIG,
    backgroundImage: null,
    headline: '',
    highlightWords: [],
    elements: [],
    linkedTheme: true,
  };
}

export function extractTheme(config: PostConfig): SlideTheme {
  return {
    font: config.font,
    fontSize: config.fontSize,
    textColor: config.textColor,
    highlightColor: config.highlightColor,
    align: config.align,
    paperBg: config.paperBg,
    header: { ...config.header },
    overlayStyle: config.overlayStyle,
    overlayOpacity: config.overlayOpacity,
    textStroke: { ...config.textStroke },
    textShadow: { ...config.textShadow },
    letterSpacing: config.letterSpacing,
    uppercase: config.uppercase,
    edgeEffect: config.edgeEffect,
    edgeIntensity: config.edgeIntensity,
    edgeColor: config.edgeColor,
    blurBackground: config.blurBackground,
    grainTexture: config.grainTexture,
  };
}

export function applyTheme(config: PostConfig, theme: SlideTheme): PostConfig {
  return {
    ...config,
    font: theme.font,
    fontSize: theme.fontSize,
    textColor: theme.textColor,
    highlightColor: theme.highlightColor,
    align: theme.align,
    paperBg: theme.paperBg,
    header: { ...theme.header },
    overlayStyle: theme.overlayStyle,
    overlayOpacity: theme.overlayOpacity,
    textStroke: { ...theme.textStroke },
    textShadow: { ...theme.textShadow },
    letterSpacing: theme.letterSpacing,
    uppercase: theme.uppercase,
    edgeEffect: theme.edgeEffect,
    edgeIntensity: theme.edgeIntensity,
    edgeColor: theme.edgeColor,
    blurBackground: theme.blurBackground,
    grainTexture: theme.grainTexture,
  };
}

export type SavedPost = {
  id: string;
  slides: PostConfig[];
  theme?: SlideTheme;
  previewDataUrl: string;
  createdAt: number;
};

export type LegacySavedPost = {
  id: string;
  config: PostConfig;
  previewDataUrl: string;
  createdAt: number;
};

export function isLegacyPost(post: SavedPost | LegacySavedPost): post is LegacySavedPost {
  return 'config' in post && !('slides' in post);
}

export function normalizeConfig(config: Partial<PostConfig>): PostConfig {
  let highlightWords: string[] = [];
  if (Array.isArray(config.highlightWords)) {
    highlightWords = config.highlightWords;
  } else if (typeof config.highlightWord === 'string' && config.highlightWord.trim()) {
    highlightWords = [config.highlightWord];
  }

  return {
    ...DEFAULT_CONFIG,
    ...config,
    highlightWords,
    paperBg: config.paperBg ?? 'none',
    header: { ...DEFAULT_CONFIG.header, ...(config.header ?? {}) },
    textStroke: { ...DEFAULT_CONFIG.textStroke, ...(config.textStroke ?? {}) },
    textShadow: { ...DEFAULT_CONFIG.textShadow, ...(config.textShadow ?? {}) },
    elements: (config.elements ?? []) as CanvasElement[],
    linkedTheme: config.linkedTheme ?? true,
    edgeEffect: config.edgeEffect ?? 'none',
    edgeIntensity: typeof config.edgeIntensity === 'number' ? config.edgeIntensity : 0.5,
    edgeColor: config.edgeColor ?? null,
    blurBackground: config.blurBackground ?? false,
    grainTexture: config.grainTexture ?? false,
  };
}

export function migrateLegacyPost(post: LegacySavedPost): SavedPost {
  const normalized = normalizeConfig(post.config);
  return {
    id: post.id,
    slides: [normalized],
    theme: extractTheme(normalized),
    previewDataUrl: post.previewDataUrl,
    createdAt: post.createdAt,
  };
}