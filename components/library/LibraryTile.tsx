import { Ionicons } from "@expo/vector-icons";
import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { LinearGradient } from "expo-linear-gradient";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "@/components/common/ServerImage";
import { Text } from "@/components/common/Text";
import { TouchableItemRouter } from "@/components/common/TouchableItemRouter";
import { LibraryTileColors } from "@/constants/Colors";
import { apiAtom } from "@/utils/atoms/api";
import { useSettings } from "@/utils/atoms/settings";
import { getPrimaryImageUrl } from "@/utils/jellyfin/image/getPrimaryImageUrl";
import { libraryIcons, useLibraryStats } from "./LibraryItemCard";

/**
 * A library on a wide window: its cover art at 16:9 with the item count in a
 * badge, or, with no art, its icon and name over a gradient. Lifts slightly
 * under the pointer on the Mac.
 */
export const LibraryTile = ({
  library,
  width,
}: {
  library: BaseItemDto;
  width: number;
}) => {
  const api = useAtomValue(apiAtom);
  const { settings } = useSettings();
  const { itemsCount, itemTypeName } = useLibraryStats(library);
  const [hovered, setHovered] = useState(false);
  // A library with no art of its own answers 404 (Live TV often does).
  const [imageFailed, setImageFailed] = useState(false);

  const url = useMemo(
    () =>
      getPrimaryImageUrl({ api, item: library, width: Math.round(width * 2) }),
    [api, library, width],
  );

  const hasArt = !!url && !imageFailed;
  const showCount = !!settings?.libraryOptions?.showStats && itemsCount != null;
  const icon = libraryIcons[library.CollectionType!] || "folder";

  return (
    <TouchableItemRouter
      item={library}
      testID={`library-tile-${library.Id}`}
      accessibilityLabel={library.Name ?? undefined}
    >
      <View
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        style={[
          styles.tile,
          { width, transform: [{ scale: hovered ? 1.03 : 1 }] },
          hovered && styles.tileHovered,
        ]}
      >
        {hasArt ? (
          <>
            <Image
              testID='library-tile-art'
              source={{ uri: url }}
              style={StyleSheet.absoluteFill}
              contentFit='cover'
              cachePolicy='memory-disk'
              onError={() => setImageFailed(true)}
            />
            {/* Jellyfin paints the library's name into its art, so the tile
                only adds the count. */}
            {showCount && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {itemsCount} {itemTypeName}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
              <Ionicons
                name={icon}
                size={44}
                color={LibraryTileColors.placeholderIcon}
              />
            </View>
            <LinearGradient
              colors={[LibraryTileColors.clear, LibraryTileColors.scrim]}
              locations={[0.35, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.caption}>
              <Ionicons name={icon} size={18} color={LibraryTileColors.text} />
              <View style={styles.captionText}>
                <Text numberOfLines={1} style={styles.title}>
                  {library.Name}
                </Text>
                {showCount && (
                  <Text numberOfLines={1} style={styles.count}>
                    {itemsCount} {itemTypeName}
                  </Text>
                )}
              </View>
            </View>
          </>
        )}
      </View>
    </TouchableItemRouter>
  );
};

const styles = StyleSheet.create({
  tile: {
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: LibraryTileColors.background,
    borderWidth: 1,
    borderColor: LibraryTileColors.border,
  },
  tileHovered: { borderColor: LibraryTileColors.borderHovered },
  placeholder: { alignItems: "center", justifyContent: "center" },
  caption: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  captionText: { flex: 1 },
  title: { color: LibraryTileColors.text, fontSize: 20, fontWeight: "700" },
  count: { color: LibraryTileColors.subtext, fontSize: 13, marginTop: 2 },
  badge: {
    position: "absolute",
    left: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: LibraryTileColors.badge,
  },
  badgeText: { color: LibraryTileColors.text, fontSize: 13, fontWeight: "600" },
});
