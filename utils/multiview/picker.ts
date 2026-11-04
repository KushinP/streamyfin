import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";

/** The multiview picker's two lists: live channels, and the library. */
export type MultiviewPickerTab = "tv" | "media";

/**
 * Narrows the channel list to a search. Channels are all on hand already, so
 * this runs on every keystroke instead of asking the server. A channel matches
 * on its name, its number, or what is on it now, so typing a show's name finds
 * the channel showing it.
 */
export const filterChannels = (
  channels: BaseItemDto[],
  query: string,
): BaseItemDto[] => {
  const wanted = query.trim().toLowerCase();
  if (!wanted) return channels;
  return channels.filter((channel) =>
    [channel.Name, channel.ChannelNumber, channel.CurrentProgram?.Name].some(
      (field) => field?.toLowerCase().includes(wanted),
    ),
  );
};
