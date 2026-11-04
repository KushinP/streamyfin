import { pushProjectId } from "./pushProjectId";

describe("pushProjectId", () => {
  test("is the EAS project this build was configured with", () => {
    expect(pushProjectId({ extra: { eas: { projectId: "abc-123" } } })).toBe(
      "abc-123",
    );
  });

  test("is nothing without an EAS project, so no token is asked for", () => {
    // The fork dropped upstream's project id: a token for it would deliver
    // the fork's notifications through someone else's project.
    expect(pushProjectId({ extra: {} })).toBeUndefined();
    expect(pushProjectId({})).toBeUndefined();
    expect(pushProjectId(null)).toBeUndefined();
    expect(
      pushProjectId({ extra: { eas: { projectId: "" } } }),
    ).toBeUndefined();
  });
});
