// components/WorldDecorations.tsx
'use client';

import { useMemo } from 'react';
import { energySpeed, type UserWorld } from '@/lib/world';

type Props = {
  world: UserWorld;
  count?: number;
};

/**
 * Only renders butterflies and clouds — the two remaining welcome-world
 * decoration types. All other floating objects have been removed.
 */
export default function WorldDecorations({ world, count }: Props) {
  const speed = energySpeed(world.energy);

  const density =
    count ?? (world.energy === 'wild' ? 24 : world.energy === 'playful' ? 18 : 14);

  const items = useMemo(() => {
    const list: {
      id: string;
      emoji: string;
      motion: 'drift' | 'rise' | 'pulse';
      left: number;
      top: number;
      size: number;
      delay: number;
      duration: number;
      rotate: number;
      opacity: number;
    }[] = [];

    world.objects.forEach((objId) => {
      // Only allow butterflies and clouds now
      if (objId !== 'butterflies' && objId !== 'clouds') return;

      const emoji = objId === 'butterflies' ? '🦋' : '☁️';
      const motion: 'drift' | 'rise' | 'pulse' =
        objId === 'butterflies' ? 'drift' : 'drift';

      const perObject = Math.ceil(density / Math.max(1, world.objects.length));

      for (let i = 0; i < perObject; i++) {
        list.push({
          id: `${objId}-${i}`,
          emoji,
          motion,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: objId === 'butterflies'
            ? 18 + Math.random() * 22    // butterflies a bit smaller
            : 24 + Math.random() * 40,   // clouds bigger
          delay: -Math.random() * 20,
          duration: (14 + Math.random() * 18) * speed,
          rotate: (Math.random() - 0.5) * 30,
          opacity: objId === 'butterflies'
            ? 0.5 + Math.random() * 0.4
            : 0.3 + Math.random() * 0.35,
        });
      }
    });

    return list;
  }, [world.objects.join(','), world.energy, density, speed]);

  return (
    <>
      <style jsx>{`
        @keyframes world-drift {
          0% { transform: translateX(-20px) translateY(0) rotate(0deg); }
          50% { transform: translateX(20px) translateY(-10px) rotate(5deg); }
          100% { transform: translateX(-20px) translateY(0) rotate(0deg); }
        }
        @keyframes world-rise {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-120vh) rotate(20deg); opacity: 0; }
        }
        @keyframes world-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute"
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              fontSize: `${item.size}px`,
              opacity: item.opacity,
              transform: `rotate(${item.rotate}deg)`,
              animation: `${animationFor(item.motion)} ${item.duration}s ease-in-out ${item.delay}s infinite`,
              willChange: 'transform, opacity',
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>
    </>
  );
}

function animationFor(motion: string): string {
  switch (motion) {
    case 'rise': return 'world-rise';
    case 'pulse': return 'world-pulse';
    default: return 'world-drift';
  }
}