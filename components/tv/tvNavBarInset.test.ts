import { tvNavBarTopInset } from "./tvNavBarInset";

describe("tvNavBarTopInset", () => {
  test("keeps the bar inside the 5% a TV crops at its edges", () => {
    // A Fire TV stick: 540 dp tall, no safe-area inset.
    expect(tvNavBarTopInset(540, 0)).toBe(27);
  });

  test("keeps the old 16 dp gap where that is already more", () => {
    expect(tvNavBarTopInset(200, 0)).toBe(16);
    expect(tvNavBarTopInset(540, 20)).toBe(36);
  });
});
