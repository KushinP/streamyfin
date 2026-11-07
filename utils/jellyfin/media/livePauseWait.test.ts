import { LIVE_PAUSE_WAIT_SECONDS } from "@/constants/Playback";
import { livePauseWait } from "./livePauseWait";

describe("livePauseWait", () => {
  test("a live channel, or a program played through one, gets the cushion", () => {
    expect(livePauseWait({ Type: "TvChannel" })).toBe(LIVE_PAUSE_WAIT_SECONDS);
    expect(livePauseWait({ Type: "Program" })).toBe(LIVE_PAUSE_WAIT_SECONDS);
  });

  test("a movie or an episode keeps MPV's default and starts at once", () => {
    expect(livePauseWait({ Type: "Movie" })).toBeUndefined();
    expect(livePauseWait({ Type: "Episode" })).toBeUndefined();
    expect(livePauseWait(undefined)).toBeUndefined();
  });
});
