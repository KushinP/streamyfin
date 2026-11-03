/**
 * Tells, from a tile's progress ticks, when its video has actually started.
 *
 * MPV's own "loading" flag clears when the file loads, which for a live
 * channel is seconds before the first frame: the server is still tuning and
 * starting a transcode. Its first progress tick comes just as early, carrying
 * the start position it was seeded with
 * (.claude/learned-facts/mpv-view-first-progress-tick-is-zero.md). The first
 * tick that moves past that position is the first proof of playback, and it
 * works the same on iOS and Android.
 *
 * Returns a function to call with every tick; it answers whether playback
 * has started, and keeps answering yes once it has.
 */
export const createPlaybackStartWatch = () => {
  let startPosition: number | null = null;
  let started = false;
  return (position: number): boolean => {
    if (started) return true;
    if (startPosition === null) {
      startPosition = position;
      return false;
    }
    started = position > startPosition;
    return started;
  };
};
