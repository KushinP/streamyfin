import { stripPaidEntitlements } from "./withFreeSigning";

// expo/config-plugins pulls in the xcode package, which Jest cannot parse;
// only the entitlements edit is under test here.
jest.mock("expo/config-plugins", () => ({
  withEntitlementsPlist: (config: unknown) => config,
}));

describe("stripPaidEntitlements", () => {
  test("drops what a free Apple ID cannot sign and keeps the rest", () => {
    expect(
      stripPaidEntitlements({
        "aps-environment": "development",
        "com.apple.developer.networking.wifi-info": true,
        "com.apple.security.application-groups": [
          "group.com.kushagra.superfin",
        ],
      }),
    ).toEqual({
      "com.apple.security.application-groups": ["group.com.kushagra.superfin"],
    });
  });
});
