import { coursesRouter } from "../index.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const {
  mockInsertCourse,
  mockUpdateCourse,
  mockDeleteCourse,
  mockInsertModule,
  mockUpdateModule,
  mockDeleteModule,
  mockReorderModules,
  mockInsertLesson,
  mockUpdateLesson,
  mockDeleteLesson,
  mockReorderLessons,
  mockMoveLessonToModule,
  mockGetCourseProgress,
  mockGetLessonProgress,
  mockGetEnrollmentStatus,
  mockPublishEntityChange,
  mockCreateSyncUpdate,
  mockGetEntityUpdatesSince,
  mockStreamEntityUpdates,
} = vi.hoisted(() => ({
  mockInsertCourse: vi.fn(),
  mockUpdateCourse: vi.fn(),
  mockDeleteCourse: vi.fn(),
  mockInsertModule: vi.fn(),
  mockUpdateModule: vi.fn(),
  mockDeleteModule: vi.fn(),
  mockReorderModules: vi.fn(),
  mockInsertLesson: vi.fn(),
  mockUpdateLesson: vi.fn(),
  mockDeleteLesson: vi.fn(),
  mockReorderLessons: vi.fn(),
  mockMoveLessonToModule: vi.fn(),
  mockGetCourseProgress: vi.fn(),
  mockGetLessonProgress: vi.fn(),
  mockGetEnrollmentStatus: vi.fn(),
  mockPublishEntityChange: vi.fn(),
  mockCreateSyncUpdate: vi.fn(),
  mockGetEntityUpdatesSince: vi.fn(),
  mockStreamEntityUpdates: vi.fn(),
}));

vi.mock("~/routers/courses/mutations.js", () => ({
  insertCourse: mockInsertCourse,
  updateCourse: mockUpdateCourse,
  deleteCourse: mockDeleteCourse,
  insertModule: mockInsertModule,
  updateModule: mockUpdateModule,
  deleteModule: mockDeleteModule,
  reorderModules: mockReorderModules,
  insertLesson: mockInsertLesson,
  updateLesson: mockUpdateLesson,
  deleteLesson: mockDeleteLesson,
  reorderLessons: mockReorderLessons,
  moveLessonToModule: mockMoveLessonToModule,
}));

vi.mock("~/routers/courses/queries.js", () => ({
  getCourseProgress: mockGetCourseProgress,
  getLessonProgress: mockGetLessonProgress,
  getEnrollmentStatus: mockGetEnrollmentStatus,
}));

vi.mock("~/lib/sse-sync.js", () => ({
  coursesSyncConfig: { streamKeyPrefix: "sync:courses" },
  publishEntityChange: mockPublishEntityChange,
  createSyncUpdate: mockCreateSyncUpdate,
  getEntityUpdatesSince: mockGetEntityUpdatesSince,
  streamEntityUpdates: mockStreamEntityUpdates,
}));

interface TestUser {
  id: string;
  role: string;
}

function createCaller(user?: TestUser) {
  const cache = {
    getAllCoursesAsAdmin: vi.fn(),
    getAllCourses: vi.fn(),
    getCourseById: vi.fn(),
    getModulesAndLessonsByCourseId: vi.fn(),
    getLessonById: vi.fn(),
    invalidateAll: vi.fn(),
  };

  const log = {
    error: vi.fn(),
    debug: vi.fn(),
  };

  const server = {
    cache,
    log,
    to: async <T>(promise: Promise<T>): Promise<[Error | null, T | null]> => {
      try {
        const value = await promise;
        return [null, value];
      } catch (error) {
        return [error as Error, null];
      }
    },
  };

  const caller = coursesRouter.createCaller({
    user,
    hasRole: (role: string) => user?.role === role,
    reply: { server },
  } as never);

  return { caller, cache, log };
}

describe("coursesRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateSyncUpdate.mockReturnValue({ id: "sync-1" });
    mockStreamEntityUpdates.mockReturnValue(
      (async function* () {
        yield { id: "event-1", type: "created", entityId: "course-1" };
      })(),
    );
  });

  test("getAll returns cached public courses", async () => {
    const { caller, cache } = createCaller();
    cache.getAllCourses.mockResolvedValue([{ id: "course-1", name: "Course" }]);

    const result = await caller.getAll();

    expect(cache.getAllCourses).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ id: "course-1", name: "Course" }]);
  });

  test("getAllAsAdmin denies non-admin users", async () => {
    const { caller } = createCaller({ id: "user-1", role: "student" });

    await expect(caller.getAllAsAdmin()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  test("getCourseProgress requires authentication", async () => {
    const { caller } = createCaller();

    await expect(
      caller.getCourseProgress({ courseId: "course-1" }),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this endpoint",
    });
  });

  test("getCourseProgress passes ctx user id to query layer", async () => {
    const { caller } = createCaller({ id: "user-1", role: "student" });
    mockGetCourseProgress.mockResolvedValue({ progressPercent: 65 });

    const result = await caller.getCourseProgress({ courseId: "course-1" });

    expect(mockGetCourseProgress).toHaveBeenCalledWith({
      userId: "user-1",
      courseId: "course-1",
    });
    expect(result).toEqual({ progressPercent: 65 });
  });

  test("getById throws NOT_FOUND when course does not exist", async () => {
    const { caller, cache } = createCaller();
    cache.getCourseById.mockResolvedValue(null);

    await expect(
      caller.getById({ courseId: "course-missing" }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Course not found",
    });
  });

  test("createCourse invalidates list cache key", async () => {
    const { caller, cache } = createCaller({ id: "admin-1", role: "admin" });
    mockInsertCourse.mockResolvedValue({ id: "course-2", slug: "new-course" });

    await caller.createCourse({
      slug: "new-course",
      name: "New Course",
      authorId: "author-1",
    });

    expect(cache.invalidateAll).toHaveBeenCalledWith(["course~all"]);
    expect(mockPublishEntityChange).toHaveBeenCalledTimes(1);
  });

  test("updateCourse invalidates list and item cache keys", async () => {
    const { caller, cache } = createCaller({ id: "admin-1", role: "admin" });
    mockUpdateCourse.mockResolvedValue({ id: "course-3", slug: "updated" });

    await caller.updateCourse({ id: "course-3", name: "Updated Name" });

    expect(cache.invalidateAll).toHaveBeenCalledWith([
      "course~all",
      "course~id~course-3",
    ]);
  });
});
