/**
 * @jest-environment jsdom
 */

describe("DOMContentLoaded handler", () => {
  test("hydrates sections on DOMContentLoaded", async () => {
    jest.resetModules();
    document.body.innerHTML = `
      <div id="profile-card"></div>
      <div id="calendar-view"></div>
    `;

    require("../client/app");
    window.dispatchEvent(new Event("DOMContentLoaded"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.getElementById("profile-card").innerHTML).toContain("Sign in");
  });

  test("logs errors when init throws", async () => {
    jest.resetModules();
    document.body.innerHTML = `
      <div id="profile-card"></div>
      <div id="auth-modal"></div>
    `;

    const originalGetElementById = document.getElementById.bind(document);
    document.getElementById = (id) => {
      if (id === "auth-modal") {
        return originalGetElementById(id);
      }
      throw new Error("DOM failure");
    };

    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    require("../client/app");
    window.dispatchEvent(new Event("DOMContentLoaded"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
    document.getElementById = originalGetElementById;
  });
});
