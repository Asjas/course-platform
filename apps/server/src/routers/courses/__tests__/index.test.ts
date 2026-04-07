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
  mockCheckCoursePublishReadiness,
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
  mockCheckCoursePublishReadiness: vi.fn(),
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
  checkCoursePublishReadiness: mockCheckCoursePublishReadiness,
}));

vi.mock("~/lib/sse-sync.js", () => ({
  coursesSyncConfig: { streamKeyPrefix: "sync:courses" },
  publishEntityChange: mockPublishEntityChange,
  createSyncUpdate: mockCreateSyncUpdate,
  getEntityUpdatesSince: mockGetEntityUpdatesSince,
  streamEntityUpdates: mockStreamEntityUpdates,
}));

vi.mock("~/lib/notifications.js", () => ({
  dispatchNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("~/db/queries/user.js", () => ({
  getEnrolledUsersByCourseId: vi.fn().mockResolvedValue([]),
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

  // ========== Publish gating ==========

  test("updateCourse with published:true allows update when all lessons are ready", async () => {
    const { caller, cache } = createCaller({ id: "admin-1", role: "admin" });
    mockCheckCoursePublishReadiness.mockResolvedValue({
      ready: true,
      issues: [],
    });
    mockUpdateCourse.mockResolvedValue({
      id: "course-4",
      slug: "ready-course",
    });

    await caller.updateCourse({ id: "course-4", published: true });

    expect(mockCheckCoursePublishReadiness).toHaveBeenCalledWith("course-4");
    expect(mockUpdateCourse).toHaveBeenCalledTimes(1);
    expect(cache.invalidateAll).toHaveBeenCalledWith([
      "course~all",
      "course~id~course-4",
    ]);
  });

  test("updateCourse with published:true blocks when a lesson has no transcript", async () => {
    const { caller } = createCaller({ id: "admin-1", role: "admin" });
    mockCheckCoursePublishReadiness.mockResolvedValue({
      ready: false,
      issues: [
        {
          lessonId: "lesson-1",
          lessonTitle: "Intro",
          reason: "missing",
        },
      ],
    });

    await expect(
      caller.updateCourse({ id: "course-5", published: true }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringContaining("missing valid transcripts"),
    });

    expect(mockUpdateCourse).not.toHaveBeenCalled();
  });

  test("updateCourse with published:true blocks when a lesson has invalid transcript schema", async () => {
    const { caller } = createCaller({ id: "admin-1", role: "admin" });
    mockCheckCoursePublishReadiness.mockResolvedValue({
      ready: false,
      issues: [
        {
          lessonId: "lesson-2",
          lessonTitle: "Advanced Topics",
          reason: "invalid_schema",
        },
      ],
    });

    await expect(
      caller.updateCourse({ id: "course-6", published: true }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });

    expect(mockUpdateCourse).not.toHaveBeenCalled();
  });

  test("updateCourse with published:true blocks when a lesson transcript has no cues", async () => {
    const { caller } = createCaller({ id: "admin-1", role: "admin" });
    mockCheckCoursePublishReadiness.mockResolvedValue({
      ready: false,
      issues: [
        {
          lessonId: "lesson-3",
          lessonTitle: "Empty Transcript",
          reason: "no_cues",
        },
      ],
    });

    await expect(
      caller.updateCourse({ id: "course-7", published: true }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });

    expect(mockUpdateCourse).not.toHaveBeenCalled();
  });

  test("updateCourse without published field skips readiness check", async () => {
    const { caller, cache } = createCaller({ id: "admin-1", role: "admin" });
    mockUpdateCourse.mockResolvedValue({
      id: "course-8",
      slug: "no-publish",
    });

    await caller.updateCourse({ id: "course-8", name: "New Name" });

    expect(mockCheckCoursePublishReadiness).not.toHaveBeenCalled();
    expect(mockUpdateCourse).toHaveBeenCalledTimes(1);
    expect(cache.invalidateAll).toHaveBeenCalledWith([
      "course~all",
      "course~id~course-8",
    ]);
  });

  test("updateCourse with published:false skips readiness check", async () => {
    const { caller, cache } = createCaller({ id: "admin-1", role: "admin" });
    mockUpdateCourse.mockResolvedValue({
      id: "course-9",
      slug: "unpublish",
    });

    await caller.updateCourse({ id: "course-9", published: false });

    expect(mockCheckCoursePublishReadiness).not.toHaveBeenCalled();
    expect(mockUpdateCourse).toHaveBeenCalledTimes(1);
    expect(cache.invalidateAll).toHaveBeenCalledWith([
      "course~all",
      "course~id~course-9",
    ]);
  });

  test("updateCourse returns INTERNAL_SERVER_ERROR when readiness check fails", async () => {
    const { caller, log } = createCaller({ id: "admin-1", role: "admin" });
    mockCheckCoursePublishReadiness.mockRejectedValue(new Error("DB error"));

    await expect(
      caller.updateCourse({ id: "course-10", published: true }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });

    expect(log.error).toHaveBeenCalled();
    expect(mockUpdateCourse).not.toHaveBeenCalled();
  });

  // ========== checkPublishReadiness ==========

  test("checkPublishReadiness denies non-admin users", async () => {
    const { caller } = createCaller({ id: "user-1", role: "student" });

    await expect(
      caller.checkPublishReadiness({ courseId: "course-1" }),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  test("checkPublishReadiness returns ready result for admin", async () => {
    const { caller } = createCaller({ id: "admin-1", role: "admin" });
    mockCheckCoursePublishReadiness.mockResolvedValue({
      ready: true,
      issues: [],
    });

    const result = await caller.checkPublishReadiness({ courseId: "course-1" });

    expect(mockCheckCoursePublishReadiness).toHaveBeenCalledWith("course-1");
    expect(result).toEqual({ ready: true, issues: [] });
  });

  test("checkPublishReadiness returns issues when lessons block publish", async () => {
    const { caller } = createCaller({ id: "admin-1", role: "admin" });
    mockCheckCoursePublishReadiness.mockResolvedValue({
      ready: false,
      issues: [
        { lessonId: "l1", lessonTitle: "Intro", reason: "missing" },
        { lessonId: "l2", lessonTitle: "Module 2", reason: "no_cues" },
      ],
    });

    const result = await caller.checkPublishReadiness({ courseId: "course-2" });

    expect(result.ready).toBe(false);
    expect(result.issues).toHaveLength(2);
    expect(result.issues[0]).toMatchObject({
      lessonId: "l1",
      reason: "missing",
    });
  });

  test("checkPublishReadiness throws INTERNAL_SERVER_ERROR when check fails", async () => {
    const { caller, log } = createCaller({ id: "admin-1", role: "admin" });
    mockCheckCoursePublishReadiness.mockRejectedValue(new Error("DB error"));

    await expect(
      caller.checkPublishReadiness({ courseId: "course-1" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });

    expect(log.error).toHaveBeenCalled();
  });
});
