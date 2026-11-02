import type { MediaSourceInfo } from "@jellyfin/sdk/lib/generated-client/models";
import { MULTIVIEW_TILE_CACHE } from "@/constants/Multiview";
import type { MpvVideoSource as VideoSource } from "@/modules";
import { getJellyfinHeadersForUrl } from "@/utils/customHeaders";
import { withAcceptLanguageForUrl } from "@/utils/jellyfin/acceptLanguage";

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
  }: {
    basePath: string | undefined;
    accessToken: string | undefined;
    startPosition?: number;
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

  return {
    url: stream.url,
    startPosition,
    autoplay: true,
    cacheConfig: { ...MULTIVIEW_TILE_CACHE },
    ...(Object.keys(withLanguage).length > 0 && { headers: withLanguage }),
  };
};
