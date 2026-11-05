import { PixelRatio } from "react-native";
import { TV_IMAGE_OVERSAMPLE, TV_IMAGE_QUALITY } from "@/constants/Images";
import { tvImageWidth } from "./tvImage";

describe("TV images", () => {
  test("ask for more pixels than the card covers, so scaling down keeps edges crisp", () => {
    // A Fire TV draws at 1920 by 1080 with a pixel ratio of 2.
    jest
      .spyOn(PixelRatio, "getPixelSizeForLayoutSize")
      .mockImplementation((size) => size * 2);
    expect(tvImageWidth(93)).toBe(Math.round(93 * 2 * TV_IMAGE_OVERSAMPLE));
    expect(TV_IMAGE_OVERSAMPLE).toBeGreaterThan(1);
  });

  test("come at a high JPEG quality: a 75 inch screen shows 80's blocks", () => {
    expect(TV_IMAGE_QUALITY).toBeGreaterThanOrEqual(90);
  });
});
