import type { MediaSourceInfo } from "@jellyfin/sdk/lib/generated-client/models";
import { MULTIVIEW_TILE_CACHE } from "@/constants/Multiview";
import type { MpvVideoSource as VideoSource } from "@/modules";
import { getJellyfinHeadersForUrl } from "@/utils/customHeaders";
import { withAcceptLanguageForUrl } from "@/utils/jellyfin/acceptLanguage";
import { getExternalSubtitleUrl } from "@/utils/jellyfin/subtitleUtils";

export interface TileStream {
  url: string;
  sessionId: string | null;
  mediaSource: MediaSourceInfo | undefined;
  requiredHttpHeaders?: Record<string, string>;
}

/**
 * The MPV source for one multiview tile. The header rules match the full
 * player's: the Jellyfin token and the custom proxy headers only go to the
 * Jellyfin server, never to a remote stream, because MPV sends its headers
 * with every request it makes.
 */
export const buildTileSource = (
  stream: TileStream,
  {
    basePath,
    accessToken,
    startPosition = 0,
    pauseWaitSeconds,
  }: {
    basePath: string | undefined;
    accessToken: string | undefined;
    startPosition?: number;
    /** The live cushion for a channel (livePauseWait); unset for the rest. */
    pauseWaitSeconds?: number;
  },
): VideoSource => {
  const headers: Record<string, string> = {};
  const isRemoteStream =
    stream.mediaSource?.IsRemote && stream.mediaSource?.Protocol === "Http";
  if (accessToken && !isRemoteStream) {
    headers.Authorization = `MediaBrowser Token="${accessToken}"`;
  }
  Object.assign(headers, getJellyfinHeadersForUrl(stream.url, basePath) ?? {});
  if (stream.requiredHttpHeaders) {
    Object.assign(headers, stream.requiredHttpHeaders);
  }
  const withLanguage = withAcceptLanguageForUrl(headers, stream.url, basePath);
  // Sidecar subtitle files are not in the stream, so MPV loads them alongside
  // it, as the full player does. A tile starts with captions off either way.
  const externalSubtitles = (stream.mediaSource?.MediaStreams ?? [])
    .filter((s) => s.Type === "Subtitle" && s.DeliveryMethod === "External")
    .map((s) => getExternalSubtitleUrl(s, { offline: false, basePath }))
    .filter((url): url is string => !!url);

  return {
    url: stream.url,
    startPosition,
    autoplay: true,
    multiview: true,
    cacheConfig: {
      ...MULTIVIEW_TILE_CACHE,
      ...(pauseWaitSeconds !== undefined && { pauseWaitSeconds }),
    },
    ...(Object.keys(withLanguage).length > 0 && { headers: withLanguage }),
    ...(externalSubtitles.length > 0 && { externalSubtitles }),
  };
};
