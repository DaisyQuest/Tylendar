/**
 * @jest-environment jsdom
 */

describe("DOMContentLoaded handler", () => {
  test("logs errors when init fails", async () => {
    jest.resetModules();
    document.body.innerHTML = `
      <div id="profile-card"></div>
      <div id="home-highlights"></div>
      <div id="user-dashboard"></div>
      <div id="org-dashboard"></div>
      <div id="calendar-view"></div>
      <div id="event-list"></div>
      <div id="access-matrix"></div>
      <div id="message-board"></div>
    `;

    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    require("../client/app");
    window.dispatchEvent(new Event("DOMContentLoaded"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
