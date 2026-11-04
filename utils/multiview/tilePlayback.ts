import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { MULTIVIEW_END_TOLERANCE } from "@/constants/Multiview";

/**
 * Whether a tile that stopped at this position has played to the end. The
 * embedded MPV view sends no end event, so the end is read from where the
 * progress ticks stopped. A stream with no duration, a live channel among
 * them, never ends.
 */
export const isAtEnd = (position: number, duration: number): boolean =>
  duration > 0 && duration - position <= MULTIVIEW_END_TOLERANCE;

/**
 * The episode after this one, from the list `getEpisodes({ adjacentTo })`
 * answers. That list has no fixed shape at a season's edge, so the next one is
 * found from this episode's own place in it, as the full player does. An
 * episode the server only knows by name (a "Virtual" one) has nothing to play.
 */
export const nextEpisodeIn = (
  adjacent: BaseItemDto[] | null | undefined,
  currentId: string,
): BaseItemDto | null => {
  if (!adjacent) return null;
  const index = adjacent.findIndex((episode) => episode.Id === currentId);
  if (index < 0) return null;
  const next = adjacent[index + 1];
  if (!next?.Id || next.Id === currentId || next.LocationType === "Virtual") {
    return null;
  }
  return next;
};
