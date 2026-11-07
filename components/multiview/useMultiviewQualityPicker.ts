import { useActionSheet } from "@expo/react-native-action-sheet";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { BITRATES } from "@/components/BitrateSelector";
import { useTVOptionModal } from "@/hooks/useTVOptionModal";
import { useSettings } from "@/utils/atoms/settings";
import { DEFAULT_MULTIVIEW_BITRATE } from "@/utils/multiview/tileBitrate";

/**
 * The multiview quality, changed from inside multiview. It is the same setting
 * as Settings' "Multiview quality", so a pick here shows there and the other
 * way round. Every tile reopens its stream at the new cap (the tile stream
 * depends on it), so a live channel reconnects for a moment.
 *
 * The picker is the platform's own: the TV option sheet on Apple TV and
 * Android TV, an action sheet on the iPhone, iPad and Mac.
 */
export const useMultiviewQualityPicker = () => {
  const { t } = useTranslation();
  const { settings, updateSettings, pluginSettings } = useSettings();
  const { showActionSheetWithOptions } = useActionSheet();
  const { showOptions } = useTVOptionModal();

  const current = settings?.multiviewMaxBitrate ?? DEFAULT_MULTIVIEW_BITRATE;
  const locked = pluginSettings?.multiviewMaxBitrate?.locked === true;
  const title = t("home.settings.other.multiview_quality");

  const choose = useCallback(
    (key: string) => {
      const bitrate = BITRATES.find((b) => b.key === key);
      if (bitrate && bitrate.key !== current.key) {
        updateSettings({ multiviewMaxBitrate: bitrate });
      }
    },
    [current.key, updateSettings],
  );

  const open = useCallback(() => {
    if (locked) return;
    if (Platform.isTV) {
      showOptions({
        title,
        options: BITRATES.map((b) => ({
          label: b.key,
          value: b.key,
          selected: b.key === current.key,
        })),
        onSelect: choose,
      });
      return;
    }
    const cancel = BITRATES.length;
    showActionSheetWithOptions(
      {
        title,
        message: t("multiview.quality_message", { quality: current.key }),
        options: [...BITRATES.map((b) => b.key), t("common.cancel")],
        cancelButtonIndex: cancel,
      },
      (index) => {
        if (index === undefined || index === cancel) return;
        choose(BITRATES[index].key);
      },
    );
  }, [
    locked,
    showOptions,
    title,
    current.key,
    choose,
    showActionSheetWithOptions,
    t,
  ]);

  return { quality: current.key, locked, open };
};
