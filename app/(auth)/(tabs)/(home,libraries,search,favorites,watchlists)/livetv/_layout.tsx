import { Slot, Stack, withLayoutContext } from "expo-router";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from "expo-router/js-top-tabs";
import type {
  ParamListBase,
  TabNavigationState,
} from "expo-router/react-navigation";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import {
  LIVE_TV_TABS,
  liveTvTabBarOptions,
  visibleLiveTvTabs,
} from "@/components/livetv/liveTvTabs";

const { Navigator } = createMaterialTopTabNavigator();

export const Tab = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const Layout = () => {
  const { t } = useTranslation();
  const visible = new Set<string>(visibleLiveTvTabs().map((tab) => tab.name));

  // On TV, skip the Material Top Tab Navigator and render children directly
  // The TV version handles its own tab navigation internally
  if (Platform.isTV) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <Slot />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t("live_tv.title") }} />
      <Tab
        initialRouteName='programs'
        keyboardDismissMode='none'
        screenOptions={liveTvTabBarOptions}
      >
        {LIVE_TV_TABS.map((tab) =>
          visible.has(tab.name) ? (
            <Tab.Screen
              key={tab.name}
              name={tab.name}
              options={{ title: t(tab.label) }}
            />
          ) : (
            // A route with no tab: Protected keeps it off the bar and out of
            // the swipe order without deleting its file.
            <Tab.Protected key={tab.name} guard={false}>
              <Tab.Screen name={tab.name} />
            </Tab.Protected>
          ),
        )}
      </Tab>
    </>
  );
};

export default Layout;
