import { auth, isAdmin } from "../authHooks.js";
import type {
  DoneFuncWithErrOrRes,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { beforeEach, describe, expect, test, vi } from "vitest";

function createMockRequest(
  overrides: Partial<FastifyRequest> = {},
): FastifyRequest {
  return {
    headers: { authorization: "Bearer token" },
    user: { id: "user-1", role: "member", banned: false },
    ...overrides,
  } as unknown as FastifyRequest;
}

function createMockReply(): FastifyReply {
  return {
    unauthorized: vi.fn(() => new Error("Unauthorized")),
    forbidden: vi.fn(() => new Error("Forbidden")),
  } as unknown as FastifyReply;
}

describe("auth hook", () => {
  let reply: FastifyReply;
  let done: DoneFuncWithErrOrRes;

  beforeEach(() => {
    reply = createMockReply();
    done = vi.fn() as unknown as DoneFuncWithErrOrRes;
  });

  test("throws unauthorized when no authorization header", async () => {
    const request = createMockRequest({ headers: {} });

    await expect(auth(request, reply, done)).rejects.toThrow();
    expect(reply.unauthorized).toHaveBeenCalled();
    expect(done).not.toHaveBeenCalled();
  });

  test("throws forbidden when user id is ghost", async () => {
    const request = createMockRequest({
      user: { id: "ghost", role: "member", banned: false },
    } as Partial<FastifyRequest>);

    await expect(auth(request, reply, done)).rejects.toThrow();
    expect(reply.forbidden).toHaveBeenCalled();
    expect(done).not.toHaveBeenCalled();
  });

  test("throws forbidden when user is banned", async () => {
    const request = createMockRequest({
      user: { id: "user-1", role: "member", banned: true },
    } as Partial<FastifyRequest>);

    await expect(auth(request, reply, done)).rejects.toThrow();
    expect(reply.forbidden).toHaveBeenCalled();
    expect(done).not.toHaveBeenCalled();
  });

  test("calls done for authenticated non-banned user", async () => {
    const request = createMockRequest();

    await auth(request, reply, done);
    expect(done).toHaveBeenCalled();
    expect(reply.unauthorized).not.toHaveBeenCalled();
    expect(reply.forbidden).not.toHaveBeenCalled();
  });
});

describe("isAdmin hook", () => {
  let reply: FastifyReply;
  let done: DoneFuncWithErrOrRes;

  beforeEach(() => {
    reply = createMockReply();
    done = vi.fn() as unknown as DoneFuncWithErrOrRes;
  });

  test("throws forbidden when user is not admin", async () => {
    const request = createMockRequest({
      user: { id: "user-1", role: "member", banned: false },
    } as Partial<FastifyRequest>);

    await expect(isAdmin(request, reply, done)).rejects.toThrow();
    expect(reply.forbidden).toHaveBeenCalled();
    expect(done).not.toHaveBeenCalled();
  });

  test("calls done for admin user", async () => {
    const request = createMockRequest({
      user: { id: "user-1", role: "admin", banned: false },
    } as Partial<FastifyRequest>);

    await isAdmin(request, reply, done);
    expect(done).toHaveBeenCalled();
    expect(reply.forbidden).not.toHaveBeenCalled();
  });
});
