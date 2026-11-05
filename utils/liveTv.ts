import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";

/**
 * Whether the user has a Live TV library they have not hidden: the Live TV
 * tab shows only then, as Watchlists shows only with a StreamyStats server.
 */
export const hasLiveTv = (
  views: Pick<BaseItemDto, "Id" | "CollectionType">[] | null | undefined,
  hiddenLibraries: string[] | undefined,
) =>
  (views ?? []).some(
    (view) =>
      view.CollectionType === "livetv" &&
      !hiddenLibraries?.includes(view.Id ?? ""),
  );

/**
 * Where the Live TV tab opens: the programs page, which on TV is the whole
 * Live TV screen (title and its own tabs) and on the phone the first top tab.
 * The bare group has no page (it falls through to the Library's [libraryId]
 * route) and a bare /livetv lands on the guide without its header.
 */
export const LIVE_TV_TAB_HREF = "/(auth)/(tabs)/(livetv)/livetv/programs";
