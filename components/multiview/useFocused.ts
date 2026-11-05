import { useCallback, useState } from "react";

/**
 * Whether a control has the TV remote's focus, for multiview's controls:
 * they were built for touch and showed nothing when focused.
 */
export const useFocused = (onFocusChange?: (focused: boolean) => void) => {
  const [focused, setFocused] = useState(false);
  const onFocus = useCallback(() => {
    setFocused(true);
    onFocusChange?.(true);
  }, [onFocusChange]);
  const onBlur = useCallback(() => {
    setFocused(false);
    onFocusChange?.(false);
  }, [onFocusChange]);
  return { focused, onFocus, onBlur };
};
