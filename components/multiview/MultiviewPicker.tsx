import { Ionicons } from "@expo/vector-icons";
import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { getLibraryApi, getLiveTvApi } from "@jellyfin/sdk/lib/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ItemImage } from "@/components/common/ItemImage";
import { Text } from "@/components/common/Text";
import { apiAtom, userAtom } from "@/utils/atoms/api";

interface Props {
  visible: boolean;
  /** Item ids already on screen; shown but not pickable. */
  onScreen: string[];
  onPick: (itemId: string) => void;
  onClose: () => void;
}

/**
 * What can go in a tile: the live channels, with what is on now, and what the
 * user is part way through. Tuner limits are the server's to enforce; a third
 * live channel on a dual tuner fails in its tile with the server's answer.
 */
export function MultiviewPicker({ visible, onScreen, onPick, onClose }: Props) {
  const { t } = useTranslation();
  const api = useAtomValue(apiAtom);
  const user = useAtomValue(userAtom);
  const insets = useSafeAreaInsets();

  const channels = useQuery({
    queryKey: ["multiview", "channels", user?.Id],
    enabled: visible && !!api && !!user?.Id,
    queryFn: async () => {
      const res = await getLiveTvApi(api!).getLiveTvChannels({
        userId: user?.Id,
        limit: 500,
        enableFavoriteSorting: true,
        addCurrentProgram: true,
        enableImageTypes: ["Primary"],
      });
      return res.data.Items ?? [];
    },
  });

  const resume = useQuery({
    queryKey: ["multiview", "resume", user?.Id],
    enabled: visible && !!api && !!user?.Id,
    queryFn: async () => {
      const res = await getLibraryApi(api!).getResumeItems({
        userId: user!.Id!,
        includeItemTypes: ["Movie", "Episode"],
        enableImageTypes: ["Primary", "Thumb"],
        limit: 20,
      });
      return res.data.Items ?? [];
    },
  });

  const row = (item: BaseItemDto, subtitle?: string | null) => {
    const added = !!item.Id && onScreen.includes(item.Id);
    return (
      <Pressable
        key={item.Id}
        disabled={added || !item.Id}
        onPress={() => item.Id && onPick(item.Id)}
        className='flex flex-row items-center px-4 py-2'
        style={{ opacity: added ? 0.4 : 1 }}
        accessibilityRole='button'
      >
        <View className='mr-3 rounded-lg overflow-hidden'>
          <ItemImage
            item={item}
            style={{ width: 48, height: 48, borderRadius: 8 }}
          />
        </View>
        <View className='flex-1'>
          <Text className='font-bold' numberOfLines={1}>
            {item.Type === "Episode" && item.SeriesName
              ? `${item.SeriesName}: ${item.Name}`
              : item.Name}
          </Text>
          {!!subtitle && (
            <Text className='text-neutral-400 text-xs' numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {added ? (
          <Text className='text-neutral-400 text-xs'>
            {t("multiview.on_screen")}
          </Text>
        ) : (
          <Ionicons name='add-circle-outline' size={22} color='white' />
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent
      supportedOrientations={["landscape", "portrait"]}
      onRequestClose={onClose}
    >
      <View className='flex-1 flex-row'>
        <Pressable
          className='flex-1'
          onPress={onClose}
          accessibilityLabel={t("multiview.close_picker")}
        />
        <View
          className='bg-neutral-900'
          style={{
            width: 380,
            maxWidth: "70%",
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom,
            paddingRight: insets.right,
          }}
        >
          <View className='flex flex-row items-center justify-between px-4 mb-2'>
            <Text className='text-lg font-bold'>{t("multiview.add_tile")}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole='button'
              accessibilityLabel={t("multiview.close_picker")}
            >
              <Ionicons name='close' size={24} color='white' />
            </Pressable>
          </View>
          <ScrollView>
            <Text className='px-4 py-2 text-neutral-400 uppercase text-xs'>
              {t("multiview.live_channels")}
            </Text>
            {channels.data?.length === 0 && (
              <Text className='px-4 text-neutral-500'>
                {t("live_tv.no_channels")}
              </Text>
            )}
            {channels.data?.map((c) => row(c, c.CurrentProgram?.Name))}
            <Text className='px-4 pt-4 pb-2 text-neutral-400 uppercase text-xs'>
              {t("multiview.continue_watching")}
            </Text>
            {resume.data?.map((i) => row(i))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
