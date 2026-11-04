import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { act, render, screen } from "@testing-library/react-native";
import {
  HOME_AMBIENT_BLUR_RADIUS,
  HOME_AMBIENT_CROSSFADE_MS,
  HOME_AMBIENT_DEBOUNCE_MS,
  HOME_AMBIENT_IMAGE_WIDTH,
} from "@/constants/HomeAmbient";
import { HomeAmbientBackdrop } from "./HomeAmbientBackdrop";

jest.mock(
  "@/components/common/ServerImage",
  () => jest.requireActual("@/test-utils/serverImage").serverImageModule,
);
jest.mock(
  "@/utils/atoms/api",
  () => jest.requireActual("@/test-utils/jellyfinProvider").apiAtomsModule,
);
jest.mock("expo-linear-gradient", () => ({ LinearGradient: () => null }));

const movie = (id: string): BaseItemDto => ({
  Id: id,
  Type: "Movie",
  BackdropImageTags: [`tag-${id}`],
});

const layerUri = (index: number) =>
  screen.queryByTestId(`home-ambient-layer-${index}`)?.props.source?.uri as
    | string
    | undefined;

describe("HomeAmbientBackdrop", () => {
  beforeEach(() => jest.useFakeTimers({ doNotFake: ["performance"] }));
  afterEach(() => jest.useRealTimers());

  test("shows a small, blurred backdrop of the hero slide", async () => {
    await render(<HomeAmbientBackdrop item={movie("a")} />);
    await act(async () => jest.advanceTimersByTime(HOME_AMBIENT_DEBOUNCE_MS));

    const layer = screen.getByTestId("home-ambient-layer-0");
    expect(layer.props.source.uri).toContain("/Items/a/");
    expect(layer.props.source.uri).toContain(
      `fillWidth=${HOME_AMBIENT_IMAGE_WIDTH}`,
    );
    expect(layer.props.blurRadius).toBe(HOME_AMBIENT_BLUR_RADIUS);
  });

  test("follows a run of swipes only once it rests", async () => {
    const view = await render(<HomeAmbientBackdrop item={movie("a")} />);
    await act(async () => jest.advanceTimersByTime(HOME_AMBIENT_DEBOUNCE_MS));

    await act(async () =>
      view.rerender(<HomeAmbientBackdrop item={movie("b")} />),
    );
    await act(async () =>
      jest.advanceTimersByTime(HOME_AMBIENT_DEBOUNCE_MS / 2),
    );
    await act(async () =>
      view.rerender(<HomeAmbientBackdrop item={movie("c")} />),
    );
    await act(async () => jest.advanceTimersByTime(HOME_AMBIENT_DEBOUNCE_MS));

    // "b" never landed: "c" took the other layer, "a" fades out under it.
    expect(layerUri(0)).toContain("/Items/a/");
    expect(layerUri(1)).toContain("/Items/c/");
  });

  // Reported: filtering the hero down to nothing left the last backdrop up.
  test("fades away when the hero loses its slide", async () => {
    const view = await render(<HomeAmbientBackdrop item={movie("a")} />);
    await act(async () => jest.advanceTimersByTime(HOME_AMBIENT_DEBOUNCE_MS));
    expect(layerUri(0)).toContain("/Items/a/");

    await act(async () => view.rerender(<HomeAmbientBackdrop item={null} />));
    await act(async () => jest.advanceTimersByTime(HOME_AMBIENT_DEBOUNCE_MS));
    await act(async () => jest.advanceTimersByTime(HOME_AMBIENT_CROSSFADE_MS));

    expect(screen.queryByTestId("home-ambient-layer-0")).toBeNull();
    expect(screen.queryByTestId("home-ambient-layer-1")).toBeNull();
  });

  test("draws nothing without a slide", async () => {
    await render(<HomeAmbientBackdrop item={null} />);
    await act(async () => jest.advanceTimersByTime(HOME_AMBIENT_DEBOUNCE_MS));

    expect(screen.queryByTestId("home-ambient-layer-0")).toBeNull();
    expect(screen.queryByTestId("home-ambient-layer-1")).toBeNull();
  });
});
