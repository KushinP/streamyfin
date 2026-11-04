import { useEffect, useState } from "react";
import { LIVE_TV_PROGRESS_TICK_MS } from "@/constants/LiveTv";

/**
 * The time, moved on once a minute: one clock for a whole Live TV list
 * (progress bars, the guide's now line), not one per row.
 */
export const useLiveTvClock = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(
      () => setNow(Date.now()),
      LIVE_TV_PROGRESS_TICK_MS,
    );
    return () => clearInterval(timer);
  }, []);
  return now;
};
