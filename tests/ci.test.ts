import { test, expect, describe } from "bun:test";
import * as fs from "fs";
import * as path from "path";

describe("CI Workflow Quality", () => {
  const workflowsDir = path.join(process.cwd(), ".github", "workflows");

  function getTestsWorkflowPath(): string {
    const files = fs
      .readdirSync(workflowsDir)
      .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));

    const matches = files.filter((file) => {
      const fullPath = path.join(workflowsDir, file);
      const content = fs.readFileSync(fullPath, "utf8");
      return /^name:\s*Tests\s*$/im.test(content);
    });

    expect(matches.length).toBe(1);
    return path.join(workflowsDir, matches[0]);
  }

  test("only one tests workflow exists", () => {
    const files = fs
      .readdirSync(workflowsDir)
      .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));

    const testsNamed = files.filter((file) => {
      const fullPath = path.join(workflowsDir, file);
      const content = fs.readFileSync(fullPath, "utf8");
      return /name:\s*Tests/i.test(content);
    });

    expect(testsNamed.length).toBe(1);
  });

  test("tests workflow does not mask failing tests", () => {
    const testsWorkflow = getTestsWorkflowPath();
    const content = fs.readFileSync(testsWorkflow, "utf8");

    expect(content).not.toContain("|| true");
    expect(content).not.toContain("||true");
    expect(content).not.toContain("|| exit 0");
    expect(content).not.toContain("set +e");
    expect(content).not.toContain("continue-on-error: true");
  });
});
