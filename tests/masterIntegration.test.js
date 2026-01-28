const fs = require("fs");
const path = require("path");

const REQUIRED_SCENARIOS = [
  "User Onboarding & Profile",
  "Organization Lifecycle",
  "Calendar Creation & Sharing",
  "Calendar Permissions Enforcement",
  "Event Lifecycle",
  "MessageBoard Comments",
  "Calendar Views",
  "Event List Views",
  "Manage Access Flow",
  "Audit History",
  "Embed Widget",
  "Social Sharing & Export",
  "Monitoring & Admin Dashboards",
  "Fault Tolerance",
  "Home Page Experience",
];

const REQUIRED_DETAILS = [
  "feature flags",
  "permission",
  "audit logs",
  "embed",
  "operational metrics",
  "fault tolerance",
  "responsive layout",
];

describe("Master Integration Test documentation", () => {
  const mitPath = path.join(__dirname, "..", "MASTER_INTEGRATION_TEST.md");
  const mitContents = fs.readFileSync(mitPath, "utf8");

  test("includes all primary scenarios", () => {
    REQUIRED_SCENARIOS.forEach((scenario) => {
      expect(mitContents).toContain(`**${scenario}**`);
    });
  });

  test("documents detailed coverage expectations", () => {
    REQUIRED_DETAILS.forEach((detail) => {
      expect(mitContents.toLowerCase()).toContain(detail);
    });
  });

  test("lists all 15 numbered scenarios", () => {
    const scenarioLines = mitContents
      .split("\n")
      .filter((line) => /^\d+\.\s\*\*/.test(line));

    expect(scenarioLines).toHaveLength(15);
  });

  test("states coverage requirements", () => {
    expect(mitContents).toContain(">=95% branch coverage");
    expect(mitContents).toContain("No merge without updated MIT.");
  });
});
