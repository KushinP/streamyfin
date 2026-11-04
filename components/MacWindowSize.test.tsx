import { render } from "@testing-library/react-native";
import { MAC_MIN_WINDOW_HEIGHT, MAC_MIN_WINDOW_WIDTH } from "@/constants/Mac";
import { MacWindowSize } from "./MacWindowSize";

const mockSetMinimumWindowSize = jest.fn();
jest.mock("@/modules/key-commands", () => ({
  setMinimumWindowSize: (width: number, height: number) =>
    mockSetMinimumWindowSize(width, height),
}));
let mockIsMac = true;
jest.mock("@/utils/platform", () => ({ isMac: () => mockIsMac }));

describe("MacWindowSize", () => {
  beforeEach(() => jest.clearAllMocks());

  test("on the Mac, keeps the window at least the minimum size", async () => {
    mockIsMac = true;
    await render(<MacWindowSize />);
    expect(mockSetMinimumWindowSize).toHaveBeenCalledWith(
      MAC_MIN_WINDOW_WIDTH,
      MAC_MIN_WINDOW_HEIGHT,
    );
  });

  test("on an iPad, leaves Split View and Slide Over sizes alone", async () => {
    mockIsMac = false;
    await render(<MacWindowSize />);
    expect(mockSetMinimumWindowSize).not.toHaveBeenCalled();
  });
});
