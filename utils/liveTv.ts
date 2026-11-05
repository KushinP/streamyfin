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
