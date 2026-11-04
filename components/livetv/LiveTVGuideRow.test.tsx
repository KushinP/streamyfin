import { render, screen } from "@testing-library/react-native";
import { makeSharedValue } from "@/test-utils/reanimated";
import { LiveTVGuideRow } from "./LiveTVGuideRow";

jest.mock(
  "react-native-reanimated",
  () => jest.requireActual("@/test-utils/reanimated").reanimatedModule,
);
// The router needs navigation; a program here is only where it is drawn.
jest.mock("@/components/common/TouchableItemRouter", () => {
  const { View } = jest.requireActual("react-native");
  return {
    TouchableItemRouter: ({
      item: _item,
      ...props
    }: object & { item: unknown }) => <View {...props} />,
  };
});

const at = (hh: number, mm = 0) => new Date(2026, 10, 3, hh, mm).getTime();
const iso = (hh: number, mm = 0) => new Date(at(hh, mm)).toISOString();
const WINDOW = { start: at(20), end: at(24) };

describe("LiveTVGuideRow", () => {
  // Reported: a channel's first program was drawn at the left edge whatever
  // time it started, away from its hour label.
  test("draws a program under the hour it starts at", async () => {
    await render(
      <LiveTVGuideRow
        channel={{ Id: "a" }}
        programs={[
          {
            Id: "late",
            ChannelId: "a",
            Name: "Late Show",
            StartDate: iso(21, 30),
            EndDate: iso(22, 30),
          },
        ]}
        window={WINDOW}
        now={at(20, 15)}
        scrollX={makeSharedValue(0) as never}
      />,
    );

    expect(screen.getByTestId("guide-program-late")).toHaveStyle({
      left: 300,
      width: 200,
    });
    expect(screen.getByText("Late Show")).toBeTruthy();
  });

  test("marks the program on now", async () => {
    await render(
      <LiveTVGuideRow
        channel={{ Id: "a" }}
        programs={[
          {
            Id: "now",
            ChannelId: "a",
            Name: "Bulletin",
            StartDate: iso(20),
            EndDate: iso(21),
          },
          {
            Id: "later",
            ChannelId: "a",
            Name: "Film",
            StartDate: iso(21),
            EndDate: iso(23),
          },
        ]}
        window={WINDOW}
        now={at(20, 15)}
        scrollX={makeSharedValue(0) as never}
      />,
    );

    const { GuideColors } = jest.requireActual("@/constants/Colors");
    expect(screen.getByTestId("guide-program-now")).toHaveStyle({
      backgroundColor: GuideColors.liveCell,
    });
    expect(screen.getByTestId("guide-program-later")).not.toHaveStyle({
      backgroundColor: GuideColors.liveCell,
    });
  });
});
