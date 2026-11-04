import { loadXcodeEnv, XCODE_ENV_LINES } from "./withSentryXcodeEnv";

// expo/config-plugins pulls in the xcode package, which Jest cannot parse;
// only the script edit is under test here.
jest.mock("expo/config-plugins", () => ({
  withXcodeProject: (config: unknown) => config,
}));

// The ${...} below are shell parameter expansions, not template slots.
const NODE_LOOKUP = "$" + "{NODE_BINARY:-node}";
const sentryScript = JSON.stringify(
  `export SENTRY_DISABLE_AUTO_UPLOAD=true\n/bin/sh "\`${NODE_LOOKUP} --print "x"\`"`,
);

describe("loadXcodeEnv", () => {
  test("loads the project's node path before Sentry's step needs it", () => {
    const script = JSON.parse(loadXcodeEnv(sentryScript)) as string;
    expect(script.startsWith(XCODE_ENV_LINES)).toBe(true);
    expect(script).toContain(NODE_LOOKUP);
  });

  test("keeps the project file valid for a freshly created, quoted step", () => {
    // How the xcode library holds a step Sentry has just added: wrapped in
    // quotes with \" escapes, newlines left raw.
    const fresh = `"export SENTRY_DISABLE_AUTO_UPLOAD=true\n/bin/sh \\"x\\""`;
    const script = loadXcodeEnv(fresh);
    expect(
      script.startsWith(`"${JSON.stringify(XCODE_ENV_LINES).slice(1, -1)}`),
    ).toBe(true);
    expect(script.endsWith(fresh.slice(1))).toBe(true);
    // Every quote inside the outer pair stays escaped.
    expect(script.slice(1, -1)).not.toMatch(/(^|[^\\])"/);
  });

  test("handles a raw script", () => {
    const raw = JSON.parse(sentryScript) as string;
    const script = loadXcodeEnv(raw);
    expect(script.startsWith(XCODE_ENV_LINES)).toBe(true);
    expect(script.endsWith(raw)).toBe(true);
    expect(loadXcodeEnv(script)).toBe(script);
  });

  test("leaves a step that already loads it alone", () => {
    const once = loadXcodeEnv(sentryScript);
    expect(loadXcodeEnv(once)).toBe(once);
  });
});
