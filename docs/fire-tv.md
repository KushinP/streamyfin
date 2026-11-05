# SuperFin on Fire TV

Fire TV runs Fire OS, which is Android without Google Play services: Fire OS 7 is Android 9 (API 28), Fire OS 8 is Android 11 (API 30). The Android TV build is the Fire TV build. There is no separate flavour; the app checks for the few things Fire OS lacks.

```bash
bun run prebuild:tv
bun run android:tv
```

`minSdkVersion` is 26, which leaves out Fire OS 6 (API 25: the 2nd generation stick and the Basic Edition).

## What differs on Fire TV, and where

| Feature | On Fire TV | Where |
| --- | --- | --- |
| Push (Firebase) | None. TV never registers for push, and the TV build never takes `google-services.json`, even when `GOOGLE_SERVICES_JSON` is set. | `app.config.ts`, pinned by `app.config.test.ts` |
| Chromecast | Not in the TV build. A phone can still send media to the Fire TV through Jellyfin's remote control (Play On). | `app.config.ts` |
| Home screen rows | The Fire TV launcher does not show Android TV preview channels. Publishing is skipped when the device declares `amazon.hardware.fire_tv`. | `modules/tv-recommendations/.../TvRecommendationsPublisher.kt` |
| Launcher banner | `assets/images/tv-banner.png` (320×180), set as `androidTVBanner` for `@react-native-tvos/config-tv`, for Android TV and Fire TV. Re-render with `assets/brand/render-icons.swift`. | `app.json` |
| Home backdrop | Asks for 1280 px at quality 70 instead of 1920 px at 90 when the device has under 1.5 GB of memory (the Stick Lite and HD have about 1 GB). | `utils/tvBackdropRequest.ts`, `constants/TVSizes.ts` |
| Multiview | On, from Live TV's Multiview button: tiles play on ExoPlayer, since `MpvOwnership.kt` allows one MPV renderer per process. Up to 4 tiles; live channels are limited by the server's tuners. | `utils/multiview/availability.ts` |
| Touch | None. `@react-native-tvos/config-tv` marks the touchscreen as not required, so the Appstore does not filter Fire TV out. Every screen must work with the D-pad alone. | generated `AndroidManifest.xml` |

Focus, modals and lists follow `docs/conventions/tv.md` and `docs/tv-focus-guide.md` unchanged. On Fire TV, check that Back from Home leaves the app (Amazon reviews this), and that the remote's Play/Pause, Rewind and Fast-forward keys reach the player.

## Sideloading (personal use)

1. On the Fire TV: Settings → My Fire TV → About, then select the device name seven times to unlock Developer Options.
2. Developer Options: turn on ADB debugging, and allow apps from unknown sources (or for the Downloader app).
3. From this Mac, on the same network:

```bash
adb connect <fire-tv-ip>:5555
```

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

```bash
adb logcat | grep -E "ReactNative|mpv|TvRecommendations"
```

`TvRecommendations: synchronize(): skipped on Fire TV` in the log confirms the guard.

## Amazon Appstore

- A free Amazon developer account; upload the release APK or AAB and target the Fire TV devices.
- The review needs a server and a login it can use: set up a demo Jellyfin server and put its address and a test account in the review notes.
- Listing assets: a 114 and a 512 px icon, 1920×1080 screenshots, and the TV banner.
- A privacy policy URL and the content rating questionnaire.
- Use Live App Testing before releasing to everyone.

## Test plan

| Step | Where | What |
| --- | --- | --- |
| 1 | Android TV emulator, API 30 and API 28 TV images | D-pad focus on every tab, the Live TV guide, the player overlay; Back from Home leaves; no Google Play services dialog. |
| 2 | An emulator image without Google APIs | No crash on start, no Firebase errors, the recommendations guard does not fire (it only fires on Fire TV). |
| 3 | A Fire TV stick over adb | Install, the log line above, `adb shell getprop ro.build.version.sdk`. |
| 4 | The same stick, 30 minutes each | 1080p H.264, HEVC and a live channel; `adb shell dumpsys meminfo com.kushagra.superfin`; remote media keys; Alexa "pause". |
| 5 | A Stick Lite or HD | Home scrolls smoothly, cold start under 5 s, the guide loads more channels as it scrolls. |
