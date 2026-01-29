const fs = require("fs");
const path = require("path");

describe("home page layout", () => {
  test("index page includes quick links", () => {
    const html = fs.readFileSync(
      path.join(__dirname, "..", "client", "index.html"),
      "utf8"
    );

    expect(html).toContain('class="home-directory"');
    expect(html).toContain("Quick links");
    expect(html).toContain("directory-card");
  });

  test("directory links point at focused pages", () => {
    const html = fs.readFileSync(
      path.join(__dirname, "..", "client", "index.html"),
      "utf8"
    );

    const links = [
      "/profiles",
      "/dashboards",
      "/calendar",
      "/access",
      "/messageboard",
      "/embed",
      "/sharing",
      "/audit",
      "/roles",
      "/resilience",
      "/developer",
      "/observability"
    ];

    links.forEach((href) => {
      expect(html).toContain(`href="${href}"`);
    });
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
