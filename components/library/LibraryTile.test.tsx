import { render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { LibraryTile } from "./LibraryTile";

jest.mock("@/components/common/ServerImage", () => ({ Image: () => null }));
jest.mock("@/utils/atoms/api", () => ({
  apiAtom: require("jotai").atom(null),
}));

let mockShowStats = true;
jest.mock("@/utils/atoms/settings", () => ({
  useSettings: () => ({
    settings: { libraryOptions: { showStats: mockShowStats } },
  }),
}));
jest.mock("./LibraryItemCard", () => ({
  libraryIcons: {},
  useLibraryStats: () => ({ itemsCount: 412, itemTypeName: "Movies" }),
}));
jest.mock("@/components/common/TouchableItemRouter", () => {
  const { View } = require("react-native");
  return {
    TouchableItemRouter: ({
      children,
      testID,
    }: {
      children: ReactNode;
      testID?: string;
    }) => <View testID={testID}>{children}</View>,
  };
});
let mockUrl: string | null = "https://server/Items/movies/Images/Primary";
jest.mock("@/utils/jellyfin/image/getPrimaryImageUrl", () => ({
  getPrimaryImageUrl: () => mockUrl,
}));

const movies = {
  Id: "movies",
  Name: "Movies",
  CollectionType: "movies" as const,
};

describe("LibraryTile", () => {
  beforeEach(() => {
    mockShowStats = true;
    mockUrl = "https://server/Items/movies/Images/Primary";
  });

  test("over art, adds only the count: the art carries the name", async () => {
    await render(<LibraryTile library={movies} width={320} />);
    expect(screen.getByTestId("library-tile-movies")).toBeTruthy();
    expect(screen.getByText("412 Movies")).toBeTruthy();
    expect(screen.queryByText("Movies")).toBeNull();
  });

  test("without art, shows the name as well", async () => {
    mockUrl = null;
    await render(<LibraryTile library={movies} width={320} />);
    expect(screen.getByText("Movies")).toBeTruthy();
    expect(screen.getByText("412 Movies")).toBeTruthy();
  });

  test("leaves the count out when stats are turned off", async () => {
    mockShowStats = false;
    await render(<LibraryTile library={movies} width={320} />);
    expect(screen.queryByText("412 Movies")).toBeNull();
  });
});
