import { createPlaybackStartWatch } from "./playbackStart";

describe("createPlaybackStartWatch", () => {
  test("does not count the first tick, which MPV sends before any frame", () => {
    // The renderer seeds its first tick from the start position as soon as
    // the duration is known, before a frame is decoded
    // (.claude/learned-facts/mpv-view-first-progress-tick-is-zero.md).
    const started = createPlaybackStartWatch();
    expect(started(0)).toBe(false);
  });

  test("does not count a repeat of the start position", () => {
    const started = createPlaybackStartWatch();
    started(0);
    expect(started(0)).toBe(false);
  });

  test("counts the first tick that moves past the start position", () => {
    const started = createPlaybackStartWatch();
    started(0);
    expect(started(0.4)).toBe(true);
  });

  test("measures from a resumed library item's start, not from 0", () => {
    const started = createPlaybackStartWatch();
    expect(started(1140)).toBe(false);
    expect(started(1140)).toBe(false);
    expect(started(1140.5)).toBe(true);
  });

  test("stays started once playback has moved", () => {
    const started = createPlaybackStartWatch();
    started(0);
    started(1);
    expect(started(1)).toBe(true);
  });
});
