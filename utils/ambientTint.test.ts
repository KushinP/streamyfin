import { ambientTint } from "./ambientTint";

describe("ambientTint", () => {
  test("pulls the artwork's colour most of the way to black", () => {
    expect(ambientTint("#e9b37b", 0.3)).toBe("rgb(70, 54, 37)");
  });

  test("reads three-digit colours", () => {
    expect(ambientTint("#f80", 0.5)).toBe("rgb(128, 68, 0)");
  });

  test("gives nothing before the colour is known, so the page stays black", () => {
    // The colour hook starts out at white.
    expect(ambientTint("#FFFFFF")).toBeNull();
    expect(ambientTint(undefined)).toBeNull();
  });

  test("gives nothing for greys, which would only make the page muddy", () => {
    expect(ambientTint("#808080")).toBeNull();
    expect(ambientTint("#121212")).toBeNull();
  });

  test("gives nothing for a value it cannot read", () => {
    expect(ambientTint("rebeccapurple")).toBeNull();
  });

  test("never comes out lighter than the strength allows", () => {
    const tint = ambientTint("#ff0000");
    const [r] = (tint ?? "").match(/\d+/g)?.map(Number) ?? [255];
    expect(r).toBeLessThan(255 * 0.5);
  });
});
