type PlatformInfo = { OS: string; isTV?: boolean };

/**
 * Whether this build can run multiview: iPhone, iPad and the Mac on MPV, and
 * Android TV (Fire TV included) on ExoPlayer.
 *
 * Android's MPV player takes a process-wide lock (`MpvOwnership.kt`), so a
 * second MPV tile would wait on it forever while its server stream, and for a
 * live channel its tuner, stayed open. ExoPlayer has no such lock, but it
 * ships for Android TV only (isExoPlayerSupported), so an Android phone still
 * goes without. Apple TV has no multiview screen.
 */
export const isMultiviewAvailable = (platform: PlatformInfo): boolean =>
  platform.OS === "ios"
    ? !platform.isTV
    : platform.OS === "android" && !!platform.isTV;

/** The player multiview tiles use here: see isMultiviewAvailable. */
export const multiviewEngine = (platform: PlatformInfo): "mpv" | "exoplayer" =>
  platform.OS === "android" ? "exoplayer" : "mpv";
