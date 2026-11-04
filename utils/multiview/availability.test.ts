import { isMultiviewAvailable } from "./availability";

describe("isMultiviewAvailable", () => {
  test("iPhone, iPad and Mac get multiview", () => {
    expect(isMultiviewAvailable({ OS: "ios", isTV: false })).toBe(true);
  });

  test("Android does not: its player allows one video at a time", () => {
    // MpvOwnership.kt is a process-wide lock. A second tile would wait on it
    // forever while its server stream, and a live channel's tuner, stay open.
    expect(isMultiviewAvailable({ OS: "android", isTV: false })).toBe(false);
  });

  test("TV builds do not, they have no multiview screen", () => {
    expect(isMultiviewAvailable({ OS: "ios", isTV: true })).toBe(false);
    expect(isMultiviewAvailable({ OS: "android", isTV: true })).toBe(false);
  });
});
