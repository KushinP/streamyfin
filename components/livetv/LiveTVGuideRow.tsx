import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client";
import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { GuideColors } from "@/constants/Colors";
import {
  LIVE_TV_GUIDE_HOUR_WIDTH,
  LIVE_TV_GUIDE_ROW_HEIGHT,
  LIVE_TV_GUIDE_STICKY_TITLE_MIN_WIDTH,
} from "@/constants/LiveTv";
import {
  type GuideWindow,
  type ProgramBlock,
  programBlocks,
} from "@/utils/livetv/guideLayout";
import { Text } from "../common/Text";
import { TouchableItemRouter } from "../common/TouchableItemRouter";

const clock = (date: string | null | undefined) =>
  date
    ? new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

/** Room kept for the title at the right end of a long block. */
const TITLE_ROOM = 160;

/**
 * A long program's title slides along with the guide's scroll, so it stays
 * readable until the block itself leaves the screen. It runs on the UI
 * thread: the scroll offset is a shared value, and the rows do not re-render
 * as the guide scrolls.
 */
const StickyTitle = ({
  block,
  scrollX,
  children,
}: {
  block: ProgramBlock;
  scrollX: SharedValue<number>;
  children: React.ReactNode;
}) => {
  const style = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: Math.min(
          Math.max(scrollX.value - block.left, 0),
          Math.max(block.width - TITLE_ROOM, 0),
        ),
      },
    ],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
};

interface Props {
  channel: BaseItemDto;
  programs?: BaseItemDto[] | null;
  window: GuideWindow;
  /** The guide's clock, to tell the program on now. */
  now: number;
  scrollX: SharedValue<number>;
}

/** One channel's programs on the phone's guide, placed by when they air. */
export const LiveTVGuideRow = memo(
  ({ channel, programs, window, now, scrollX }: Props) => {
    const blocks = useMemo(
      () =>
        programBlocks(programs, channel.Id, window, LIVE_TV_GUIDE_HOUR_WIDTH),
      [programs, channel.Id, window],
    );

    return (
      <View style={styles.row} testID={`guide-row-${channel.Id}`}>
        {blocks.map((block) => {
          const { program } = block;
          const live =
            !!program.StartDate &&
            !!program.EndDate &&
            Date.parse(program.StartDate) <= now &&
            now < Date.parse(program.EndDate);
          const title = (
            <View style={styles.label}>
              <Text numberOfLines={1} style={styles.title}>
                {program.Name}
              </Text>
              <Text numberOfLines={1} style={styles.time}>
                {clock(program.StartDate)}
              </Text>
            </View>
          );
          return (
            <TouchableItemRouter
              item={program}
              key={program.Id}
              testID={`guide-program-${program.Id}`}
              style={[
                styles.cell,
                live && styles.live,
                { left: block.left, width: block.width },
              ]}
            >
              {block.width >= LIVE_TV_GUIDE_STICKY_TITLE_MIN_WIDTH ? (
                <StickyTitle block={block} scrollX={scrollX}>
                  {title}
                </StickyTitle>
              ) : (
                title
              )}
            </TouchableItemRouter>
          );
        })}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  row: { height: LIVE_TV_GUIDE_ROW_HEIGHT },
  cell: {
    position: "absolute",
    top: 2,
    bottom: 2,
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GuideColors.cellEdge,
  },
  live: {
    backgroundColor: GuideColors.liveCell,
    borderColor: GuideColors.liveEdge,
  },
  label: { paddingHorizontal: 10, maxWidth: TITLE_ROOM + 40 },
  title: { fontSize: 12, fontWeight: "600", color: GuideColors.title },
  time: { fontSize: 11, color: GuideColors.time, marginTop: 2 },
});
