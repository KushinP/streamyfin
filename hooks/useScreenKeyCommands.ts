import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import type { KeyCommand } from "@/modules/key-commands";
import { screenKeyCommandsAtom } from "@/utils/atoms/screenKeyCommands";

/**
 * Adds a screen's own keyboard shortcuts while it is mounted. The handler is
 * read through a ref, so a new closure every render does not re-register the
 * commands with the native side.
 */
export const useScreenKeyCommands = (
  commands: KeyCommand[],
  onCommand: (id: string) => void,
) => {
  const setScreenCommands = useSetAtom(screenKeyCommandsAtom);
  const handler = useRef(onCommand);
  handler.current = onCommand;
  const signature = JSON.stringify(commands);

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the commands' content, not their array identity
  useEffect(() => {
    setScreenCommands({ commands, onCommand: (id) => handler.current(id) });
    return () => setScreenCommands(null);
  }, [signature, setScreenCommands]);
};
