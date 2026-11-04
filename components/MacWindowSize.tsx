import { useEffect } from "react";
import { MAC_MIN_WINDOW_HEIGHT, MAC_MIN_WINDOW_WIDTH } from "@/constants/Mac";
import { setMinimumWindowSize } from "@/modules/key-commands";
import { isMac } from "@/utils/platform";

/**
 * Keeps the Mac window from shrinking below the size the layouts were
 * checked at. Only on the Mac: an iPad's Split View and Slide Over widths
 * must stay available. Renders nothing.
 */
export const MacWindowSize = () => {
  useEffect(() => {
    if (isMac())
      setMinimumWindowSize(MAC_MIN_WINDOW_WIDTH, MAC_MIN_WINDOW_HEIGHT);
  }, []);
  return null;
};
