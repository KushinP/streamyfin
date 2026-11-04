import { getLibraryApi, getUserViewApi } from "@jellyfin/sdk/lib/utils/api";
import { FlashList } from "@shopify/flash-list";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/common/Text";
import { Loader } from "@/components/Loader";
import { LibraryItemCard } from "@/components/library/LibraryItemCard";
import { LibraryTile } from "@/components/library/LibraryTile";
import { LIBRARY_GRID_GAP } from "@/constants/Libraries";
import { apiAtom, userAtom } from "@/providers/JellyfinProvider";
import { useSettings } from "@/utils/atoms/settings";
import { libraryGridColumns } from "@/utils/libraryGrid";

export const Libraries: React.FC = () => {
  const [api] = useAtom(apiAtom);
  const [user] = useAtom(userAtom);
  const queryClient = useQueryClient();
  const { settings } = useSettings();

  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["user-views", user?.Id],
    queryFn: async () => {
      const response = await getUserViewApi(api!).getUserViews({
        userId: user?.Id,
      });

      return response.data.Items || null;
    },
    staleTime: 60,
    // On logout the cached query refetches with api null and crashes inside
    // the SDK (`configuration` of null).
    enabled: !!api && !!user?.Id,
  });

  const libraries = useMemo(
    () =>
      data
        ?.filter((l) => !settings?.hiddenLibraries?.includes(l.Id!))
        .filter((l) => l.CollectionType !== "books") || [],
    [data, settings?.hiddenLibraries],
  );

  useEffect(() => {
    for (const item of data || []) {
      queryClient.prefetchQuery({
        queryKey: ["library", item.Id],
        queryFn: async () => {
          if (!item.Id || !user?.Id || !api) return null;
          const response = await getLibraryApi(api).getItem({
            itemId: item.Id,
            userId: user?.Id,
          });
          return response.data;
        },
        staleTime: 60 * 1000,
      });
    }
  }, [data, api, queryClient, user?.Id]);

  const insets = useSafeAreaInsets();
  // The page's own width: with the sidebar open it is narrower than the
  // window.
  const [pageWidth, setPageWidth] = useState(0);
  const sidePadding = 17;
  const contentWidth = pageWidth - insets.left - insets.right - sidePadding * 2;
  const columns =
    settings?.libraryOptions?.display === "row"
      ? 0
      : libraryGridColumns(contentWidth);

  if (isLoading)
    return (
      <View className='justify-center items-center h-full'>
        <Loader />
      </View>
    );

  if (!libraries)
    return (
      <View className='h-full w-full flex justify-center items-center'>
        <Text className='text-lg text-neutral-500'>
          {t("library.no_libraries_found")}
        </Text>
      </View>
    );

  if (columns > 0) {
    const tileWidth =
      (contentWidth - LIBRARY_GRID_GAP * (columns - 1)) / columns;
    return (
      <ScrollView
        testID='library-grid'
        onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: LIBRARY_GRID_GAP,
          paddingTop: 8,
          paddingBottom: 150,
          paddingLeft: insets.left + sidePadding,
          paddingRight: insets.right + sidePadding,
        }}
      >
        {libraries.map((library) => (
          <LibraryTile key={library.Id} library={library} width={tileWidth} />
        ))}
      </ScrollView>
    );
  }

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
    >
      <FlashList
        extraData={settings}
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={{
          paddingTop: Platform.OS === "android" ? 17 : 0,
          paddingHorizontal:
            settings?.libraryOptions?.display === "row" ? 0 : 17,
          paddingBottom: 150,
          paddingLeft: insets.left + 17,
          paddingRight: insets.right + 17,
        }}
        data={libraries}
        renderItem={({ item }) => <LibraryItemCard library={item} />}
        keyExtractor={(item) => item.Id || ""}
        ItemSeparatorComponent={() =>
          settings?.libraryOptions?.display === "row" ? (
            <View
              style={{
                height: StyleSheet.hairlineWidth,
              }}
              className='bg-neutral-800 mx-2 my-4'
            />
          ) : (
            <View className='h-4' />
          )
        }
      />
    </View>
  );
};
