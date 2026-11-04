import { atom } from "jotai";
import type { KeyCommand } from "@/modules/key-commands";

/**
 * Shortcuts the screen on top adds while it is open (multiview's number keys
 * and G), on top of the app-wide ⌘ ones. Bare keys are only safe while that
 * screen is up: anywhere else they would be taken from the Search field.
 */
export type ScreenKeyCommands = {
  commands: KeyCommand[];
  onCommand: (id: string) => void;
};

export const screenKeyCommandsAtom = atom<ScreenKeyCommands | null>(null);
