import { MULTIVIEW_MAX_TILES } from "@/constants/Multiview";
import {
  addTile,
  emptyMultiview,
  isTileMuted,
  type MultiviewState,
  promoteTile,
  removeTile,
  selectAudio,
  tileFrames,
  toggleAllAudio,
  toggleLayout,
} from "./multiview";

const withTiles = (...ids: string[]): MultiviewState =>
  ids.reduce((state, id) => addTile(state, id, `k-${id}`), emptyMultiview);

describe("multiview tiles", () => {
  test("the first tile added is the one heard", () => {
    const state = withTiles("game-1", "game-2");
    expect(state.audio).toBe("k-game-1");
    expect(isTileMuted(state, "k-game-1")).toBe(false);
    expect(isTileMuted(state, "k-game-2")).toBe(true);
  });

  test("refuses the same item twice, so one channel never holds two tuners", () => {
    const state = withTiles("game-1");
    expect(addTile(state, "game-1", "other-key")).toBe(state);
  });

  test("refuses a tile past the maximum", () => {
    const ids = Array.from({ length: MULTIVIEW_MAX_TILES }, (_, i) => `i${i}`);
    const full = withTiles(...ids);
    expect(addTile(full, "one-more", "k").tiles).toHaveLength(
      MULTIVIEW_MAX_TILES,
    );
  });

  test("removing the heard tile moves the sound to the first one left", () => {
    const state = selectAudio(withTiles("a", "b", "c"), "k-b");
    expect(removeTile(state, "k-b").audio).toBe("k-a");
  });

  test("removing a muted tile keeps the sound where it is", () => {
    const state = selectAudio(withTiles("a", "b", "c"), "k-c");
    expect(removeTile(state, "k-a").audio).toBe("k-c");
  });

  test("removing the last tile leaves nothing heard", () => {
    expect(removeTile(withTiles("a"), "k-a")).toEqual(emptyMultiview);
  });

  test("hearing every tile unmutes all of them, and coming back picks the main one", () => {
    const state = selectAudio(withTiles("a", "b"), "k-b");
    const all = toggleAllAudio(state);
    expect(isTileMuted(all, "k-a")).toBe(false);
    expect(isTileMuted(all, "k-b")).toBe(false);
    expect(toggleAllAudio(all).audio).toBe("k-a");
  });

  test("selecting a tile that is not on screen changes nothing", () => {
    const state = withTiles("a");
    expect(selectAudio(state, "missing")).toBe(state);
  });

  test("promoting a tile puts it first and makes it the one heard", () => {
    const state = promoteTile(withTiles("a", "b", "c"), "k-c");
    expect(state.tiles.map((t) => t.itemId)).toEqual(["c", "a", "b"]);
    expect(state.audio).toBe("k-c");
  });

  test("promoting keeps every tile heard when that was the choice", () => {
    const state = toggleAllAudio(withTiles("a", "b"));
    expect(promoteTile(state, "k-b").audio).toBe("all");
  });

  test("the layout toggles between grid and focus", () => {
    const focus = toggleLayout(emptyMultiview);
    expect(focus.layout).toBe("focus");
    expect(toggleLayout(focus).layout).toBe("grid");
  });
});

describe("tileFrames", () => {
  const W = 1920;
  const H = 1080;

  test("one tile fills a 16:9 screen", () => {
    expect(tileFrames("grid", 1, W, H, 0)).toEqual([
      { left: 0, top: 0, width: W, height: H },
    ]);
  });

  test("two tiles in the grid sit side by side, at 16:9, without overlapping", () => {
    const [a, b] = tileFrames("grid", 2, W, H, 0);
    expect(a.width).toBe(W / 2);
    expect(a.height).toBeCloseTo((W / 2) * (9 / 16));
    expect(b.left).toBeGreaterThanOrEqual(a.left + a.width);
    expect(a.top).toBe(b.top);
  });

  test("four tiles in the grid make a 2x2", () => {
    const frames = tileFrames("grid", 4, W, H, 0);
    expect(frames.map((f) => [f.left, f.top])).toEqual([
      [0, 0],
      [W / 2, 0],
      [0, H / 2],
      [W / 2, H / 2],
    ]);
  });

  test("the focus layout gives the first tile most of the screen", () => {
    const [main, ...rest] = tileFrames("focus", 3, W, H);
    for (const small of rest) {
      expect(main.width).toBeGreaterThan(small.width * 2);
      expect(small.left).toBeGreaterThan(main.left + main.width);
    }
  });

  test("small tiles in the focus layout never run off the screen", () => {
    for (const count of [2, 3, 4]) {
      for (const frame of tileFrames("focus", count, W, H)) {
        expect(frame.top).toBeGreaterThanOrEqual(0);
        expect(frame.top + frame.height).toBeLessThanOrEqual(H + 0.001);
        expect(frame.left + frame.width).toBeLessThanOrEqual(W + 0.001);
      }
    }
  });

  test("a screen not measured yet has no frames", () => {
    expect(tileFrames("grid", 2, 0, 0)).toEqual([]);
  });
});
