import { AmbientTint } from "@/constants/Colors";

const parseHex = (color: string): [number, number, number] | null => {
  const hex = color.trim().replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/**
 * The dark wash a page's background takes from its artwork's colour: that
 * colour pulled most of the way to black, so text on it reads as on black.
 *
 * Null when there is no real colour to take: an unreadable value, or a grey
 * (white is what the colour hook returns before it has one), which would only
 * turn the page a muddy grey.
 */
export const ambientTint = (
  color: string | null | undefined,
  strength: number = AmbientTint.strength,
): string | null => {
  if (!color) return null;
  const rgb = parseHex(color);
  if (!rgb) return null;
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  const saturation = max === 0 ? 0 : (max - min) / max;
  if (saturation < AmbientTint.minSaturation) return null;
  const [r, g, b] = rgb.map((c) => Math.round(c * strength));
  return `rgb(${r}, ${g}, ${b})`;
};
