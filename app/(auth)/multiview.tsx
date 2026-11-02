// Logic lives in utils/multiview/multiview.ts and hooks/useMultiviewTileStream.ts,
// covered by their specs next to them.
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Ionicons } from "@expo/vector-icons";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, useWindowDimensions, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/common/Text";
import { MultiviewPicker } from "@/components/multiview/MultiviewPicker";
import { MultiviewTile } from "@/components/multiview/MultiviewTile";
import {
  MULTIVIEW_MAX_TILES,
  MULTIVIEW_TOOLBAR_HIDE_DELAY,
} from "@/constants/Multiview";
import useRouter from "@/hooks/useAppRouter";
import { useOrientation } from "@/hooks/useOrientation";
import { OrientationLock } from "@/packages/expo-screen-orientation";
import {
  addTile,
  emptyMultiview,
  isTileMuted,
  type MultiviewState,
  promoteTile,
  removeTile,
  selectAudio,
  tileFrames,
  toggleAllAudio,
  toggleLayout,
} from "@/utils/multiview/multiview";

const KEEP_AWAKE_TAG = "multiview";

export default function MultiviewScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { lockOrientation, unlockOrientation } = useOrientation();
  const { showActionSheetWithOptions } = useActionSheet();
  const { itemIds } = useLocalSearchParams<{ itemIds?: string }>();

  const nextKey = useRef(0);
  const newKey = () => `tile-${nextKey.current++}`;
  const [state, setState] = useState<MultiviewState>(() =>
    (itemIds ?? "")
      .split(",")
      .filter(Boolean)
      .reduce((s, id) => addTile(s, id, newKey()), emptyMultiview),
  );
  const [pickerOpen, setPickerOpen] = useState(state.tiles.length === 0);
  const [toolbarVisible, setToolbarVisible] = useState(true);

  useEffect(() => {
    void lockOrientation(OrientationLock.LANDSCAPE);
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    return () => {
      void unlockOrientation();
      deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [lockOrientation, unlockOrientation]);

  // The toolbar fades out so it does not sit over the games; any touch brings
  // it back. It stays while the picker is open.
  useEffect(() => {
    if (!toolbarVisible || pickerOpen || state.tiles.length === 0) return;
    const timer = setTimeout(
      () => setToolbarVisible(false),
      MULTIVIEW_TOOLBAR_HIDE_DELAY,
    );
    return () => clearTimeout(timer);
  }, [toolbarVisible, pickerOpen, state]);

  const onTilePress = useCallback((key: string) => {
    setState((s) => (s.audio === "all" ? s : selectAudio(s, key)));
    setToolbarVisible(true);
  }, []);

  const onTileLongPress = useCallback(
    (key: string) =>
      showActionSheetWithOptions(
        {
          options: [
            t("multiview.make_main"),
            t("multiview.remove_tile"),
            t("common.cancel"),
          ],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) setState((s) => promoteTile(s, key));
          if (index === 1) setState((s) => removeTile(s, key));
        },
      ),
    [showActionSheetWithOptions, t],
  );

  const area = {
    left: insets.left,
    top: insets.top,
    width: width - insets.left - insets.right,
    height: height - insets.top - insets.bottom,
  };
  const frames = tileFrames(
    state.layout,
    state.tiles.length,
    area.width,
    area.height,
  );
  const full = state.tiles.length >= MULTIVIEW_MAX_TILES;

  return (
    <View className='flex-1 bg-black'>
      <SystemBars hidden />
      <View
        style={{
          position: "absolute",
          left: area.left,
          top: area.top,
          width: area.width,
          height: area.height,
        }}
      >
        {state.tiles.map((tile, i) =>
          frames[i] ? (
            <MultiviewTile
              key={tile.key}
              itemId={tile.itemId}
              frame={frames[i]}
              muted={isTileMuted(state, tile.key)}
              heard={state.audio === tile.key && state.tiles.length > 1}
              showLabel={toolbarVisible}
              onPress={() => onTilePress(tile.key)}
              onLongPress={() => onTileLongPress(tile.key)}
            />
          ) : null,
        )}
      </View>

      {state.tiles.length === 0 && !pickerOpen && (
        <View className='flex-1 items-center justify-center'>
          <Text className='text-neutral-400 mb-4'>{t("multiview.empty")}</Text>
        </View>
      )}

      {(toolbarVisible || state.tiles.length === 0) && (
        <View
          className='flex flex-row items-center'
          style={{
            position: "absolute",
            top: insets.top + 8,
            right: insets.right + 8,
            gap: 8,
          }}
        >
          <ToolbarButton
            icon='add'
            label={t("multiview.add_tile")}
            disabled={full}
            onPress={() => setPickerOpen(true)}
          />
          <ToolbarButton
            icon={state.layout === "grid" ? "albums-outline" : "grid-outline"}
            label={t("multiview.change_layout")}
            disabled={state.tiles.length < 2}
            onPress={() => setState(toggleLayout)}
          />
          <ToolbarButton
            icon={state.audio === "all" ? "volume-high" : "volume-medium"}
            label={
              state.audio === "all"
                ? t("multiview.audio_one")
                : t("multiview.audio_all")
            }
            disabled={state.tiles.length < 2}
            onPress={() => setState(toggleAllAudio)}
          />
          <ToolbarButton
            icon='close'
            label={t("multiview.close")}
            onPress={() => router.back()}
          />
        </View>
      )}

      <MultiviewPicker
        visible={pickerOpen}
        onScreen={state.tiles.map((tile) => tile.itemId)}
        onPick={(itemId) => {
          setState((s) => addTile(s, itemId, newKey()));
          setPickerOpen(false);
          setToolbarVisible(true);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

function ToolbarButton({
  icon,
  label,
  disabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole='button'
      accessibilityLabel={label}
      className='items-center justify-center rounded-full'
      style={{
        width: 40,
        height: 40,
        backgroundColor: "rgba(38,38,38,0.8)",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Ionicons name={icon} size={22} color='white' />
    </Pressable>
  );
}
