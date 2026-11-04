/**
 * The URL scheme this app answers to, as `app.json` `expo.scheme` declares it.
 * Links the app hands to the system (Top Shelf, Android TV home channels)
 * must use it: a link in another app's scheme opens that app, or nothing.
 * SuperFin's is not upstream Streamyfin's, so both can be installed together.
 * `AppScheme.test.ts` keeps this, `app.json` and the Kotlin links in step.
 */
export const APP_SCHEME = "superfin";
