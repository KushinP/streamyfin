import { act, render } from "@testing-library/react-native";
import { createStore, Provider } from "jotai";
import { screenKeyCommandsAtom } from "@/utils/atoms/screenKeyCommands";
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
  test("adds a screen's own shortcuts while it is open, and hands them back", async () => {
    const store = createStore();
    const onCommand = jest.fn();
    await render(
      <Provider store={store}>
        <AppKeyCommands />
      </Provider>,
    );
    await act(async () =>
      store.set(screenKeyCommandsAtom, {
        commands: [
          {
            id: "multiview-layout",
            input: "g",
            modifiers: [],
            title: "Change layout",
          },
        ],
        onCommand,
      }),
    );
    expect(mockSetCommands).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "tab-home" }),
        {
          id: "multiview-layout",
          input: "g",
          modifiers: [],
          title: "Change layout",
        },
      ]),
    );
    mockListener?.("multiview-layout");
    expect(onCommand).toHaveBeenCalledWith("multiview-layout");
    expect(mockRouter.navigate).not.toHaveBeenCalled();

    await act(async () => store.set(screenKeyCommandsAtom, null));
    const last = mockSetCommands.mock.calls.at(-1)?.[0] as { id: string }[];
    expect(last.some((c) => c.id === "multiview-layout")).toBe(false);
  });
});
