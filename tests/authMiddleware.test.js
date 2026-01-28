const { attachSession, parseToken } = require("../server/middleware/auth");
const { createSessionStore } = require("../server/auth/sessionStore");
const { createMemoryRepository } = require("../server/repositories/memoryRepository");
const { createUser } = require("../server/models/user");

describe("auth middleware", () => {
  test("parseToken reads bearer and cookies", () => {
    const bearerReq = { headers: { authorization: "Bearer abc" } };
    expect(parseToken(bearerReq)).toBe("abc");

    const cookieReq = { headers: { cookie: "other=1; session=token123" } };
    expect(parseToken(cookieReq)).toBe("token123");

    const missingCookie = { headers: { cookie: "other=1" } };
    expect(parseToken(missingCookie)).toBeNull();
  });

  test("attachSession assigns user and session", async () => {
    const store = createSessionStore();
    const users = createMemoryRepository({ createModel: createUser });
    await users.create({ id: "u1", name: "A", email: "a@a.com", organizationId: "org" });
    const session = store.createSession({ userId: "u1" });

    const req = { headers: { authorization: `Bearer ${session.token}` } };
    const res = {};
    const next = jest.fn();
    const middleware = attachSession({ sessionStore: store, userRepository: users });

    await middleware(req, res, next);

    expect(req.user.id).toBe("u1");
    expect(req.session.token).toBe(session.token);
    expect(next).toHaveBeenCalled();
  });

  test("attachSession handles missing token", async () => {
    const store = createSessionStore();
    const users = createMemoryRepository({ createModel: createUser });
    const req = { headers: {} };
    const res = {};
    const next = jest.fn();
    const middleware = attachSession({ sessionStore: store, userRepository: users });

    await middleware(req, res, next);

    expect(req.user).toBeNull();
    expect(req.session).toBeNull();
  });

  test("attachSession handles invalid session", async () => {
    const store = createSessionStore();
    const users = createMemoryRepository({ createModel: createUser });
    const session = store.createSession({ userId: "u1" });
    store.deleteSession(session.token);
    const req = { headers: { authorization: `Bearer ${session.token}` } };
    const res = {};
    const next = jest.fn();
    const middleware = attachSession({ sessionStore: store, userRepository: users });

    await middleware(req, res, next);

    expect(req.user).toBeNull();
    expect(req.session).toBeNull();
  });

  test("session store clear removes sessions", () => {
    const store = createSessionStore();
    const session = store.createSession({ userId: "u1" });
    expect(store.getSession(session.token)).toBeTruthy();
    store.clear();
    expect(store.getSession(session.token)).toBeNull();
  });
});
