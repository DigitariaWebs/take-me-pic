import Svg, { Rect } from 'react-native-svg';
import { type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';

/**
 * A QR-style placeholder drawn with SVG — finder patterns in the three corners,
 * an alignment square, and a deterministic module grid seeded from a string.
 * It LOOKS like a real QR (not a blank square) but isn't scannable; swap for
 * react-native-qrcode-svg when the real share-QR ships.
 */
const N = 25; // modules per side

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Is (r,c) part of a finder pattern + its 1-module separator (top-left,
// top-right, bottom-left)?
function reserved(r: number, c: number): boolean {
  const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 8 && c >= c0 && c < c0 + 8;
  return inBox(0, 0) || inBox(0, N - 8) || inBox(N - 8, 0);
}

export function QRPlaceholder({
  size = 200,
  seed = 'tmp',
  color,
  background,
}: {
  size?: number;
  seed?: string;
  color?: string;
  background?: string;
}) {
  const colors = useThemeColors();
  const resolvedColor = color ?? colors.ink;
  const resolvedBackground = background ?? colors.polaroid;

  const quiet = 1; // quiet-zone modules each side
  const cell = size / (N + quiet * 2);
  const off = quiet * cell;
  const h = hash(seed);

  const rects: { x: number; y: number; w: number; h: number; fill: string }[] = [];
  const push = (mr: number, mc: number, mw: number, mh: number, fill: string) =>
    rects.push({ x: off + mc * cell, y: off + mr * cell, w: mw * cell, h: mh * cell, fill });

  // Finder pattern: 7x7 filled, 5x5 white inset, 3x3 filled
  const finder = (r0: number, c0: number) => {
    push(r0, c0, 7, 7, resolvedColor);
    push(r0 + 1, c0 + 1, 5, 5, resolvedBackground);
    push(r0 + 2, c0 + 2, 3, 3, resolvedColor);
  };
  finder(0, 0);
  finder(0, N - 7);
  finder(N - 7, 0);

  // Alignment pattern bottom-right (5x5 filled, 3x3 white, 1x1 filled)
  const ar = N - 9;
  const ac = N - 9;
  push(ar, ac, 5, 5, resolvedColor);
  push(ar + 1, ac + 1, 3, 3, resolvedBackground);
  push(ar + 2, ac + 2, 1, 1, resolvedColor);

  // Data modules — deterministic noise, skipping reserved areas
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (reserved(r, c)) continue;
      // skip the alignment box too
      if (r >= ar && r < ar + 5 && c >= ac && c < ac + 5) continue;
      const v = (h ^ (r * 73856093) ^ (c * 19349663)) >>> 0;
      if (v % 100 < 46) push(r, c, 1, 1, resolvedColor);
    }
  }

  return (
    <Svg width={size} height={size}>
      <Rect x={0} y={0} width={size} height={size} fill={resolvedBackground} />
      {rects.map((m, i) => (
        <Rect key={i} x={m.x} y={m.y} width={m.w} height={m.h} fill={m.fill} />
      ))}
    </Svg>
  );
}
