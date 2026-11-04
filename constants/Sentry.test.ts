import { readFileSync } from "node:fs";
import { join } from "node:path";
import { OFFICIAL_APPLICATION_IDS } from "./Sentry";

const { expo } = JSON.parse(
  readFileSync(join(__dirname, "..", "app.json"), "utf8"),
);

// Only builds carrying these identifiers, as they are or with the suffix a
// sideloading tool appends, report into upstream Streamyfin's Sentry
// (utils/sentry.ts). The list is a constant and not a runtime read of the
// config so that a fork's rename does not move it. This repository is such a
// fork (SuperFin): it keeps upstream's list as it is, so its builds never
// report into upstream's project, and sets EXPO_PUBLIC_SENTRY_DSN for its own.
describe("OFFICIAL_APPLICATION_IDS", () => {
  test("still names upstream Streamyfin's ids", () => {
    expect([...OFFICIAL_APPLICATION_IDS]).toEqual(
      expect.arrayContaining(["com.fredrikburmester.streamyfin"]),
    );
  });

  test("does not hold this fork's iOS bundle identifier", () => {
    expect(OFFICIAL_APPLICATION_IDS).not.toContain(expo.ios.bundleIdentifier);
  });

  test("does not hold this fork's Android application id", () => {
    expect(OFFICIAL_APPLICATION_IDS).not.toContain(expo.android.package);
  });
});
