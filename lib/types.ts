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
  | 'attribution';

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

export type HeadingNumberElement = {
  id: string;
  type: 'headingNumber';
  x: number;
  y: number;
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
  x: number;
  y: number;
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
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  font: string;
  lineHeight: number;
  width: number;
  align?: 'left' | 'center' | 'right';
  snap: SnapPosition;
};

export type CardStat = {
  icon: string;
  value: string;
  label: string;
};

export type CardElement = {
  id: string;
  type: 'card';
  x: number;
  y: number;
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
  x: number;
  y: number;
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
  x: number;
  y: number;
  char: string;
  fontSize: number;
  color: string;
  font: string;
  snap: SnapPosition;
};

export type AttributionElement = {
  id: string;
  type: 'attribution';
  x: number;
  y: number;
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
  | AttributionElement;

export type OverlayStyle =
  | 'none'
  | 'solid'
  | 'gradient-bottom'
  | 'gradient-top'
  | 'cinematic'
  | 'cinematic-soft'
  | 'double'
  | 'vignette'
  | 'bottom-half';

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

// ---------- NEW: shared theme for linked slides ----------

/**
 * A "theme" holds the styling tokens that should be shared
 * across all linked slides in a post.
 */
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
  /** NEW: if true, this slide inherits from the post's theme. */
  linkedTheme?: boolean;
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
  linkedTheme: true,
};

export function createEmptySlide(): PostConfig {
  return {
    ...DEFAULT_CONFIG,
    backgroundImage: null,
    headline: '',
    highlightWord: '',
    elements: [],
    linkedTheme: true,
  };
}

/** Extracts the theme-able fields from a config into a SlideTheme object. */
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
  };
}

/** Applies a theme to a config, preserving content fields. */
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
  };
}

// ---------- Saved post ----------

export type SavedPost = {
  id: string;
  slides: PostConfig[];
  /** The shared theme for linked slides. */
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
    linkedTheme: config.linkedTheme ?? true,
  };
}

export function migrateLegacyPost(post: LegacySavedPost): SavedPost {
  return {
    id: post.id,
    slides: [normalizeConfig(post.config)],
    theme: extractTheme(normalizeConfig(post.config)),
    previewDataUrl: post.previewDataUrl,
    createdAt: post.createdAt,
  };
}