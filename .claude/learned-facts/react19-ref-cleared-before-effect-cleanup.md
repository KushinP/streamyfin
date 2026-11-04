# React 19 Clears Object Refs Before Effect Cleanups Run

**Date**: 2026-11-03
**Category**: react
**Key files**: `components/multiview/MultiviewTile.tsx`

## Detail

On unmount, React 19 detaches refs (sets `ref.current = null`) before it runs
the passive-effect cleanups of the same component. A cleanup that reads
`playerRef.current` to call `destroy()` on a native view therefore reads
`null` and does nothing, silently.

The multiview tile did exactly that, so closing a tile never destroyed its
player: the decoder, the stream and, for a live channel, the tuner stayed
held until the native view's deferred deinit.

Keep the instance in something React does not clear: a callback ref that
copies it into a second ref (`lastPlayer`) or a local captured by the effect,
and destroy that one in the cleanup.

## Symptom pattern

Cleanup code that looks right and is reached, but the native resource it
should release stays alive after the screen or component goes away.
