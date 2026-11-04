import { type ConfigPlugin, withXcodeProject } from "expo/config-plugins";

/**
 * The lines every React Native build step starts with, so the step finds
 * Node: Xcode runs its steps with a bare PATH, and `.xcode.env(.local)`
 * carry the project's node path.
 */
export const XCODE_ENV_LINES =
  '. "$SRCROOT/.xcode.env"\n[ -f "$SRCROOT/.xcode.env.local" ] && . "$SRCROOT/.xcode.env.local"\n';

/**
 * Sentry's "Upload Debug Symbols to Sentry" step looks Node up on PATH and
 * skips `.xcode.env`, so pressing Run in Xcode failed with
 * `node: command not found` (a terminal build has Node on its PATH and
 * passed).
 *
 * The script reaches this mod already quoted, in one of two ways: JSON
 * (Sentry's rewrite of an existing step) or the xcode library's own quoting
 * of a step Sentry just added (\" escapes, raw newlines). Inserting the
 * lines escaped, just inside the opening quote, is valid in both and keeps
 * the project file parseable.
 */
export const loadXcodeEnv = (shellScript: string): string => {
  if (shellScript.includes(".xcode.env")) return shellScript;
  if (!shellScript.startsWith('"')) return XCODE_ENV_LINES + shellScript;
  const escapedLines = JSON.stringify(XCODE_ENV_LINES).slice(1, -1);
  return `"${escapedLines}${shellScript.slice(1)}`;
};

/**
 * First in the plugin list (app.config.ts), since mods run in reverse order:
 * this one then runs after Sentry's plugin has written the step.
 */
const withSentryXcodeEnv: ConfigPlugin = (config) =>
  withXcodeProject(config, (mod) => {
    const phase = mod.modResults.pbxItemByComment(
      "Upload Debug Symbols to Sentry",
      "PBXShellScriptBuildPhase",
    );
    if (phase?.shellScript) phase.shellScript = loadXcodeEnv(phase.shellScript);
    return mod;
  });

export default withSentryXcodeEnv;
