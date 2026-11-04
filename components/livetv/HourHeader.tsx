import { StyleSheet, View } from "react-native";
import { GuideColors } from "@/constants/Colors";
import {
  LIVE_TV_GUIDE_HEADER_HEIGHT,
  LIVE_TV_GUIDE_HOUR_WIDTH,
} from "@/constants/LiveTv";
import { type GuideWindow, guideHours } from "@/utils/livetv/guideLayout";
import { Text } from "../common/Text";

/**
 * The guide's hour labels, from the same window the rows are laid out in, so
 * a label sits right over the programs that start at it.
 */
export const HourHeader = ({ window }: { window: GuideWindow }) => (
  <View style={styles.header}>
    {guideHours(window).map((hour) => (
      <View key={hour.getTime()} style={styles.cell}>
        <Text style={styles.label}>
          {hour.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    height: LIVE_TV_GUIDE_HEADER_HEIGHT,
    backgroundColor: GuideColors.header,
  },
  cell: {
    width: LIVE_TV_GUIDE_HOUR_WIDTH,
    justifyContent: "center",
    paddingLeft: 8,
  },
  label: { fontSize: 11, color: GuideColors.hourLabel },
});
