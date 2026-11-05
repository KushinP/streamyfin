import { act, renderHook } from "@testing-library/react-native";
import { TV_NAV_BAR_HIDE_DELAY_MS } from "@/constants/TVNavBar";
import { useNavBarPresence } from "./useNavBarPresence";

describe("useNavBarPresence", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test("shows the bar when the screen opens", async () => {
    const { result } = await renderHook(() => useNavBarPresence());
    expect(result.current.visible).toBe(true);
  });

  test("hides it once focus moves down into the page", async () => {
    const { result } = await renderHook(() => useNavBarPresence());
    await act(async () => result.current.onItemFocus());
    await act(async () => result.current.onItemBlur());
    expect(result.current.visible).toBe(true);
    await act(async () => jest.advanceTimersByTime(TV_NAV_BAR_HIDE_DELAY_MS));
    expect(result.current.visible).toBe(false);
  });

  test("stays while focus moves from one tab to the next", async () => {
    const { result } = await renderHook(() => useNavBarPresence());
    await act(async () => result.current.onItemFocus());
    await act(async () => result.current.onItemBlur());
    await act(async () => result.current.onItemFocus());
    await act(async () =>
      jest.advanceTimersByTime(TV_NAV_BAR_HIDE_DELAY_MS * 2),
    );
    expect(result.current.visible).toBe(true);
  });

  test("comes back when focus returns to it", async () => {
    const { result } = await renderHook(() => useNavBarPresence());
    await act(async () => result.current.onItemBlur());
    await act(async () => jest.advanceTimersByTime(TV_NAV_BAR_HIDE_DELAY_MS));
    expect(result.current.visible).toBe(false);
    await act(async () => result.current.onItemFocus());
    expect(result.current.visible).toBe(true);
  });
});
