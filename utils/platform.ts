import { DeviceType, deviceType } from "expo-device";
import { Platform } from "react-native";

/**
 * Whether this is SuperFin running on a Mac. It ships there as the iPad app
 * on Apple silicon ("Designed for iPad"): MPVKit has no Mac Catalyst slice,
 * so there is no Catalyst build. Platform.OS is "ios" either way, and
 * nothing in React Native tells that apart from an iPad; expo-device reports
 * a desktop for both an iPad app on a Mac and a Catalyst one.
 */
export const isMac = (
  platform: Pick<typeof Platform, "OS"> = Platform,
  type: DeviceType | null = deviceType,
) => platform.OS === "ios" && type === DeviceType.DESKTOP;

/**
 * Whether the tabs use Apple's sidebar-adaptable style: the floating tab bar
 * with a toggle to a sidebar. On an iPad only. The Mac draws its own sidebar
 * (components/MacSidebar.tsx): in a Mac window Apple's one skipped the layout
 * after the toggle, leaving an empty panel or a tab bar stuck at the edge.
 */
export const usesNativeSidebar = (
  platform: Pick<typeof Platform, "OS"> & {
    isPad?: boolean;
    isTV?: boolean;
  } = Platform,
  type: DeviceType | null = deviceType,
) =>
  platform.OS === "ios" &&
  !platform.isTV &&
  platform.isPad === true &&
  !isMac(platform, type);
