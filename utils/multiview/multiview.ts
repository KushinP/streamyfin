import {
  MULTIVIEW_FOCUS_MAIN_RATIO,
  MULTIVIEW_MAX_TILES,
  MULTIVIEW_TILE_GAP,
} from "@/constants/Multiview";

/**
 * "grid" gives every tile the same size (side by side for two, 2x2 for more).
 * "focus" makes the first tile big and stacks the rest down the right side.
 */
export type MultiviewLayout = "grid" | "focus";

/** Which tile is heard: one tile's key, or every tile at once. */
export type MultiviewAudio = string | "all" | null;

export interface MultiviewTile {
  /** Stable per tile, so a tile keeps its player across layout changes. */
  key: string;
  itemId: string;
}

export interface MultiviewState {
  tiles: MultiviewTile[];
  audio: MultiviewAudio;
  layout: MultiviewLayout;
}

export interface TileFrame {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const emptyMultiview: MultiviewState = {
  tiles: [],
  audio: null,
  layout: "grid",
};

/**
 * Adds an item as a new tile. Refuses (returns the state unchanged) when the
 * screen is full or the item is already up: two tiles of one live channel
 * would hold a second tuner for the same picture. The first tile is heard.
 */
export const addTile = (
  state: MultiviewState,
  itemId: string,
  key: string,
): MultiviewState => {
  if (state.tiles.length >= MULTIVIEW_MAX_TILES) return state;
  if (state.tiles.some((tile) => tile.itemId === itemId)) return state;
  return {
    ...state,
    tiles: [...state.tiles, { key, itemId }],
    audio: state.audio ?? key,
  };
};

/**
 * Removes a tile. When it was the one being heard, the sound moves to the
 * first tile left rather than going silent.
 */
export const removeTile = (
  state: MultiviewState,
  key: string,
): MultiviewState => {
  const tiles = state.tiles.filter((tile) => tile.key !== key);
  if (tiles.length === state.tiles.length) return state;
  const audio =
    state.audio === key || tiles.length === 0
      ? (tiles[0]?.key ?? null)
      : state.audio;
  return { ...state, tiles, audio };
};

/** Makes a tile the only one heard. */
export const selectAudio = (
  state: MultiviewState,
  key: string,
): MultiviewState =>
  state.tiles.some((tile) => tile.key === key)
    ? { ...state, audio: key }
    : state;

/**
 * Switches between hearing every tile and hearing one. Coming back from "all"
 * picks the main tile, since there is no earlier choice to restore.
 */
export const toggleAllAudio = (state: MultiviewState): MultiviewState => {
  if (state.audio === "all") {
    return { ...state, audio: state.tiles[0]?.key ?? null };
  }
  return state.tiles.length > 0 ? { ...state, audio: "all" } : state;
};

/** Whether a tile's player should be muted. */
export const isTileMuted = (state: MultiviewState, key: string): boolean =>
  state.audio !== "all" && state.audio !== key;

/**
 * Moves a tile to the front, which is the big one in the focus layout. The
 * sound follows it: promoting a tile is choosing to watch it.
 */
export const promoteTile = (
  state: MultiviewState,
  key: string,
): MultiviewState => {
  const tile = state.tiles.find((t) => t.key === key);
  if (!tile) return state;
  return {
    ...state,
    tiles: [tile, ...state.tiles.filter((t) => t.key !== key)],
    audio: state.audio === "all" ? "all" : key,
  };
};

export const toggleLayout = (state: MultiviewState): MultiviewState => ({
  ...state,
  layout: state.layout === "grid" ? "focus" : "grid",
});

/** Largest 16:9 box that fits in the given cell, centred in it. */
const fit169 = (
  left: number,
  top: number,
  width: number,
  height: number,
): TileFrame => {
  const w = Math.min(width, (height * 16) / 9);
  const h = (w * 9) / 16;
  return {
    left: left + (width - w) / 2,
    top: top + (height - h) / 2,
    width: w,
    height: h,
  };
};

const gridFrames = (
  count: number,
  width: number,
  height: number,
  gap: number,
): TileFrame[] => {
  if (count === 1) return [fit169(0, 0, width, height)];
  if (count === 2) {
    const cellWidth = (width - gap) / 2;
    return [
      fit169(0, 0, cellWidth, height),
      fit169(cellWidth + gap, 0, cellWidth, height),
    ];
  }
  const cellWidth = (width - gap) / 2;
  const cellHeight = (height - gap) / 2;
  return Array.from({ length: count }, (_, i) =>
    fit169(
      (i % 2) * (cellWidth + gap),
      Math.floor(i / 2) * (cellHeight + gap),
      cellWidth,
      cellHeight,
    ),
  );
};

const focusFrames = (
  count: number,
  width: number,
  height: number,
  gap: number,
): TileFrame[] => {
  if (count === 1) return [fit169(0, 0, width, height)];
  const mainWidth = width * MULTIVIEW_FOCUS_MAIN_RATIO;
  const sideLeft = mainWidth + gap;
  const sideWidth = width - sideLeft;
  const others = count - 1;
  // Each small tile is as wide as the column unless the column is too short
  // to stack them all at 16:9; the stack is centred vertically.
  const tileHeight = Math.min(
    (sideWidth * 9) / 16,
    (height - gap * (others - 1)) / others,
  );
  const stackHeight = tileHeight * others + gap * (others - 1);
  const stackTop = (height - stackHeight) / 2;
  return [
    fit169(0, 0, mainWidth, height),
    ...Array.from({ length: others }, (_, i) =>
      fit169(
        sideLeft,
        stackTop + i * (tileHeight + gap),
        sideWidth,
        tileHeight,
      ),
    ),
  ];
};

/**
 * Where each tile sits on a screen of the given size, in tile order. Tiles are
 * positioned absolutely from these frames instead of by flex layout so that a
 * layout change or a promotion only moves the players, never remounts them:
 * a remount would close and reopen the stream, and a live one its tuner.
 */
export const tileFrames = (
  layout: MultiviewLayout,
  count: number,
  width: number,
  height: number,
  gap: number = MULTIVIEW_TILE_GAP,
): TileFrame[] => {
  if (count <= 0 || width <= 0 || height <= 0) return [];
  return layout === "focus"
    ? focusFrames(count, width, height, gap)
    : gridFrames(count, width, height, gap);
};
