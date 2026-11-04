/** Channels the phone's Channels list asks for, as it always has. */
export const LIVE_TV_CHANNELS_LIMIT = 500;

/** How far ahead the Channels list looks for each channel's next program. */
export const LIVE_TV_NEXT_LOOKAHEAD_MS = 6 * 60 * 60 * 1000;

/**
 * How often the Channels list moves its progress bars. One clock for the
 * whole list, not one per row.
 */
export const LIVE_TV_PROGRESS_TICK_MS = 60 * 1000;

/** How long the now and next programs are trusted before they are fetched again. */
export const LIVE_TV_NOW_NEXT_STALE_MS = 5 * 60 * 1000;
