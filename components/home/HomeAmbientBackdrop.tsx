import type { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { LinearGradient } from "expo-linear-gradient";
import { useAtomValue } from "jotai";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Image } from "@/components/common/ServerImage";
import { HomeAmbientColors, ParallaxPageColors } from "@/constants/Colors";
import {
  HOME_AMBIENT_BLUR_RADIUS,
  HOME_AMBIENT_CROSSFADE_MS,
  HOME_AMBIENT_DEBOUNCE_MS,
  HOME_AMBIENT_IMAGE_QUALITY,
  HOME_AMBIENT_IMAGE_WIDTH,
  HOME_AMBIENT_OPACITY,
} from "@/constants/HomeAmbient";
import { apiAtom } from "@/utils/atoms/api";
import { getBackdropUrl } from "@/utils/jellyfin/image/getBackdropUrl";

/**
 * A blurred copy of the hero slide on screen, behind the whole Home page,
 * fading to black under the rows. It follows the hero once a swipe has
 * rested and crossfades between slides on two layers, so the page never
 * flashes black in between.
 */
export const HomeAmbientBackdrop = memo(
  ({ item }: { item: BaseItemDto | null }) => {
    const api = useAtomValue(apiAtom);
    const [shown, setShown] = useState<BaseItemDto | null>(item);

    // A fast run of swipes settles on the last slide, not every one.
    useEffect(() => {
      const timer = setTimeout(() => setShown(item), HOME_AMBIENT_DEBOUNCE_MS);
      return () => clearTimeout(timer);
    }, [item]);

    const url = useMemo(
      () =>
        getBackdropUrl({
          api,
          item: shown,
          quality: HOME_AMBIENT_IMAGE_QUALITY,
          width: HOME_AMBIENT_IMAGE_WIDTH,
        }),
      [api, shown],
    );

    // The layer shown flips as each fade starts, so an image that lands
    // mid-fade fades in over the outgoing one (as TVHomeBackdrop does).
    const active = useRef<0 | 1>(1);
    const [urls, setUrls] = useState<[string | null, string | null]>([
      null,
      null,
    ]);
    const opacity = useRef([
      new Animated.Value(0),
      new Animated.Value(0),
    ]).current;

    useEffect(() => {
      if (!url) return;
      const incoming = active.current === 0 ? 1 : 0;
      active.current = incoming;
      setUrls((current) => {
        const next: [string | null, string | null] = [...current];
        next[incoming] = url;
        return next;
      });
      const fade = Animated.parallel([
        Animated.timing(opacity[incoming], {
          toValue: 1,
          duration: HOME_AMBIENT_CROSSFADE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity[incoming === 0 ? 1 : 0], {
          toValue: 0,
          duration: HOME_AMBIENT_CROSSFADE_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]);
      fade.start();
      return () => fade.stop();
    }, [url, opacity]);

    return (
      <View
        pointerEvents='none'
        style={StyleSheet.absoluteFill}
        testID='home-ambient-backdrop'
      >
        {urls.map((layerUrl, index) =>
          layerUrl ? (
            <Animated.View
              // Two fixed layers: the index is their identity.
              key={index}
              style={[StyleSheet.absoluteFill, { opacity: opacity[index] }]}
            >
              <Image
                testID={`home-ambient-layer-${index}`}
                source={{ uri: layerUrl }}
                style={[styles.image, { opacity: HOME_AMBIENT_OPACITY }]}
                contentFit='cover'
                blurRadius={HOME_AMBIENT_BLUR_RADIUS}
              />
            </Animated.View>
          ) : null,
        )}
        <LinearGradient
          colors={[
            ParallaxPageColors.clear,
            HomeAmbientColors.scrim,
            ParallaxPageColors.background,
          ]}
          locations={[0, 0.45, 0.85]}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  image: { width: "100%", height: "100%" },
});
