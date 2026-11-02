import { act, renderHook, waitFor } from "@testing-library/react-native";

const mockApi = {
  basePath: "https://jf.example.com",
  accessToken: "tok",
};
const mockUser = { Id: "user-1" };
const mockGetItem = jest.fn();
const mockStart = jest.fn(() => Promise.resolve());
const mockStopped = jest.fn((_args: unknown) => Promise.resolve());
const mockGetStreamUrl = jest.fn();

jest.mock("@/utils/atoms/api", () => ({
  apiAtom: "apiAtom",
  userAtom: "userAtom",
}));
jest.mock("jotai", () => ({
  ...jest.requireActual("jotai"),
  useAtomValue: (atom: unknown) => (atom === "apiAtom" ? mockApi : mockUser),
}));
jest.mock("@/utils/atoms/settings", () => ({
  useSettings: () => ({ settings: { audioTranscodeMode: "auto" } }),
}));
jest.mock("@jellyfin/sdk/lib/utils/api", () => ({
  getLibraryApi: () => ({ getItem: mockGetItem }),
  getSessionApi: () => ({
    reportPlaybackStart: mockStart,
    reportPlaybackStopped: mockStopped,
  }),
}));
jest.mock("@/utils/jellyfin/media/getStreamUrl", () => ({
  getStreamUrl: (...args: unknown[]) => mockGetStreamUrl(...args),
}));
jest.mock("@/utils/profiles/native", () => ({
  generateDeviceProfile: () => ({}),
}));
jest.mock("@/utils/log", () => ({ writeToLog: jest.fn() }));
jest.mock("@/utils/customHeaders", () =>
  jest.requireActual("@/test-utils/customHeaders").customHeadersModule(),
);

import { useMultiviewTileStream } from "./useMultiviewTileStream";

const channel = { Id: "chan-1", Type: "TvChannel" };
const liveStream = {
  url: "https://jf.example.com/Videos/chan-1/stream",
  sessionId: "play-1",
  mediaSource: { Id: "ms-1", LiveStreamId: "live-1" },
};

const stopInfo = () =>
  (mockStopped.mock.calls[0]?.[0] as { playbackStopInfo: object })
    ?.playbackStopInfo;

describe("useMultiviewTileStream", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue({ data: channel });
  });

  test("closing a live tile releases its tuner with the LiveStreamId", async () => {
    mockGetStreamUrl.mockResolvedValue(liveStream);
    const { result, unmount } = await renderHook(() =>
      useMultiviewTileStream("chan-1"),
    );
    await waitFor(() => expect(result.current.state.status).toBe("ready"));

    await unmount();

    expect(mockStopped).toHaveBeenCalledTimes(1);
    expect(stopInfo()).toMatchObject({
      ItemId: "chan-1",
      PlaySessionId: "play-1",
      LiveStreamId: "live-1",
    });
  });

  test("a tile removed while its stream is still opening still releases it", async () => {
    let resolveStream: (value: unknown) => void = () => {};
    mockGetStreamUrl.mockReturnValue(
      new Promise((resolve) => {
        resolveStream = resolve;
      }),
    );
    const { unmount } = await renderHook(() =>
      useMultiviewTileStream("chan-1"),
    );
    await waitFor(() => expect(mockGetStreamUrl).toHaveBeenCalled());

    await unmount();
    expect(mockStopped).not.toHaveBeenCalled();

    await act(async () => {
      resolveStream(liveStream);
    });
    expect(stopInfo()).toMatchObject({ LiveStreamId: "live-1" });
    // It never played, so the server was never told it started.
    expect(mockStart).not.toHaveBeenCalled();
  });

  test("a library item resumes where it was left and saves the new position on close", async () => {
    mockGetItem.mockResolvedValue({
      data: {
        Id: "ep-1",
        Type: "Episode",
        UserData: { PlaybackPositionTicks: 600_000_000 },
      },
    });
    mockGetStreamUrl.mockResolvedValue({
      url: "https://jf.example.com/Videos/ep-1/stream",
      sessionId: "play-2",
      mediaSource: { Id: "ep-1" },
    });
    const { result, unmount } = await renderHook(() =>
      useMultiviewTileStream("ep-1"),
    );
    await waitFor(() => expect(result.current.state.status).toBe("ready"));
    const ready = result.current.state as { source: { startPosition: number } };
    expect(ready.source.startPosition).toBe(60);

    await act(async () => result.current.onPosition(90));
    await unmount();
    expect(stopInfo()).toMatchObject({ PositionTicks: 900_000_000 });
  });

  test("a stream the server refuses shows as an error", async () => {
    mockGetStreamUrl.mockRejectedValue(new Error("NoCompatibleStream"));
    const { result } = await renderHook(() => useMultiviewTileStream("chan-1"));
    await waitFor(() => expect(result.current.state.status).toBe("error"));
  });
});
