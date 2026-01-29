const fs = require("fs");
const path = require("path");

describe("home page layout", () => {
  test("index page includes the feature directory", () => {
    const html = fs.readFileSync(
      path.join(__dirname, "..", "client", "index.html"),
      "utf8"
    );

    expect(html).toContain('class="home-directory"');
    expect(html).toContain("Your feature directory");
    expect(html).toContain("directory-card");
  });

  test("styles define directory cards", () => {
    const css = fs.readFileSync(
      path.join(__dirname, "..", "client", "styles.css"),
      "utf8"
    );

    expect(css).toMatch(/\.directory-card\s*\{/);
    expect(css).toMatch(/\.directory-grid\s*\{/);
  });
});
