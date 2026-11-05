import { macSidebarItems } from "./macSidebar";

const ids = (settings: Parameters<typeof macSidebarItems>[0]) =>
  macSidebarItems(settings).map((item) => item.segment);

describe("macSidebarItems", () => {
  test("lists the same tabs as the tab bar, in its order", () => {
    expect(ids({})).toEqual([
      "(home)",
      "(search)",
      "(favorites)",
      "(libraries)",
    ]);
  });

  test("shows Watchlists only with a StreamyStats server and the tab on", () => {
    expect(ids({ streamyStatsServerUrl: "https://stats" })).toContain(
      "(watchlists)",
    );
    expect(
      ids({ streamyStatsServerUrl: "https://stats", hideWatchlistsTab: true }),
    ).not.toContain("(watchlists)");
  });

  test("shows Custom links only when they are turned on", () => {
    expect(ids({ showCustomMenuLinks: true })).toEqual([
      "(home)",
      "(search)",
      "(favorites)",
      "(libraries)",
      "(custom-links)",
    ]);
  });

  test("every item opens its own tab", () => {
    for (const item of macSidebarItems({
      streamyStatsServerUrl: "x",
      showCustomMenuLinks: true,
    })) {
      expect(item.href.startsWith(`/(auth)/(tabs)/${item.segment}`)).toBe(true);
    }
  });

  test("shows Live TV after Favorites when the user has it", () => {
    expect(macSidebarItems({}, true).map((item) => item.segment)).toEqual([
      "(home)",
      "(search)",
      "(favorites)",
      "(livetv)",
      "(libraries)",
    ]);
  });

  test("Live TV opens at the Live TV screen, not the bare group", () => {
    const live = macSidebarItems({}, true).find(
      (item) => item.segment === "(livetv)",
    );
    expect(live?.href).toBe("/(auth)/(tabs)/(livetv)/livetv");
  });
});
