import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/common/Text";
import { Loader } from "@/components/Loader";
import { useMultiviewTileStream } from "@/hooks/useMultiviewTileStream";
import { MpvPlayerView, type MpvPlayerViewRef } from "@/modules";
import type { TileFrame } from "@/utils/multiview/multiview";

interface Props {
  itemId: string;
  frame: TileFrame;
  muted: boolean;
  /** Draws the outline that marks the tile being heard. */
  heard: boolean;
  /** When false the name and speaker badge are hidden with the toolbar. */
  showLabel: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export function MultiviewTile({
  itemId,
  frame,
  muted,
  heard,
  showLabel,
  onPress,
  onLongPress,
}: Props) {
  const { t } = useTranslation();
  const playerRef = useRef<MpvPlayerViewRef>(null);
  const { state, onPosition } = useMultiviewTileStream(itemId);
  // Read from onLoad, which fires once the player can take a mute: a mute
  // sent before the file loads has nothing to apply to.
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  useEffect(() => {
    void playerRef.current?.setMute(muted);
  }, [muted]);

  // Free the decoder as soon as the tile goes, not when the view is collected:
  // with several players up, the next tile may need that memory right away.
  useEffect(() => {
    const player = playerRef;
    return () => {
      void player.current?.destroy();
    };
  }, []);

  return (
    <View
      style={[
        styles.tile,
        {
          left: frame.left,
          top: frame.top,
          width: frame.width,
          height: frame.height,
        },
        heard && styles.heard,
      ]}
    >
      {state.status === "ready" && (
        <MpvPlayerView
          ref={playerRef}
          source={state.source}
          style={StyleSheet.absoluteFill}
          onLoad={() => void playerRef.current?.setMute(mutedRef.current)}
          onProgress={(e) => onPosition(e.nativeEvent.position)}
        />
      )}
      {state.status === "loading" && (
        <View style={styles.center}>
          <Loader />
        </View>
      )}
      {state.status === "error" && (
        <View style={styles.center}>
          <Text className='text-neutral-400 text-center px-2'>
            {t("multiview.tile_failed")}
          </Text>
        </View>
      )}
      {/* Above the native view, which would otherwise take the touches. */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole='button'
        accessibilityLabel={
          state.status === "ready" ? (state.item.Name ?? undefined) : undefined
        }
        accessibilityHint={t("multiview.tile_hint")}
      >
        {showLabel && state.status === "ready" && (
          <View style={styles.label}>
            {!muted && (
              <Ionicons
                name='volume-high'
                size={14}
                color='white'
                style={{ marginRight: 4 }}
              />
            )}
            <Text className='text-xs text-white' numberOfLines={1}>
              {state.item.Name}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: "absolute",
    backgroundColor: "black",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  heard: {
    borderColor: "#9334E9",
  },
  center: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    position: "absolute",
    left: 6,
    bottom: 6,
    maxWidth: "90%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
