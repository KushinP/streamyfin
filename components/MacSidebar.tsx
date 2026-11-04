import { Ionicons } from "@expo/vector-icons";
import { useSegments } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/common/Text";
import { Colors, MacSidebarColors } from "@/constants/Colors";
import { MAC_SIDEBAR_WIDTH } from "@/constants/Mac";
import useRouter from "@/hooks/useAppRouter";
import { useSettings } from "@/utils/atoms/settings";
import { eventBus } from "@/utils/eventBus";
import { type MacSidebarItem, macSidebarItems } from "@/utils/macSidebar";

const SidebarRow = ({
  testID,
  icon,
  title,
  active,
  onPress,
}: {
  testID: string;
  icon: MacSidebarItem["icon"];
  title: string;
  active: boolean;
  onPress: () => void;
}) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      testID={testID}
      accessibilityRole='button'
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.row,
        active
          ? styles.rowActive
          : hovered
            ? { backgroundColor: MacSidebarColors.itemHovered }
            : null,
      ]}
    >
      <Ionicons
        name={active ? icon : (`${icon}-outline` as MacSidebarItem["icon"])}
        size={18}
        color={active ? Colors.primary : MacSidebarColors.textMuted}
      />
      <Text
        style={[
          styles.rowText,
          {
            color: active ? MacSidebarColors.text : MacSidebarColors.textMuted,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

/**
 * The Mac's sidebar, always open beside the tabs: the native tab bar is
 * hidden there. Apple's sidebar-adaptable style did not lay out after its
 * toggle in a Mac window (see usesNativeSidebar), so this one is drawn by the
 * app. Settings sits at the foot, as in a Mac app's sidebar.
 */
export const MacSidebar = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const segments = useSegments() as string[];
  const { settings } = useSettings();
  const insets = useSafeAreaInsets();
  const current = segments[2];

  const open = (item: MacSidebarItem) => {
    if (item.segment === current) {
      // The tab bar's own tabs do this on a second press.
      if (item.segment === "(home)") eventBus.emit("scrollToTop");
      if (item.segment === "(search)") eventBus.emit("searchTabPressed");
      return;
    }
    router.navigate(item.href as never);
  };

  return (
    <View
      testID='mac-sidebar'
      style={[styles.sidebar, { paddingTop: insets.top + 12 }]}
    >
      <View style={styles.items}>
        {macSidebarItems(settings).map((item) => (
          <SidebarRow
            key={item.segment}
            testID={`mac-sidebar-${item.segment}`}
            icon={item.icon}
            title={t(item.titleKey)}
            active={item.segment === current}
            onPress={() => open(item)}
          />
        ))}
      </View>
      <SidebarRow
        testID='mac-sidebar-settings'
        icon='settings'
        title={t("tabs.settings")}
        active={false}
        onPress={() => router.push("/(auth)/settings" as never)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: MAC_SIDEBAR_WIDTH,
    paddingHorizontal: 10,
    paddingBottom: 16,
    backgroundColor: MacSidebarColors.background,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: MacSidebarColors.border,
  },
  items: { flex: 1, gap: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rowActive: { backgroundColor: MacSidebarColors.itemActive },
  rowText: { fontSize: 15, fontWeight: "500" },
});
