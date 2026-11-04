import { tvBackdropRequest } from "./tvBackdropRequest";

// TVSizes reads the typography scale from the settings, which pull in the
// whole settings UI; only the backdrop numbers are needed here.
jest.mock("@/utils/atoms/settings", () => ({
  TVTypographyScale: {
    Small: "small",
    Default: "default",
    Large: "large",
    ExtraLarge: "extraLarge",
  },
  useSettings: () => ({ settings: {} }),
}));

const GB = 1024 ** 3;

describe("tvBackdropRequest", () => {
  test("asks for full HD on a device with memory to spare", () => {
    expect(tvBackdropRequest(4 * GB)).toEqual({ width: 1920, quality: 90 });
  });

  // A Fire TV Stick Lite or HD has about 1 GB.
  test("asks for a lighter image on a low memory stick", () => {
    expect(tvBackdropRequest(1 * GB)).toEqual({ width: 1280, quality: 70 });
  });

  test("treats unknown memory as enough", () => {
    expect(tvBackdropRequest(null)).toEqual({ width: 1920, quality: 90 });
  });
});
