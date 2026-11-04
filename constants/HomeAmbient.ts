/**
 * The phone's Home backdrop (HomeAmbientBackdrop): a small, blurred copy of
 * the hero slide on screen, behind the whole page.
 */

/** How long the hero has to rest on a slide before the backdrop follows it. */
export const HOME_AMBIENT_DEBOUNCE_MS = 250;

/** Length of the crossfade from one slide's backdrop to the next. */
export const HOME_AMBIENT_CROSSFADE_MS = 600;

/**
 * Width of the backdrop request, in pixels. Blurred this hard, a thumbnail
 * looks the same as the full image and costs next to nothing to decode.
 */
export const HOME_AMBIENT_IMAGE_WIDTH = 96;

/** JPEG quality of that request. */
export const HOME_AMBIENT_IMAGE_QUALITY = 60;

/** Blur radius over the backdrop. */
export const HOME_AMBIENT_BLUR_RADIUS = 40;

/** How much of the backdrop shows through, before the fade to black. */
export const HOME_AMBIENT_OPACITY = 0.8;
