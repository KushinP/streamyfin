import { totalMemory } from "expo-device";
import {
  TV_BACKDROP_QUALITY,
  TV_BACKDROP_WIDTH,
  TV_LOW_MEMORY_BACKDROP_QUALITY,
  TV_LOW_MEMORY_BACKDROP_WIDTH,
  TV_LOW_MEMORY_BYTES,
} from "@/constants/TVSizes";

/**
 * The size and quality the TV Home backdrop asks for: lighter on a low
 * memory device. Unknown memory counts as enough.
 */
export const tvBackdropRequest = (memory: number | null = totalMemory) =>
  memory !== null && memory < TV_LOW_MEMORY_BYTES
    ? {
        width: TV_LOW_MEMORY_BACKDROP_WIDTH,
        quality: TV_LOW_MEMORY_BACKDROP_QUALITY,
      }
    : { width: TV_BACKDROP_WIDTH, quality: TV_BACKDROP_QUALITY };
