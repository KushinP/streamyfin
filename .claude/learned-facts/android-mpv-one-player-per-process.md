# Android Allows One MPV Player Per Process

**Date**: 2026-11-03
**Category**: native
**Key files**: `modules/mpv-player/android/src/main/java/expo/modules/mpvplayer/MpvOwnership.kt`, `utils/multiview/availability.ts`

## Detail

On Android, `MpvOwnership.kt` is a process-wide lock: only one libmpv
renderer can own playback at a time, and a second view waits for the first to
let go. Anything that mounts two players at once (multiview) gets one playing
tile while the others still open their server streams, and, for live
channels, hold a tuner each while showing nothing.

That is why multiview never uses MPV on Android. On Android TV and Fire TV
its tiles play on ExoPlayer instead (`multiviewEngine`), which has no such
lock; an Android phone, which ships no ExoPlayer, still has no multiview.
See `exoplayer-tiles-need-pcm-and-no-audio-focus`.

## Symptom pattern

On Android, a second video surface stays black or spinning while the server
dashboard shows its session as open.
