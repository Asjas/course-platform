import { createCourseHandler } from "../handlers/createCourse.js";
import { deleteCourseByIdHandler } from "../handlers/deleteCourseById.js";
import { getCourseByIdHandler } from "../handlers/getCourseById.js";
import { getCoursesHandler } from "../handlers/getCourses.js";
import { updateCourseByIdHandler } from "../handlers/updateCourseById.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  deleteCourseById,
  insertCourse,
  updateCourseById,
} from "~/routes/courses/mutations.js";
import { getAllCourses, getCourseById } from "~/routes/courses/queries.js";

// Mock the query and mutation modules
vi.mock("~/routes/courses/queries.js", () => ({
  getAllCourses: vi.fn(),
  getCourseById: vi.fn(),
}));

vi.mock("~/routes/courses/mutations.js", () => ({
  insertCourse: vi.fn(),
  updateCourseById: vi.fn(),
  deleteCourseById: vi.fn(),
}));

const mockGetAllCourses = vi.mocked(getAllCourses);
const mockGetCourseById = vi.mocked(getCourseById);
const mockInsertCourse = vi.mocked(insertCourse);
const mockUpdateCourseById = vi.mocked(updateCourseById);
const mockDeleteCourseById = vi.mocked(deleteCourseById);

function createMockRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: "req-1",
    params: {},
    body: {},
    log: {
      child: () => ({
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
      }),
    },
    ...overrides,
  } as never;
}

function createMockReply() {
  const reply = {
    statusCode: 200,
    notFound: vi.fn().mockReturnValue({ error: "Not Found" }),
    badRequest: vi.fn().mockReturnValue({ error: "Bad Request" }),
    internalServerError: vi
      .fn()
      .mockReturnValue({ error: "Internal Server Error" }),
    cacheControl: vi.fn(),
    stale: vi.fn(),
    vary: vi.fn(),
  };
  return reply as never;
}

describe("getCoursesHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns all courses on success", async () => {
    const mockCourses = { count: 2, data: [{ id: "c1" }, { id: "c2" }] };
    mockGetAllCourses.mockResolvedValue(mockCourses as never);

    const request = createMockRequest();
    const reply = createMockReply();

    const result = await getCoursesHandler(request, reply);
    expect(result).toEqual(mockCourses);
  });

  test("returns notFound when no courses exist", async () => {
    mockGetAllCourses.mockResolvedValue(null as never);

    const request = createMockRequest();
    const reply = createMockReply();

    await getCoursesHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).notFound,
    ).toHaveBeenCalled();
  });

  test("returns internalServerError on exception", async () => {
    mockGetAllCourses.mockRejectedValue(new Error("DB failure"));

    const request = createMockRequest();
    const reply = createMockReply();

    await getCoursesHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).internalServerError,
    ).toHaveBeenCalled();
  });
});

describe("getCourseByIdHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns course when found", async () => {
    const mockCourse = { id: "course-1", name: "Test Course" };
    mockGetCourseById.mockResolvedValue(mockCourse as never);

    const request = createMockRequest({ params: { courseId: "course-1" } });
    const reply = createMockReply();

    const result = await getCourseByIdHandler(request, reply);
    expect(result).toEqual(mockCourse);
  });

  test("returns notFound when course does not exist", async () => {
    mockGetCourseById.mockResolvedValue(null as never);

    const request = createMockRequest({ params: { courseId: "missing" } });
    const reply = createMockReply();

    await getCourseByIdHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).notFound,
    ).toHaveBeenCalled();
  });

  test("returns internalServerError on exception", async () => {
    mockGetCourseById.mockRejectedValue(new Error("DB failure"));

    const request = createMockRequest({ params: { courseId: "course-1" } });
    const reply = createMockReply();

    await getCourseByIdHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).internalServerError,
    ).toHaveBeenCalled();
  });
});

describe("createCourseHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("creates course and returns 201", async () => {
    const newCourse = { name: "New Course", slug: "new-course" };
    const created = { id: "course-new", ...newCourse };
    mockInsertCourse.mockResolvedValue(created as never);

    const request = createMockRequest({ body: { newCourse } });
    const reply = createMockReply();

    const result = await createCourseHandler(request, reply);
    expect(result).toEqual(created);
    expect((reply as { statusCode: number }).statusCode).toBe(201);
  });

  test("returns badRequest when no course data provided", async () => {
    const request = createMockRequest({ body: {} });
    const reply = createMockReply();

    await createCourseHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).badRequest,
    ).toHaveBeenCalled();
  });

  test("returns badRequest when insertCourse returns null", async () => {
    mockInsertCourse.mockResolvedValue(null as never);

    const request = createMockRequest({
      body: { newCourse: { name: "Fail" } },
    });
    const reply = createMockReply();

    await createCourseHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).badRequest,
    ).toHaveBeenCalled();
  });

  test("returns internalServerError on exception", async () => {
    mockInsertCourse.mockRejectedValue(new Error("DB failure"));

    const request = createMockRequest({
      body: { newCourse: { name: "Fail" } },
    });
    const reply = createMockReply();

    await createCourseHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).internalServerError,
    ).toHaveBeenCalled();
  });
});

describe("updateCourseByIdHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("updates course when found", async () => {
    const existing = { id: "course-1", name: "Old" };
    const updated = { id: "course-1", name: "Updated" };
    mockGetCourseById.mockResolvedValue(existing as never);
    mockUpdateCourseById.mockResolvedValue(updated as never);

    const request = createMockRequest({
      params: { courseId: "course-1" },
      body: { updates: { name: "Updated" } },
    });
    const reply = createMockReply();

    const result = await updateCourseByIdHandler(request, reply);
    expect(result).toEqual(updated);
  });

  test("returns badRequest when no updates provided", async () => {
    const request = createMockRequest({
      params: { courseId: "course-1" },
      body: {},
    });
    const reply = createMockReply();

    await updateCourseByIdHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).badRequest,
    ).toHaveBeenCalled();
  });

  test("returns badRequest when updates is empty", async () => {
    const request = createMockRequest({
      params: { courseId: "course-1" },
      body: { updates: {} },
    });
    const reply = createMockReply();

    await updateCourseByIdHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).badRequest,
    ).toHaveBeenCalled();
  });

  test("returns notFound when course does not exist", async () => {
    mockGetCourseById.mockResolvedValue(null as never);

    const request = createMockRequest({
      params: { courseId: "missing" },
      body: { updates: { name: "Updated" } },
    });
    const reply = createMockReply();

    await updateCourseByIdHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).notFound,
    ).toHaveBeenCalled();
  });

  test("returns internalServerError when update fails", async () => {
    mockGetCourseById.mockResolvedValue({ id: "course-1" } as never);
    mockUpdateCourseById.mockResolvedValue(null as never);

    const request = createMockRequest({
      params: { courseId: "course-1" },
      body: { updates: { name: "Updated" } },
    });
    const reply = createMockReply();

    await updateCourseByIdHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).internalServerError,
    ).toHaveBeenCalled();
  });
});

describe("deleteCourseByIdHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("deletes course and returns 204", async () => {
    mockGetCourseById.mockResolvedValue({ id: "course-1" } as never);
    mockDeleteCourseById.mockResolvedValue({ id: "course-1" } as never);

    const request = createMockRequest({
      params: { courseId: "course-1" },
    });
    const reply = createMockReply();

    await deleteCourseByIdHandler(request, reply);
    expect((reply as { statusCode: number }).statusCode).toBe(204);
  });

  test("returns notFound when course does not exist", async () => {
    mockGetCourseById.mockResolvedValue(null as never);

    const request = createMockRequest({
      params: { courseId: "missing" },
    });
    const reply = createMockReply();

    await deleteCourseByIdHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).notFound,
    ).toHaveBeenCalled();
  });

  test("returns internalServerError when delete fails", async () => {
    mockGetCourseById.mockResolvedValue({ id: "course-1" } as never);
    mockDeleteCourseById.mockResolvedValue(null as never);

    const request = createMockRequest({
      params: { courseId: "course-1" },
    });
    const reply = createMockReply();

    await deleteCourseByIdHandler(request, reply);
    expect(
      vi.mocked(reply as Record<string, unknown>).internalServerError,
    ).toHaveBeenCalled();
  });
});
