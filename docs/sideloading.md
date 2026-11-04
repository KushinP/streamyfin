# Installing SuperFin for yourself

SuperFin is not on the App Store. For personal use there are three ways onto your own devices, none of which needs the paid Apple Developer Program.

| Device | Way | Lasts | Needs |
| --- | --- | --- | --- |
| iPhone, iPad | SideStore or AltStore with the `.ipa` | Re-signed every 7 days, by the app itself | A free Apple ID |
| iPhone, iPad | Xcode, Run onto the plugged-in device | 7 days, then run it from Xcode again | A free Apple ID, this Mac |
| Mac (Apple silicon) | Xcode, **My Mac (Designed for iPad)** | Until the signing certificate expires | This Mac |
| Fire TV, Android | The APK over `adb` | For good | ADB debugging on the device |

Built files land in `build/` (gitignored): `build/SuperFin.ipa` for SideStore or AltStore, and `build/SuperFin-FireTV.apk` for Fire TV. The Fire TV APK is a release build (the app's code is inside it, no dev server needed), signed with the debug key, with both the 32-bit and 64-bit ARM code.

## The free Apple ID build

A free Apple ID ("Personal Team") can't sign two of the entitlements the app normally asks for, so a sideloaded build leaves them out:

- **Push notifications.** They're off in this fork anyway.
- **Access Wi-Fi Information.** The automatic switch to the server's local address when you are at home won't see your Wi-Fi network, so the app keeps using the address you signed in with. Everything else works: playback, downloads, Live TV, multiview.

Build it with `SUPERFIN_FREE_SIGNING=1` at prebuild:

```bash
SUPERFIN_FREE_SIGNING=1 EXPO_TV=0 bunx expo prebuild --platform ios --clean
```

The free signing also limits you to 3 sideloaded apps and 10 app IDs a week. SuperFin uses two IDs: the app, and its download progress Live Activity.

## iPhone and iPad with SideStore (recommended)

SideStore re-signs the app on the device every 7 days over Wi-Fi, so it keeps working while you travel.

1. Install SideStore once, from a computer, following https://sidestore.io (it needs a pairing file and your Apple ID).
2. Copy `SuperFin.ipa` to the phone (AirDrop, Files, or iCloud Drive).
3. In SideStore: **My Apps → +**, pick the `.ipa`.
4. On the phone: **Settings → General → VPN & Device Management**, trust your Apple ID.
5. Turn on **Settings → Privacy & Security → Developer Mode** if iOS asks.

AltStore works the same way, but it re-signs from AltServer on a computer on the same network.

### Making the `.ipa`

An unsigned Release build that SideStore or AltStore signs with your Apple ID:

```bash
xcodebuild -workspace ios/SuperFin.xcworkspace -scheme SuperFin -configuration Release \
  -destination 'generic/platform=iOS' -archivePath build/SuperFin.xcarchive \
  CODE_SIGNING_ALLOWED=NO archive
```

```bash
rm -rf build/ipa && mkdir -p build/ipa/Payload && \
  cp -R build/SuperFin.xcarchive/Products/Applications/SuperFin.app build/ipa/Payload/ && \
  (cd build/ipa && zip -qry ../SuperFin.ipa Payload)
```

## iPhone and iPad from Xcode

1. Xcode → Settings → Accounts: add your Apple ID. It shows up as "(Personal Team)".
2. Open `ios/SuperFin.xcworkspace`. On the **SuperFin** target and the **DownloadActivity** extension, under Signing & Capabilities, choose that Personal Team.
3. Plug in the phone, pick it as the destination, and press Run.
4. Trust the developer on the phone (as step 4 above).

After 7 days the app stops opening; plug in and press Run again.

## The Mac

The Mac app is the iPad app on Apple silicon ("Designed for iPad"). There is no DMG: the player library has no Mac Catalyst build (see `docs/mac.md`), and macOS installs iPad apps only from Xcode, the App Store or TestFlight.

1. In Xcode, pick the destination **My Mac (Designed for iPad)**.
2. Press Run. SuperFin opens in its own window and stays in Launchpad.

## Fire TV and Android

See `docs/fire-tv.md`. In short, with ADB debugging on and the device's IP address:

```bash
adb connect <device-ip>:5555
```

```bash
adb install -r SuperFin.apk
```
