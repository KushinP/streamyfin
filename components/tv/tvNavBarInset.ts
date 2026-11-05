import {
  TV_NAV_BAR_TOP_GAP,
  TV_OVERSCAN_SAFE_RATIO,
} from "@/constants/TVSizes";

/**
 * Space above the TV top bar: its usual gap below the safe-area inset, but
 * never inside the strip a TV crops at its edges.
 */
export const tvNavBarTopInset = (windowHeight: number, insetTop: number) =>
  Math.max(
    insetTop + TV_NAV_BAR_TOP_GAP,
    Math.round(windowHeight * TV_OVERSCAN_SAFE_RATIO),
  );
