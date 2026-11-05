import { useCallback, useEffect, useRef, useState } from "react";
import { TV_NAV_BAR_HIDE_DELAY_MS } from "@/constants/TVNavBar";

/**
 * Whether the Android TV top bar shows, as Apple TV's tab bar does: on screen
 * while one of its tabs has focus (and when the screen opens), gone once
 * focus moves down into the page, back when Up brings focus to it again.
 * Without this it floated over the content as the page scrolled.
 */
export const useNavBarPresence = () => {
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
  };

  const onItemFocus = useCallback(() => {
    cancelHide();
    setVisible(true);
  }, []);

  const onItemBlur = useCallback(() => {
    cancelHide();
    // Moving between tabs blurs one before focusing the next.
    hideTimer.current = setTimeout(
      () => setVisible(false),
      TV_NAV_BAR_HIDE_DELAY_MS,
    );
  }, []);

  useEffect(() => cancelHide, []);

  return { visible, onItemFocus, onItemBlur };
};
