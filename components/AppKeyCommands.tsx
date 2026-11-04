import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import useRouter from "@/hooks/useAppRouter";
import { addKeyCommandListener, setKeyCommands } from "@/modules/key-commands";
import { APP_KEY_COMMANDS } from "@/utils/keyCommands";

/**
 * Registers the app's keyboard shortcuts (⌘1 to ⌘4 for the tabs, ⌘F,
 * ⌘, and ⌘[) and carries them out. Renders nothing; on a phone without a
 * keyboard the shortcuts simply never fire.
 */
export const AppKeyCommands = () => {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    setKeyCommands(
      APP_KEY_COMMANDS.map(({ id, input, modifiers, titleKey }) => ({
        id,
        input,
        modifiers,
        title: t(titleKey),
      })),
    );
    return () => setKeyCommands([]);
  }, [t]);

  useEffect(() => {
    const subscription = addKeyCommandListener((id) => {
      const command = APP_KEY_COMMANDS.find((c) => c.id === id);
      if (!command) return;
      const { action } = command;
      if (action.kind === "tab") router.navigate(action.href as never);
      else if (action.kind === "push") router.push(action.href as never);
      else if (router.canGoBack()) router.back();
    });
    return () => subscription?.remove();
  }, [router]);

  return null;
};
