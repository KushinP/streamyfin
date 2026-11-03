import { act, render, screen } from "@testing-library/react-native";

type ProgressHandler = (e: { nativeEvent: { position: number } }) => void;
let mockOnProgress: ProgressHandler | undefined;

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("@/hooks/useMultiviewTileStream", () => ({
  useMultiviewTileStream: () => ({
    state: {
      status: "ready",
      item: { Id: "chan-1", Name: "WBZ-DT" },
      source: { url: "https://jf.example.com/stream" },
    },
    onPosition: jest.fn(),
  }),
}));
jest.mock("@/modules", () => {
  const { forwardRef } = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return {
    MpvPlayerView: forwardRef(
      (props: { onProgress?: ProgressHandler }, _ref: unknown) => {
        mockOnProgress = props.onProgress;
        return <View />;
      },
    ),
  };
});

import { MultiviewTile } from "./MultiviewTile";

const renderTile = () =>
  render(
    <MultiviewTile
      itemId='chan-1'
      frame={{ left: 0, top: 0, width: 320, height: 180 }}
      muted
      heard={false}
      showLabel
      onPress={jest.fn()}
      onLongPress={jest.fn()}
    />,
  );

const tick = async (position: number) => {
  await act(async () => mockOnProgress?.({ nativeEvent: { position } }));
};

beforeEach(() => {
  mockOnProgress = undefined;
});

test("keeps the spinner up while a live channel tunes, before any video", async () => {
  // The stream URL comes back long before a live channel's first frame: the
  // server still has to tune and start a transcode. A tile with no spinner in
  // that gap is just black.
  await renderTile();
  expect(screen.getByLabelText("multiview.tile_starting")).toBeTruthy();

  await tick(0);
  expect(screen.getByLabelText("multiview.tile_starting")).toBeTruthy();
});

test("drops the spinner once playback moves", async () => {
  await renderTile();
  await tick(0);
  await tick(0.5);
  expect(screen.queryByLabelText("multiview.tile_starting")).toBeNull();
});
