import { DeviceType } from "expo-device";
import { isMac, usesNativeSidebar } from "./platform";

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

describe("usesNativeSidebar", () => {
  test("an iPad gets Apple's sidebar toggle on its floating tab bar", () => {
    expect(
      usesNativeSidebar({ OS: "ios", isPad: true }, DeviceType.TABLET),
    ).toBe(true);
  });

  test("the Mac does not: it draws its own sidebar (MacSidebar)", () => {
    expect(
      usesNativeSidebar({ OS: "ios", isPad: true }, DeviceType.DESKTOP),
    ).toBe(false);
  });

  test("a phone, Apple TV and Android keep the plain tab bar", () => {
    expect(usesNativeSidebar({ OS: "ios" }, DeviceType.PHONE)).toBe(false);
    expect(
      usesNativeSidebar({ OS: "ios", isPad: true, isTV: true }, DeviceType.TV),
    ).toBe(false);
    expect(usesNativeSidebar({ OS: "android" }, DeviceType.TABLET)).toBe(false);
  });
});
