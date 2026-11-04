import {
  LIBRARY_GRID_GAP,
  LIBRARY_GRID_MAX_COLUMNS,
  LIBRARY_GRID_MIN_WIDTH,
  LIBRARY_TILE_MIN_WIDTH,
} from "@/constants/Libraries";
import { libraryGridColumns } from "./libraryGrid";

describe("libraryGridColumns", () => {
  test("a phone-width window keeps the list", () => {
    expect(libraryGridColumns(390)).toBe(0);
    expect(libraryGridColumns(LIBRARY_GRID_MIN_WIDTH - 1)).toBe(0);
  });

  test("fits as many tiles as stay at least the minimum width", () => {
    // 960 wide fits three 300 tiles with two gaps, not four.
    expect(libraryGridColumns(960)).toBe(3);
    const fourWide = 4 * LIBRARY_TILE_MIN_WIDTH + 3 * LIBRARY_GRID_GAP;
    expect(libraryGridColumns(fourWide)).toBe(4);
    expect(libraryGridColumns(fourWide - 1)).toBe(3);
  });

  test("never goes past the column cap or below two", () => {
    expect(libraryGridColumns(5000)).toBe(LIBRARY_GRID_MAX_COLUMNS);
    expect(libraryGridColumns(LIBRARY_GRID_MIN_WIDTH)).toBe(2);
  });
});
