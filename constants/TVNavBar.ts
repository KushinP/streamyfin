/** The Android TV top bar (components/tv/TVNavBar.tsx). */

/**
 * Share of the screen a TV may crop at each edge (overscan). Android TV's
 * guidelines keep content inside 5%; the Fire TV top bar sat 16 dp from the
 * top and lost its upper edge.
 */
export const TV_OVERSCAN_SAFE_RATIO = 0.05;

/** The TV top bar's gap above it, before the overscan margin is applied. */
export const TV_NAV_BAR_TOP_GAP = 16;

/**
 * How long the Android TV top bar waits, after focus leaves it, before it
 * slides away: moving between its tabs blurs one before the next is focused.
 */
export const TV_NAV_BAR_HIDE_DELAY_MS = 200;

/** How long the TV top bar takes to slide in or out. */
export const TV_NAV_BAR_SLIDE_MS = 180;

/**
 * Space above and below the tabs, at 1920 by 1080, for a focused tab's 1.05
 * scale: the row scrolls sideways, and on Android it clips what grows past it.
 */
export const TV_NAV_BAR_FOCUS_ROOM = 8;
