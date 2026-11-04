import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Colors } from "./Colors";

// tailwind.config.js is CommonJS, which Jest loads as it is.
const tailwind = require("../tailwind.config.js") as {
  theme: { extend: { colors: Record<string, Record<number, string>> } };
};
const { brand, purple } = tailwind.theme.extend.colors;

const root = join(__dirname, "..");
const sources = (dir: string): string[] =>
  (readdirSync(join(root, dir), { recursive: true }) as string[])
    .filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f))
    .map((f) => join(dir, f));

describe("SuperFin colours", () => {
  test("the app's accent is the brand scale Tailwind classes use", () => {
    expect(Colors.primary).toBe(brand[500]);
    expect(Colors.tabIconSelected).toBe(brand[500]);
    expect(Colors.primaryLight).toBe(brand[300]);
  });

  test("Streamyfin's purple classes draw in the brand colour", () => {
    // The app uses `*-purple-*` classes for its accent in ~80 places.
    expect(purple).toBe(brand);
  });

  test("no component hard-codes Streamyfin's purple accent", () => {
    // A rebrand misses literals; they belong in Colors. Seerr's own badge
    // colours live in constants/ and are Seerr's, so they are left alone.
    const purples = /#(9334e9|9333ea|7c3aed|a855f7|c084fc)\b/i;
    const offenders = [...sources("app"), ...sources("components")].filter(
      (file) => purples.test(readFileSync(join(root, file), "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
