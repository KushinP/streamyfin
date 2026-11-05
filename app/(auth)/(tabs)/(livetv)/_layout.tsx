import { Stack } from "expo-router";
import {
  nestedTabPageScreenOptions,
  stackScreenOptions,
} from "@/components/stacks/NestedTabPageStack";

// The Live TV tab opens straight on the Live TV screen (programs, guide,
// channels, recordings), which lives in the shared group so the shows and
// people it links to open inside this tab too.
export const unstable_settings = { initialRouteName: "livetv" };

export default function LiveTvTabLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen name='livetv' />
      {Object.entries(nestedTabPageScreenOptions).map(([name, options]) => (
        <Stack.Screen key={name} name={name} options={options} />
      ))}
    </Stack>
  );
}
