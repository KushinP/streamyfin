import { hasLiveTv } from "./liveTv";

describe("hasLiveTv", () => {
  test("is true when one of the user's libraries is Live TV", () => {
    expect(
      hasLiveTv(
        [{ CollectionType: "movies" }, { Id: "lt", CollectionType: "livetv" }],
        [],
      ),
    ).toBe(true);
  });

  test("is false without a Live TV library, or before the list loads", () => {
    expect(hasLiveTv([{ CollectionType: "movies" }], [])).toBe(false);
    expect(hasLiveTv(undefined, [])).toBe(false);
  });

  test("is false when the user hid the Live TV library", () => {
    expect(hasLiveTv([{ Id: "lt", CollectionType: "livetv" }], ["lt"])).toBe(
      false,
    );
  });
});
