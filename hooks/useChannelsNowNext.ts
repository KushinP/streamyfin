import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { getLiveTvApi } from "@jellyfin/sdk/lib/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import {
  LIVE_TV_NEXT_LOOKAHEAD_MS,
  LIVE_TV_NOW_NEXT_STALE_MS,
} from "@/constants/LiveTv";
import { useLiveTvClock } from "@/hooks/useLiveTvClock";
import { apiAtom } from "@/utils/atoms/api";
import { nextProgramByChannel } from "@/utils/livetv/nowNext";

/**
 * The next program on each of the given channels, in one request, plus a
 * clock for the list's progress bars that moves once a minute.
 */
export const useChannelsNowNext = (channelIds: string[]) => {
  const api = useAtomValue(apiAtom);
  const now = useLiveTvClock();

  // Sorted so the same channels in another order are the same request.
  const ids = useMemo(() => [...channelIds].sort(), [channelIds]);

  const { data: programs } = useQuery({
    queryKey: ["livetv", "channels", "next", ids],
    queryFn: async ({ signal }) => {
      const from = new Date();
      const res = await getLiveTvApi(api!).getPrograms(
        {
          getProgramsDto: {
            ChannelIds: ids,
            MinStartDate: from.toISOString(),
            MaxStartDate: new Date(
              from.getTime() + LIVE_TV_NEXT_LOOKAHEAD_MS,
            ).toISOString(),
            SortBy: ["StartDate"],
            EnableImages: false,
            EnableUserData: false,
            EnableTotalRecordCount: false,
          },
        },
        { signal },
      );
      return res.data.Items ?? [];
    },
    enabled: !!api && ids.length > 0,
    staleTime: LIVE_TV_NOW_NEXT_STALE_MS,
    refetchInterval: LIVE_TV_NOW_NEXT_STALE_MS,
  });

  const next = useMemo(
    () => nextProgramByChannel(programs as BaseItemDto[] | undefined, now),
    [programs, now],
  );

  return { next, now };
};
