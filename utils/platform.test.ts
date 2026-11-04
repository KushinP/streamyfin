import { DeviceType } from "expo-device";
import { isMac } from "./platform";

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
