import type { Ionicons } from "@expo/vector-icons";
import type { Settings } from "@/utils/atoms/settings";

export type MacSidebarItem = {
  /** The tab group's route segment, as useSegments() reports it. */
  segment: string;
  href: string;
  titleKey: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

const tab = (
  segment: string,
  titleKey: string,
  icon: MacSidebarItem["icon"],
): MacSidebarItem => ({
  segment,
  href: `/(auth)/(tabs)/${segment}`,
  titleKey,
  icon,
});

/**
 * The Mac sidebar's sections: the tab bar's tabs, in its order, hidden by the
 * same settings that hide them there (app/(auth)/(tabs)/_layout.tsx).
 */
export const macSidebarItems = (
  settings: Partial<
    Pick<
      Settings,
      "streamyStatsServerUrl" | "hideWatchlistsTab" | "showCustomMenuLinks"
    >
  > | null,
): MacSidebarItem[] => [
  tab("(home)", "tabs.home", "home"),
  tab("(search)", "tabs.search", "search"),
  tab("(favorites)", "tabs.favorites", "heart"),
  ...(settings?.streamyStatsServerUrl && !settings.hideWatchlistsTab
    ? [tab("(watchlists)", "watchlists.title", "list")]
    : []),
  tab("(libraries)", "tabs.library", "albums"),
  ...(settings?.showCustomMenuLinks
    ? [tab("(custom-links)", "tabs.custom_links", "link")]
    : []),
];
