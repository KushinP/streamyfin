import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { LIVE_PAUSE_WAIT_SECONDS } from "@/constants/Playback";

/**
 * The buffer MPV waits for before it starts or resumes this item, in seconds:
 * the live cushion for a live channel (a channel, or a program played through
 * its channel), undefined for anything else, which keeps MPV's default.
 */
export const livePauseWait = (
  item: Pick<BaseItemDto, "Type"> | null | undefined,
): number | undefined =>
  item?.Type === "TvChannel" || item?.Type === "Program"
    ? LIVE_PAUSE_WAIT_SECONDS
    : undefined;
