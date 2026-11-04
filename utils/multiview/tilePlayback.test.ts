import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { MULTIVIEW_END_TOLERANCE } from "@/constants/Multiview";
import { isAtEnd, nextEpisodeIn } from "./tilePlayback";

describe("isAtEnd", () => {
  test("a position within the tolerance of the end is the end", () => {
    // MPV's last tick lands a little short of the duration, then stops.
    expect(isAtEnd(1300.6, 1302)).toBe(true);
    expect(isAtEnd(1302, 1302)).toBe(true);
  });

  test("anywhere earlier is not", () => {
    expect(isAtEnd(1302 - MULTIVIEW_END_TOLERANCE - 1, 1302)).toBe(false);
    expect(isAtEnd(100, 1302)).toBe(false);
  });

  test("takes a tighter tolerance when asked", () => {
    expect(isAtEnd(1299.5, 1302, 1)).toBe(false);
    expect(isAtEnd(1301.5, 1302, 1)).toBe(true);
  });

  test("a stream with no known duration never ends, a live channel among them", () => {
    expect(isAtEnd(0, 0)).toBe(false);
    expect(isAtEnd(50, 0)).toBe(false);
  });
});

describe("nextEpisodeIn", () => {
  const ep = (Id: string, extra: Partial<BaseItemDto> = {}): BaseItemDto => ({
    Id,
    Type: "Episode",
    ...extra,
  });

  test("is the episode after this one", () => {
    expect(nextEpisodeIn([ep("4"), ep("5"), ep("6")], "5")?.Id).toBe("6");
  });

  test("the last episode has none", () => {
    expect(nextEpisodeIn([ep("4"), ep("5")], "5")).toBeNull();
  });

  test("skips a missing episode the server only knows by name", () => {
    expect(
      nextEpisodeIn([ep("5"), ep("6", { LocationType: "Virtual" })], "5"),
    ).toBeNull();
  });

  test("is nothing when this episode is not in the list", () => {
    expect(nextEpisodeIn([ep("4"), ep("6")], "5")).toBeNull();
    expect(nextEpisodeIn(undefined, "5")).toBeNull();
  });
});
