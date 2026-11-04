/**
 * The EAS project an Expo push token is asked for, from the build's own
 * config (`app.json` `extra.eas.projectId`). Nothing when the build has none:
 * SuperFin dropped upstream Streamyfin's project, and a token for that one
 * would route this app's notifications through someone else's project.
 */
export const pushProjectId = (
  expoConfig: { extra?: { eas?: { projectId?: string } } } | null | undefined,
): string | undefined => expoConfig?.extra?.eas?.projectId || undefined;
