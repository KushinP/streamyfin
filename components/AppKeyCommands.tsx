import { useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import useRouter from "@/hooks/useAppRouter";
import { addKeyCommandListener, setKeyCommands } from "@/modules/key-commands";
import { screenKeyCommandsAtom } from "@/utils/atoms/screenKeyCommands";
import { APP_KEY_COMMANDS } from "@/utils/keyCommands";

/**
 * Registers the app's keyboard shortcuts (⌘1 to ⌘4 for the tabs, ⌘F,
 * ⌘, and ⌘[), plus those of the screen on top (useScreenKeyCommands), and
 * carries them out. Renders nothing; on a phone without a keyboard the
 * shortcuts simply never fire.
 */
export const AppKeyCommands = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const screen = useAtomValue(screenKeyCommandsAtom);
  // The listener is set up once; it reads the screen's handler from here.
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    setKeyCommands([
      ...APP_KEY_COMMANDS.map(({ id, input, modifiers, titleKey }) => ({
        id,
        input,
        modifiers,
        title: t(titleKey),
      })),
      ...(screen?.commands ?? []),
    ]);
    return () => setKeyCommands([]);
  }, [t, screen]);

  useEffect(() => {
    const subscription = addKeyCommandListener((id) => {
      const command = APP_KEY_COMMANDS.find((c) => c.id === id);
      if (!command) {
        screenRef.current?.onCommand(id);
        return;
      }
      const { action } = command;
      if (action.kind === "tab") router.navigate(action.href as never);
      else if (action.kind === "push") router.push(action.href as never);
      else if (router.canGoBack()) router.back();
    });
    return () => subscription?.remove();
  }, [router]);

  return null;
};
