import { type ConfigPlugin, withEntitlementsPlist } from "expo/config-plugins";

/**
 * Entitlements a free Apple ID (a "Personal Team" in Xcode, or SideStore and
 * AltStore) cannot sign. Push is off in this fork anyway; without the Wi-Fi
 * entitlement the automatic switch to the local server address never sees
 * the home network, and the app keeps using the address it has.
 */
export const PAID_ONLY_ENTITLEMENTS = [
  "aps-environment",
  "com.apple.developer.networking.wifi-info",
] as const;

export const stripPaidEntitlements = <T extends Record<string, unknown>>(
  entitlements: T,
): T => {
  const kept = { ...entitlements };
  for (const key of PAID_ONLY_ENTITLEMENTS) delete kept[key];
  return kept;
};

/**
 * Builds SuperFin for signing with a free Apple ID: SUPERFIN_FREE_SIGNING=1
 * at prebuild. See docs/sideloading.md.
 */
const withFreeSigning: ConfigPlugin = (config) =>
  withEntitlementsPlist(config, (mod) => {
    mod.modResults = stripPaidEntitlements(mod.modResults);
    return mod;
  });

export default withFreeSigning;
