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

/** The phone's guide: how wide an hour is drawn, in points. */
export const LIVE_TV_GUIDE_HOUR_WIDTH = 200;

/** Height of a channel row in the phone's guide, and of its logo tile. */
export const LIVE_TV_GUIDE_ROW_HEIGHT = 64;

/** Width of the guide's pinned channel column. */
export const LIVE_TV_GUIDE_CHANNEL_WIDTH = 72;

/** Height of the guide's hour labels. */
export const LIVE_TV_GUIDE_HEADER_HEIGHT = 30;

/** Days the guide offers in its day chips, today included. */
export const LIVE_TV_GUIDE_DAYS = 7;

/** Channels the guide asks for at a time; more load as it scrolls down. */
export const LIVE_TV_GUIDE_CHANNELS_PAGE = 50;

/** How close to the bottom, in points, the guide asks for the next channels. */
export const LIVE_TV_GUIDE_LOAD_AHEAD = 600;

/**
 * A program at least this wide keeps its title on screen while the guide
 * scrolls past its start; narrower ones fit their title anyway.
 */
export const LIVE_TV_GUIDE_STICKY_TITLE_MIN_WIDTH =
  2 * LIVE_TV_GUIDE_HOUR_WIDTH;
