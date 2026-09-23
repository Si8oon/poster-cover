// components/FlowerOfLife.tsx
'use client';

/**
 * Flower of Life — a single centered sacred-geometry pattern.
 * Breathes (scales up/down) and glows (opacity pulses) on a slow loop.
 * Tinted with the accent color passed via prop.
 */
export default function FlowerOfLife({ color }: { color: string }) {
  const CIRCLES = buildFlowerOfLife();

  // The pattern is drawn in a 1000x1000 viewBox with radius 100.
  // It's rendered larger than the viewport so edges bleed off.
  return (
    <>
      <style jsx>{`
        @keyframes flowerBreath {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.08;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
            opacity: 0.16;
          }
        }
        @keyframes flowerGlow {
          0%, 100% {
            opacity: 0.15;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.35;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }
      `}</style>

      {/* Outer glow layer */}
      <div
        className="pointer-events-none fixed top-1/2 left-1/2 z-0"
        style={{
          width: '180vmax',
          height: '180vmax',
          background: `radial-gradient(circle, ${color}66 0%, transparent 55%)`,
          filter: 'blur(60px)',
          animation: 'flowerGlow 8s ease-in-out infinite',
          willChange: 'transform, opacity',
        }}
      />

      {/* The flower pattern itself */}
      <div
        className="pointer-events-none fixed top-1/2 left-1/2 z-0"
        style={{
          width: '130vmax',
          height: '130vmax',
          animation: 'flowerBreath 8s ease-in-out infinite',
          willChange: 'transform, opacity',
        }}
      >
        <svg
          viewBox="-500 -500 1000 1000"
          width="100%"
          height="100%"
          style={{ display: 'block' }}
        >
          {CIRCLES.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={100}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
            />
          ))}
        </svg>
      </div>
    </>
  );
}

/**
 * Returns the coordinates of all circles in the classic Flower of Life.
 * - Center circle at (0,0)
 * - 6 circles around it at distance 100 (radius), angles 0°..300° in 60° steps
 * - 12 circles around those at distance 200, angles 0°..330° in 30° steps
 * Total: 1 + 6 + 12 = 19 circles.
 */
function buildFlowerOfLife() {
  const R = 100;
  const circles: { x: number; y: number }[] = [{ x: 0, y: 0 }];

  // First ring — 6 circles
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60° steps
    circles.push({
      x: Math.cos(angle) * R,
      y: Math.sin(angle) * R,
    });
  }

  // Second ring — 12 circles
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI / 6) * i; // 30° steps
    circles.push({
      x: Math.cos(angle) * R * 2,
      y: Math.sin(angle) * R * 2,
    });
  }

  return circles;
}