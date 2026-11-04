import { Ionicons } from "@expo/vector-icons";
import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { ItemImage } from "@/components/common/ItemImage";
import { Text } from "@/components/common/Text";
import { ChannelRowColors, Colors } from "@/constants/Colors";
import { channelNumber, programProgress } from "@/utils/livetv/nowNext";

const clock = (date: string | null | undefined) =>
  date
    ? new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

interface Props {
  channel: BaseItemDto;
  next?: BaseItemDto;
  now: number;
  onPress: (channel: BaseItemDto) => void;
}

/**
 * A channel in the phone's Channels list: logo, number and name, what is on
 * now with how far it has run, and what comes next. Tapping it plays it.
 */
export const ChannelNowNextRow = memo(
  ({ channel, next, now, onPress }: Props) => {
    const { t } = useTranslation();
    const current = channel.CurrentProgram;
    const progress = programProgress(current, now);
    const number = channelNumber(channel);

    return (
      <Pressable
        onPress={() => onPress(channel)}
        accessibilityRole='button'
        accessibilityLabel={[channel.Name, current?.Name]
          .filter(Boolean)
          .join(", ")}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.logo}>
          <ItemImage
            item={channel}
            style={{ width: 40, height: 40 }}
            contentFit='contain'
          />
        </View>
        <View style={styles.body}>
          <View style={styles.titleLine}>
            <Text className='font-semibold' numberOfLines={1}>
              {channel.Name}
            </Text>
            {number && <Text style={styles.number}>{number}</Text>}
          </View>
          {current?.Name ? (
            <Text style={styles.now} numberOfLines={1}>
              {current.Name}
            </Text>
          ) : null}
          {progress !== null && (
            <View style={styles.track} testID='channel-progress'>
              <LinearGradient
                colors={[Colors.primary, ChannelRowColors.progressEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.fill, { width: `${progress * 100}%` }]}
              />
            </View>
          )}
          {next?.Name ? (
            <Text style={styles.next} numberOfLines={1}>
              {t("live_tv.next_at", {
                time: clock(next.StartDate),
                title: next.Name,
              })}
            </Text>
          ) : null}
        </View>
        <Ionicons name='play' size={16} color={ChannelRowColors.glyph} />
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ChannelRowColors.separator,
  },
  pressed: { backgroundColor: ChannelRowColors.pressed },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: ChannelRowColors.tile,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ChannelRowColors.tileEdge,
  },
  body: { flex: 1, minWidth: 0, gap: 2 },
  titleLine: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  number: {
    fontSize: 11,
    color: ChannelRowColors.secondary,
    fontVariant: ["tabular-nums"],
  },
  now: { fontSize: 13, color: ChannelRowColors.primaryText },
  track: {
    height: 3,
    borderRadius: 2,
    marginVertical: 3,
    backgroundColor: ChannelRowColors.track,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 2 },
  next: { fontSize: 11, color: ChannelRowColors.secondary },
});
