import { auth, isAdmin } from "../authHooks.js";
import { fromAny, fromPartial } from "@total-typescript/shoehorn";
import type { PartialDeep } from "@total-typescript/shoehorn";
import type {
  DoneFuncWithErrOrRes,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { beforeEach, describe, expect, test, vi } from "vitest";

function createMockRequest(
  overrides: PartialDeep<FastifyRequest> = {},
): FastifyRequest {
  return fromPartial<FastifyRequest>({
    headers: { authorization: "Bearer token" },
    user: { id: "user-1", role: "member", banned: false },
    ...overrides,
  });
}

function createMockReply(): FastifyReply {
  return fromPartial<FastifyReply>({
    unauthorized: vi.fn(() => new Error("Unauthorized")),
    forbidden: vi.fn(() => new Error("Forbidden")),
  });
}

describe("auth hook", () => {
  let reply: FastifyReply;
  let done: DoneFuncWithErrOrRes;

  beforeEach(() => {
    reply = createMockReply();
    done = fromAny(vi.fn());
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
    });

    await expect(auth(request, reply, done)).rejects.toThrow();
    expect(reply.forbidden).toHaveBeenCalled();
    expect(done).not.toHaveBeenCalled();
  });

  test("throws forbidden when user is banned", async () => {
    const request = createMockRequest({
      user: { id: "user-1", role: "member", banned: true },
    });

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
    done = fromAny(vi.fn());
  });

  test("throws forbidden when user is not admin", async () => {
    const request = createMockRequest({
      user: { id: "user-1", role: "member", banned: false },
    });

    await expect(isAdmin(request, reply, done)).rejects.toThrow();
    expect(reply.forbidden).toHaveBeenCalled();
    expect(done).not.toHaveBeenCalled();
  });

  test("calls done for admin user", async () => {
    const request = createMockRequest({
      user: { id: "user-1", role: "admin", banned: false },
    });

    await isAdmin(request, reply, done);
    expect(done).toHaveBeenCalled();
    expect(reply.forbidden).not.toHaveBeenCalled();
  });
});
