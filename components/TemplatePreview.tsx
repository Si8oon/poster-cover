// components/TemplatePreview.tsx
'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import type Konva from 'konva';
import { getPreviewConfig } from '@/lib/templatePreviews';
import type { PostConfig } from '@/lib/types';

// Reuse the real PostCanvas — guarantees preview matches editor output.
const PostCanvas = dynamic(() => import('./editor/PostCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-200 animate-pulse" />
  ),
});

type Props = {
  templateId: string;
  /** Base config to inherit defaults from (usually DEFAULT_CONFIG) */
  baseConfig: PostConfig;
  /** Display width in px. Height is auto-calculated as 4:5 ratio. */
  width?: number;
};

/**
 * Renders a live mini-canvas of a template using sample content,
 * scaled down to fit inside a card.
 */
export default function TemplatePreview({
  templateId,
  baseConfig,
  width = 200,
}: Props) {
  const stageRef = useRef<Konva.Stage | null>(null);
  const previewConfig = getPreviewConfig(templateId, baseConfig);

  // Canvas internal size is always 432x540.
  // We scale it visually using CSS transform.
  const height = (width * 540) / 432; // keep 4:5 ratio
  const scale = width / 432;

  return (
    <div
      className="relative overflow-hidden rounded-lg pointer-events-none select-none"
      style={{ width, height }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 432,
          height: 540,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <PostCanvas
          config={previewConfig}
          onChange={() => {}}
          stageRef={stageRef}
          onRequestImage={() => {}}
          slideIndex={0}
          slideCount={1}
        />
      </div>
    </div>
  );
}