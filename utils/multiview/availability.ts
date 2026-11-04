/**
 * Whether this build can run multiview: iPhone, iPad and Mac only.
 *
 * Android's MPV player takes a process-wide lock (`MpvOwnership.kt`), so a
 * second tile would wait on it forever while its server stream, and for a
 * live channel its tuner, stayed open. The TV builds have no multiview screen.
 */
export const isMultiviewAvailable = (platform: {
  OS: string;
  isTV?: boolean;
}): boolean => platform.OS === "ios" && !platform.isTV;
