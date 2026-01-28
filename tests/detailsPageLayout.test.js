const fs = require("fs");
const path = require("path");

describe("feature preview layout", () => {
  test("details page uses the feature preview grid container", () => {
    const html = fs.readFileSync(
      path.join(__dirname, "..", "client", "details.html"),
      "utf8"
    );

    expect(html).toContain('class="main feature-preview"');
  });

  test("styles define the feature preview grid rules", () => {
    const css = fs.readFileSync(
      path.join(__dirname, "..", "client", "styles.css"),
      "utf8"
    );

    expect(css).toMatch(/\.main\.feature-preview\s*\{/);
    expect(css).toMatch(/grid-template-columns:\s*repeat\(2/);
    expect(css).toMatch(/@media \(max-width: 1024px\)/);
  });
});
