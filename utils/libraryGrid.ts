import {
  LIBRARY_GRID_GAP,
  LIBRARY_GRID_MAX_COLUMNS,
  LIBRARY_GRID_MIN_WIDTH,
  LIBRARY_TILE_MIN_WIDTH,
} from "@/constants/Libraries";

/**
 * How many columns of library tiles fit a content width, or 0 for the
 * phone list. Two at least once the grid starts, so a just-wide window does
 * not show one stretched tile per row.
 */
export const libraryGridColumns = (contentWidth: number): number => {
  if (contentWidth < LIBRARY_GRID_MIN_WIDTH) return 0;
  const fit = Math.floor(
    (contentWidth + LIBRARY_GRID_GAP) /
      (LIBRARY_TILE_MIN_WIDTH + LIBRARY_GRID_GAP),
  );
  return Math.min(LIBRARY_GRID_MAX_COLUMNS, Math.max(2, fit));
};
