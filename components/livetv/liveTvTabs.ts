import type { MaterialTopTabNavigationOptions } from "expo-router/js-top-tabs";
import { LiveTvTabBarColors } from "@/constants/Colors";

/**
 * The phone's Live TV tabs, in order, with the key of each label. Recordings
 * has a route but no feature yet ("coming soon"), so it stays out of the bar
 * until it does; flip RECORDINGS_TAB_ENABLED to bring it back.
 */
export const RECORDINGS_TAB_ENABLED = false;

export const LIVE_TV_TABS = [
  { name: "programs", label: "live_tv.tabs.programs" },
  { name: "guide", label: "live_tv.tabs.guide" },
  { name: "channels", label: "live_tv.tabs.channels" },
  { name: "recordings", label: "live_tv.tabs.recordings" },
] as const;

export const visibleLiveTvTabs = (recordings = RECORDINGS_TAB_ENABLED) =>
  LIVE_TV_TABS.filter((tab) => recordings || tab.name !== "recordings");

/**
 * A glass segmented control in place of the Material bar: the tabs share the
 * width, and the selected one sits on a lighter pill rather than an underline.
 */
export const liveTvTabBarOptions: MaterialTopTabNavigationOptions = {
  tabBarBounces: false,
  tabBarScrollEnabled: false,
  tabBarStyle: {
    backgroundColor: LiveTvTabBarColors.track,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 999,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 0.5,
    borderColor: LiveTvTabBarColors.edge,
  },
  tabBarContentContainerStyle: { minHeight: 36 },
  tabBarItemStyle: { minHeight: 36, paddingVertical: 0 },
  tabBarLabelStyle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "none",
  },
  tabBarActiveTintColor: LiveTvTabBarColors.activeLabel,
  tabBarInactiveTintColor: LiveTvTabBarColors.inactiveLabel,
  tabBarIndicatorStyle: {
    backgroundColor: LiveTvTabBarColors.pill,
    height: "100%",
    borderRadius: 999,
  },
  tabBarIndicatorContainerStyle: { padding: 3 },
  tabBarPressColor: "transparent",
  animationEnabled: true,
  lazy: true,
  swipeEnabled: true,
};
