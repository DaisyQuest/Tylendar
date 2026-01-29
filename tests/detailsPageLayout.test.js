const fs = require("fs");
const path = require("path");

describe("experience overview layout", () => {
  test("details page uses the page content container", () => {
    const html = fs.readFileSync(
      path.join(__dirname, "..", "client", "details.html"),
      "utf8"
    );

    expect(html).toContain('class="page-content"');
    expect(html).toContain('class="directory-grid"');
  });

  test("styles define the page content rules", () => {
    const css = fs.readFileSync(
      path.join(__dirname, "..", "client", "styles.css"),
      "utf8"
    );

    expect(css).toMatch(/\.page-content\s*\{/);
    expect(css).toMatch(/\.page-content\s+\.section\s*\{/);
    expect(css).toMatch(/@media \(max-width: 720px\)/);
  });
});
