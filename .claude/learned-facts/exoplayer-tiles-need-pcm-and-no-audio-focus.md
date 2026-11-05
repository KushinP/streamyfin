# Several ExoPlayers at once: no audio focus, and PCM only

**Date**: 2026-11-04
**Category**: native
**Key files**: `modules/exoplayer-player/android/src/main/java/expo/modules/exoplayerplayer/ExoPlayerView.kt` (`VideoLoadConfig.multiview`), `utils/multiview/tileSource.ts`

## Detail

Multiview on Android TV runs one ExoPlayer per tile. Two things break with
the full player's setup:

- **Audio focus.** With `handleAudioFocus = true`, each new player takes the
  focus and the others, losing it, pause. Tiles pass `multiview: true` in
  their source, which turns focus handling off.
- **Passthrough.** On an HDMI sink that takes AC3/E-AC3, the platform audio
  renderer hands the bitstream straight to the TV: `player.volume` does
  nothing to it (a muted tile is heard) and only one player can hold the
  bitstream (the next fails with `AudioTrack init failed ... audio/ac3`).
  Passing PCM-only `AudioCapabilities` to `DefaultAudioSink.Builder` is not
  enough: the sink re-reads the TV's own capabilities. Tiles wrap the sink in
  a `ForwardingAudioSink` that reports every non-PCM format unsupported, so
  the renderer decodes (Fire TV has a Dolby decoder).

A Fire TV Stick 4K Max played two live channels and two library episodes at
once this way. Its decoders allow 4 or 5 instances per format
(`/vendor/etc/media_codecs_mediatek_video.xml`).

## Symptom pattern

A second tile starts and the first one pauses; or every tile is heard at
once; or a tile fails with `MediaCodecAudioRenderer error ... audio/ac3`.
