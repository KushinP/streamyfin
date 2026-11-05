import { getUserViewApi } from "@jellyfin/sdk/lib/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { apiAtom, userAtom } from "@/utils/atoms/api";
import { useSettings } from "@/utils/atoms/settings";
import { hasLiveTv } from "@/utils/liveTv";

/** Whether the Live TV tab shows: see hasLiveTv. */
export const useLiveTvAvailable = () => {
  const api = useAtomValue(apiAtom);
  const user = useAtomValue(userAtom);
  const { settings } = useSettings();
  // The Library page's query: same key, so the two share one request.
  const { data } = useQuery({
    queryKey: ["user-views", user?.Id],
    queryFn: async () => {
      const response = await getUserViewApi(api!).getUserViews({
        userId: user?.Id,
      });
      return response.data.Items || null;
    },
    staleTime: 60,
    enabled: !!api && !!user?.Id,
  });
  return hasLiveTv(data, settings?.hiddenLibraries);
};
