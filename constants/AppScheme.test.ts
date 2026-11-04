import { readFileSync } from "node:fs";
import { join } from "node:path";
import { APP_SCHEME } from "./AppScheme";

const root = join(__dirname, "..");

describe("APP_SCHEME", () => {
  test("is the scheme app.json declares", () => {
    const appJson = JSON.parse(readFileSync(join(root, "app.json"), "utf8"));
    expect(appJson.expo.scheme).toBe(APP_SCHEME);
  });

  test("is the only scheme in the Android TV channel links", () => {
    // Kotlin cannot import the constant, so its literal is checked here: a
    // link in a scheme the app does not declare opens nothing from the TV
    // home screen.
    const publisher = readFileSync(
      join(
        root,
        "modules/tv-recommendations/android/src/main/java/expo/modules/tvrecommendations/TvRecommendationsPublisher.kt",
      ),
      "utf8",
    );
    const schemes = [...publisher.matchAll(/"([a-z][a-z0-9+.-]*):\/\//g)].map(
      (m) => m[1],
    );
    expect(schemes.length).toBeGreaterThan(0);
    expect(new Set(schemes)).toEqual(new Set([APP_SCHEME]));
  });
});
