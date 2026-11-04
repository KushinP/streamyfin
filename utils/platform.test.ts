import { DeviceType } from "expo-device";
import { isMac, usesSidebar } from "./platform";

describe("isMac", () => {
  test("is the iOS app on a desktop", () => {
    expect(isMac({ OS: "ios" }, DeviceType.DESKTOP)).toBe(true);
  });

  test("is not an iPad, a phone, or another platform", () => {
    expect(isMac({ OS: "ios" }, DeviceType.TABLET)).toBe(false);
    expect(isMac({ OS: "ios" }, DeviceType.PHONE)).toBe(false);
    expect(isMac({ OS: "android" }, DeviceType.DESKTOP)).toBe(false);
    expect(isMac({ OS: "ios" }, null)).toBe(false);
  });
});

describe("usesSidebar", () => {
  test("the Mac and an iPad get the sidebar", () => {
    expect(usesSidebar({ OS: "ios" }, DeviceType.DESKTOP)).toBe(true);
    expect(usesSidebar({ OS: "ios", isPad: true }, DeviceType.TABLET)).toBe(
      true,
    );
  });

  test("a phone, Apple TV and Android keep the tab bar", () => {
    expect(usesSidebar({ OS: "ios" }, DeviceType.PHONE)).toBe(false);
    expect(
      usesSidebar({ OS: "ios", isPad: true, isTV: true }, DeviceType.TV),
    ).toBe(false);
    expect(usesSidebar({ OS: "android" }, DeviceType.TABLET)).toBe(false);
  });
});
