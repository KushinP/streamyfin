/**
 * Most tiles one multiview screen holds. Four is what Apple's own multiview
 * offers and about what a phone or a Mac can decode at once; it is also more
 * than a dual tuner can feed, so live channels run out before tiles do.
 */
export const MULTIVIEW_MAX_TILES = 4;

/**
 * Share of the screen width the main tile takes in the focus layout. The rest
 * is a column of small tiles on the right, as in Apple TV multiview.
 */
export const MULTIVIEW_FOCUS_MAIN_RATIO = 0.72;

/** Gap, in points, between tiles. */
export const MULTIVIEW_TILE_GAP = 4;

/**
 * How long, in ms, the multiview toolbar stays up after the last touch.
 */
export const MULTIVIEW_TOOLBAR_HIDE_DELAY = 5_000;

/**
 * Buffer settings for one tile. Each tile is its own MPV instance, so the
 * single-player defaults (up to 150 MB forward each) would multiply by the
 * tile count. These are the lowest values the native player accepts.
 */
export const MULTIVIEW_TILE_CACHE = {
  enabled: "auto",
  cacheSeconds: 10,
  maxBytes: 50,
  maxBackBytes: 25,
} as const;
