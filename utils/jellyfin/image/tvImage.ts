import { TV_IMAGE_OVERSAMPLE } from "@/constants/Images";
import { toImagePixels } from "./imagePixels";

/** Width, in pixels, to ask the server for a TV card this wide in points. */
export const tvImageWidth = (layoutWidth: number) =>
  Math.round(toImagePixels(layoutWidth) * TV_IMAGE_OVERSAMPLE);
