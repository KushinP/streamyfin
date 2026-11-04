import { render } from "@testing-library/react-native";
import { AppKeyCommands } from "./AppKeyCommands";

const mockSetCommands = jest.fn();
let mockListener: ((id: string) => void) | null = null;
jest.mock("@/modules/key-commands", () => ({
  setKeyCommands: (commands: unknown) => mockSetCommands(commands),
  addKeyCommandListener: (listener: (id: string) => void) => {
    mockListener = listener;
    return { remove: () => (mockListener = null) };
  },
}));
const mockRouter = {
  navigate: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
};
jest.mock("@/hooks/useAppRouter", () => ({
  __esModule: true,
  default: () => mockRouter,
}));
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => `t:${key}` }),
}));

describe("AppKeyCommands", () => {
  beforeEach(() => jest.clearAllMocks());

  test("registers the shortcuts with translated titles", async () => {
    await render(<AppKeyCommands />);
    expect(mockSetCommands).toHaveBeenCalledWith(
      expect.arrayContaining([
        {
          id: "tab-search",
          input: "2",
          modifiers: ["command"],
          title: "t:tabs.search",
        },
        {
          id: "settings",
          input: ",",
          modifiers: ["command"],
          title: "t:tabs.settings",
        },
      ]),
    );
  });

  test("⌘2 and ⌘F open Search, ⌘, opens Settings", async () => {
    await render(<AppKeyCommands />);
    mockListener?.("tab-search");
    mockListener?.("search");
    mockListener?.("settings");
    expect(mockRouter.navigate).toHaveBeenNthCalledWith(
      1,
      "/(auth)/(tabs)/(search)",
    );
    expect(mockRouter.navigate).toHaveBeenNthCalledWith(
      2,
      "/(auth)/(tabs)/(search)",
    );
    expect(mockRouter.push).toHaveBeenCalledWith("/(auth)/settings");
  });

  test("⌘[ goes back only when there is somewhere to go", async () => {
    await render(<AppKeyCommands />);
    mockListener?.("back");
    expect(mockRouter.back).toHaveBeenCalledTimes(1);

    mockRouter.canGoBack.mockReturnValueOnce(false);
    mockListener?.("back");
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  test("takes the shortcuts away when it unmounts", async () => {
    const view = await render(<AppKeyCommands />);
    await view.unmount();
    expect(mockSetCommands).toHaveBeenLastCalledWith([]);
    expect(mockListener).toBeNull();
  });
});
