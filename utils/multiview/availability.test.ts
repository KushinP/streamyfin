import { isMultiviewAvailable, multiviewEngine } from "./availability";

describe("isMultiviewAvailable", () => {
  test("iPhone, iPad and Mac get multiview", () => {
    expect(isMultiviewAvailable({ OS: "ios", isTV: false })).toBe(true);
  });

  test("Android TV and Fire TV get it too, on ExoPlayer", () => {
    expect(isMultiviewAvailable({ OS: "android", isTV: true })).toBe(true);
  });

  test("an Android phone does not: its only player allows one video at a time", () => {
    // MpvOwnership.kt is a process-wide lock, and ExoPlayer ships for TV
    // only (isExoPlayerSupported).
    expect(isMultiviewAvailable({ OS: "android", isTV: false })).toBe(false);
  });

  test("Apple TV does not, it has no multiview screen", () => {
    expect(isMultiviewAvailable({ OS: "ios", isTV: true })).toBe(false);
  });
});

describe("multiviewEngine", () => {
  test("Android TV tiles play on ExoPlayer, which allows several players", () => {
    expect(multiviewEngine({ OS: "android", isTV: true })).toBe("exoplayer");
  });

  test("Apple devices keep MPV", () => {
    expect(multiviewEngine({ OS: "ios", isTV: false })).toBe("mpv");
  });
});
