jest.mock("@/utils/customHeaders", () =>
  jest.requireActual("@/test-utils/customHeaders").customHeadersModule(),
);

import { MULTIVIEW_TILE_CACHE } from "@/constants/Multiview";
import { setJellyfinHeaders } from "@/test-utils/customHeaders";
import { buildTileSource } from "./tileSource";

const SERVER = "https://jf.example.com";

describe("buildTileSource", () => {
  afterEach(() => setJellyfinHeaders({}));

  test("sends the Jellyfin token with a stream from the server", () => {
    const source = buildTileSource(
      {
        url: `${SERVER}/Videos/1/stream`,
        sessionId: "s",
        mediaSource: { Protocol: "File" },
      },
      { basePath: SERVER, accessToken: "tok" },
    );
    expect(source.headers?.Authorization).toBe('MediaBrowser Token="tok"');
  });

  test("never sends the token or proxy headers to a remote stream", () => {
    setJellyfinHeaders({ "X-Proxy": "secret" }, SERVER);
    const source = buildTileSource(
      {
        url: "https://elsewhere.example.org/live.ts",
        sessionId: "s",
        mediaSource: { IsRemote: true, Protocol: "Http" },
      },
      { basePath: SERVER, accessToken: "tok" },
    );
    expect(source.headers?.Authorization).toBeUndefined();
    expect(source.headers?.["X-Proxy"]).toBeUndefined();
  });

  test("uses the small per-tile buffer, since every tile is its own player", () => {
    const source = buildTileSource(
      { url: `${SERVER}/x`, sessionId: null, mediaSource: undefined },
      { basePath: SERVER, accessToken: undefined },
    );
    expect(source.cacheConfig).toEqual(MULTIVIEW_TILE_CACHE);
    expect(source.autoplay).toBe(true);
  });
});
