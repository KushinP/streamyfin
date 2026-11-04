import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");

// Lints a probe file in the repo (a stdin lint does not run plugins) and
// returns the lines the rule flagged.
const flaggedLines = (source: string): number[] => {
  const dir = fs.mkdtempSync(path.join(ROOT, "components/.lint-probe-"));
  const file = path.join(dir, "Probe.tsx");
  fs.writeFileSync(file, source);
  try {
    const result = spawnSync(
      "bunx",
      ["biome", "lint", "--colors=off", "--max-diagnostics=100", file],
      { cwd: ROOT, encoding: "utf8" },
    );
    const output = `${result.stdout}${result.stderr}`;
    // A Biome that never ran reports nothing, which every allowed case would
    // take as a pass.
    if (result.error || !output.includes("Checked 1 file")) {
      throw new Error(
        `biome lint did not check the probe: ${result.error ?? output}`,
      );
    }
    return [...output.matchAll(/Probe\.tsx:(\d+):\d+ plugin/g)].map((m) =>
      Number(m[1]),
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

describe("header-no-touchable-opacity", () => {
  test("flags a TouchableOpacity in a header button, and only there", () => {
    const lines = flaggedLines(
      [
        'import { TouchableOpacity, View } from "react-native";',
        "export const options = {",
        "  headerRight: () => (",
        "    <TouchableOpacity onPress={() => {}}>",
        "      <View />",
        "    </TouchableOpacity>",
        "  ),",
        "  headerLeft: () => <TouchableOpacity onPress={() => {}} />,",
        "  title: () => <TouchableOpacity onPress={() => {}} />,",
        "};",
        "",
      ].join("\n"),
    );
    expect(lines).toEqual([4, 8]);
  });
});
