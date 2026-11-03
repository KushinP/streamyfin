import { act, fireEvent, render, screen } from "@testing-library/react-native";

type Handler<T> = (e: { nativeEvent: T }) => void;
let mockOnProgress: Handler<{ position: number }> | undefined;
let mockOnState:
  | Handler<{ isPaused?: boolean; isLoading?: boolean }>
  | undefined;
let mockItem: { Id: string; Name: string; Type: string };
const mockPlayer = {
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(() => Promise.resolve()),
  seekBy: jest.fn((_s: number) => Promise.resolve()),
  setMute: jest.fn(() => Promise.resolve()),
  destroy: jest.fn(() => Promise.resolve()),
  // MPV numbers the file's own track first, then the files loaded with it.
  getSubtitleTracks: jest.fn(() =>
    Promise.resolve([
      { id: 1, lang: "eng", codec: "subrip" },
      {
        id: 2,
        lang: "spa",
        external: true,
        externalFilename:
          "https://jf.example.com/Videos/ep-5/Subtitles/4/Stream.srt",
      },
    ]),
  ),
  getCurrentSubtitleTrack: jest.fn(() => Promise.resolve(0)),
  setSubtitleTrack: jest.fn((_id: number) => Promise.resolve()),
  disableSubtitles: jest.fn(() => Promise.resolve()),
};
const mockShowActionSheet = jest.fn();

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) =>
      values ? `${key}:${Object.values(values).join(",")}` : key,
  }),
}));
jest.mock("@expo/react-native-action-sheet", () => ({
  useActionSheet: () => ({ showActionSheetWithOptions: mockShowActionSheet }),
}));
// What Jellyfin says the episode carries: one embedded English track, one
// external Spanish file, and an image track the server would burn in.
const mockMediaSource = {
  MediaStreams: [
    {
      Type: "Subtitle",
      Index: 3,
      DeliveryMethod: "Embed",
      Language: "eng",
      DisplayTitle: "English - SUBRIP",
    },
    {
      Type: "Subtitle",
      Index: 4,
      DeliveryMethod: "External",
      IsExternal: true,
      Language: "spa",
      DisplayTitle: "Spanish - SRT - External",
      DeliveryUrl: "/Videos/ep-5/Subtitles/4/Stream.srt",
    },
    {
      Type: "Subtitle",
      Index: 5,
      DeliveryMethod: "Encode",
      Language: "fre",
      DisplayTitle: "French - PGSSUB",
    },
  ],
};
jest.mock("@/hooks/useMultiviewTileStream", () => ({
  useMultiviewTileStream: () => ({
    state: {
      status: "ready",
      item: mockItem,
      source: { url: "https://jf.example.com/stream" },
      mediaSource: mockMediaSource,
    },
    onPosition: jest.fn(),
  }),
}));
jest.mock("jotai", () => ({
  ...jest.requireActual("jotai"),
  useAtomValue: () => ({ basePath: "https://jf.example.com" }),
}));
jest.mock("@/utils/atoms/api", () => ({ apiAtom: "apiAtom" }));
jest.mock("@/modules", () => {
  const { forwardRef, useImperativeHandle } = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return {
    MpvPlayerView: forwardRef(
      (
        props: {
          onProgress?: Handler<{ position: number }>;
          onPlaybackStateChange?: Handler<{ isPaused?: boolean }>;
        },
        ref: unknown,
      ) => {
        useImperativeHandle(ref, () => mockPlayer);
        mockOnProgress = props.onProgress;
        mockOnState = props.onPlaybackStateChange;
        return <View />;
      },
    ),
  };
});

import { MultiviewTile } from "./MultiviewTile";

const renderTile = (showLabel = true) =>
  render(
    <MultiviewTile
      itemId={mockItem.Id}
      frame={{ left: 0, top: 0, width: 320, height: 180 }}
      muted
      heard={false}
      showLabel={showLabel}
      onPress={jest.fn()}
      onLongPress={jest.fn()}
    />,
  );

const tick = async (position: number) => {
  await act(async () => mockOnProgress?.({ nativeEvent: { position } }));
};
const playerState = async (state: {
  isPaused?: boolean;
  isLoading?: boolean;
}) => {
  await act(async () => mockOnState?.({ nativeEvent: state }));
};
const starting = () => screen.queryByLabelText("multiview.tile_starting");

beforeEach(() => {
  jest.clearAllMocks();
  mockOnProgress = undefined;
  mockOnState = undefined;
  mockItem = { Id: "ep-5", Name: "Episode 5", Type: "Episode" };
});

describe("the loading wheel", () => {
  test("stays up while a live channel tunes, before any video", async () => {
    // The stream URL comes back long before a live channel's first frame:
    // the server still has to tune and start a transcode.
    mockItem = { Id: "chan-1", Name: "WBZ-DT", Type: "TvChannel" };
    await renderTile();
    expect(starting()).toBeTruthy();
    await tick(0);
    expect(starting()).toBeTruthy();
  });

  test("goes once playback moves", async () => {
    await renderTile();
    await tick(0);
    await tick(0.5);
    expect(starting()).toBeNull();
  });

  describe("after playback has started", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    test("comes back when the picture stops moving", async () => {
      // Reported: a live tile went black mid-stream with nothing to say it
      // was waiting on the server.
      await renderTile();
      await tick(0);
      await tick(1);
      await act(async () => jest.advanceTimersByTime(3_000));
      expect(starting()).toBeTruthy();

      await tick(1.5);
      expect(starting()).toBeNull();
    });

    test("stays away while the tile is paused on purpose", async () => {
      await renderTile();
      await tick(0);
      await tick(1);
      await playerState({ isPaused: true });
      await act(async () => jest.advanceTimersByTime(10_000));
      expect(starting()).toBeNull();
    });

    test("shows while the player is seeking", async () => {
      await renderTile();
      await tick(0);
      await tick(1);
      await playerState({ isLoading: true });
      expect(starting()).toBeTruthy();
      await playerState({ isLoading: false });
      expect(starting()).toBeNull();
    });
  });
});

describe("tile controls", () => {
  test("a library item gets play/pause, skip and captions", async () => {
    await renderTile();
    expect(screen.getByLabelText("multiview.pause")).toBeTruthy();
    expect(screen.getByLabelText("multiview.seek_back:10")).toBeTruthy();
    expect(screen.getByLabelText("multiview.seek_forward:30")).toBeTruthy();
    expect(screen.getByLabelText("multiview.captions")).toBeTruthy();
  });

  test("a live channel has none, there is nothing to pause or skip", async () => {
    mockItem = { Id: "chan-1", Name: "WBZ-DT", Type: "TvChannel" };
    await renderTile();
    expect(screen.queryByLabelText("multiview.pause")).toBeNull();
    expect(screen.queryByLabelText("multiview.captions")).toBeNull();
  });

  test("they hide with the toolbar", async () => {
    await renderTile(false);
    expect(screen.queryByLabelText("multiview.pause")).toBeNull();
  });

  test("pause and play follow what the player reports", async () => {
    await renderTile();
    await fireEvent.press(screen.getByLabelText("multiview.pause"));
    expect(mockPlayer.pause).toHaveBeenCalled();

    await playerState({ isPaused: true });
    await fireEvent.press(screen.getByLabelText("multiview.play"));
    expect(mockPlayer.play).toHaveBeenCalled();
  });

  test("skip goes back 10 seconds and forward 30", async () => {
    await renderTile();
    await fireEvent.press(screen.getByLabelText("multiview.seek_back:10"));
    await fireEvent.press(screen.getByLabelText("multiview.seek_forward:30"));
    expect(mockPlayer.seekBy.mock.calls).toEqual([[-10], [30]]);
  });

  test("captions lists the server's subtitle names, leaving out burned-in ones", async () => {
    // Reported: the list read "eng", MPV's bare language code. Jellyfin names
    // every stream, the same names the full player shows. An image track the
    // server burns in cannot be turned on without restarting the stream.
    await renderTile();
    await fireEvent.press(screen.getByLabelText("multiview.captions"));
    const [options] = mockShowActionSheet.mock.calls[0];
    expect(options.options).toEqual([
      "multiview.captions_off",
      "English - SUBRIP",
      "Spanish - SRT - External",
      "common.cancel",
    ]);
  });

  test("captions turns on the player's own track for the one chosen, or off", async () => {
    await renderTile();
    await fireEvent.press(screen.getByLabelText("multiview.captions"));
    const [, choose] = mockShowActionSheet.mock.calls[0];

    await act(async () => choose(2));
    expect(mockPlayer.setSubtitleTrack).toHaveBeenLastCalledWith(2);
    await act(async () => choose(1));
    expect(mockPlayer.setSubtitleTrack).toHaveBeenLastCalledWith(1);
    await act(async () => choose(0));
    expect(mockPlayer.disableSubtitles).toHaveBeenCalled();
  });

  test("captions says so when the tile has none", async () => {
    const streams = mockMediaSource.MediaStreams;
    mockMediaSource.MediaStreams = [];
    await renderTile();
    await fireEvent.press(screen.getByLabelText("multiview.captions"));
    mockMediaSource.MediaStreams = streams;
    const [options] = mockShowActionSheet.mock.calls[0];
    expect(options.title).toBe("multiview.no_captions");
  });
});
