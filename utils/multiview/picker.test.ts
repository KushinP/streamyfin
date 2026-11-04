import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { filterChannels } from "./picker";

const channels: BaseItemDto[] = [
  {
    Id: "c-1",
    Name: "WBZ-DT",
    ChannelNumber: "4.1",
    CurrentProgram: { Name: "WBZ News" },
  },
  {
    Id: "c-2",
    Name: "WFXT",
    ChannelNumber: "25.1",
    CurrentProgram: { Name: "The Simpsons" },
  },
  { Id: "c-3", Name: "WBZ 4.2", ChannelNumber: "4.2" },
];

const ids = (items: BaseItemDto[]) => items.map((item) => item.Id);

describe("filterChannels", () => {
  test("an empty search lists every channel", () => {
    expect(ids(filterChannels(channels, ""))).toEqual(["c-1", "c-2", "c-3"]);
    expect(ids(filterChannels(channels, "   "))).toEqual(["c-1", "c-2", "c-3"]);
  });

  test("matches the channel name, ignoring case", () => {
    expect(ids(filterChannels(channels, "wfx"))).toEqual(["c-2"]);
  });

  test("matches what is on now, so a show can be found by name", () => {
    expect(ids(filterChannels(channels, "simpsons"))).toEqual(["c-2"]);
  });

  test("matches the channel number", () => {
    expect(ids(filterChannels(channels, "4.2"))).toEqual(["c-3"]);
  });

  test("ignores the spaces around a search", () => {
    expect(ids(filterChannels(channels, "  news "))).toEqual(["c-1"]);
  });

  test("a channel with no guide data is still matched by name", () => {
    expect(ids(filterChannels(channels, "wbz 4"))).toEqual(["c-3"]);
  });
});
