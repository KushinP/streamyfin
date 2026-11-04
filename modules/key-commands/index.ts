import type { EventSubscription } from "expo-modules-core";
import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

/** A hardware keyboard shortcut. */
export type KeyCommand = {
  id: string;
  /** A single character, or "escape". */
  input: string;
  modifiers: ("command" | "shift" | "option" | "control")[];
  /** Shown in the iPad shortcut overlay (hold ⌘) and on the Mac. */
  title: string;
};

type KeyCommandsNativeModule = {
  setCommands(commands: KeyCommand[]): void;
  addListener(
    event: "onKeyCommand",
    listener: (event: { id: string }) => void,
  ): EventSubscription;
};

// iOS only (iPhone, iPad and the iPad app on a Mac), and wrapped so a build
// without the module simply has no shortcuts.
const KeyCommands: KeyCommandsNativeModule | null = (() => {
  if (Platform.OS !== "ios" || Platform.isTV) return null;
  try {
    return requireNativeModule<KeyCommandsNativeModule>("KeyCommands");
  } catch {
    return null;
  }
})();

/** Replaces the app's shortcuts with these. */
export const setKeyCommands = (commands: KeyCommand[]) =>
  KeyCommands?.setCommands(commands);

/** Called with a shortcut's id each time it is pressed. */
export const addKeyCommandListener = (
  listener: (id: string) => void,
): EventSubscription | null =>
  KeyCommands?.addListener("onKeyCommand", ({ id }) => listener(id)) ?? null;
