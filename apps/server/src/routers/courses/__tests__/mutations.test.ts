import {
  deleteCourse,
  deleteLesson,
  deleteModule,
  insertCourse,
  insertLesson,
  insertModule,
  moveLessonToModule,
  reorderLessons,
  reorderModules,
  updateCourse,
  updateLesson,
  updateModule,
} from "../mutations.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { db } from "~/db/index.js";

// Mock db dependencies
vi.mock("~/db/index.js", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "course:test" }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "course:test" }]),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "course:test" }]),
      }),
    }),
  },
}));

vi.mock("~/db/schema/course.js", () => ({
  course: { id: "id" },
  courseModule: { id: "id" },
  courseLesson: { id: "id" },
}));

vi.mock("~/lib/logging.js", () => ({
  pinoLogger: {
    child: () => ({ debug: vi.fn(), error: vi.fn(), info: vi.fn() }),
  },
}));

const mockDb = vi.mocked(db);

describe("insertCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([
            { id: "course:01HRTEST", name: "Test Course", slug: "test-course" },
          ]),
      }),
    } as never);
  });

  test("inserts a course with generated ID", async () => {
    const result = await insertCourse({
      newCourse: { name: "Test Course", slug: "test-course" } as never,
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Test Course");
    expect(mockDb.insert).toHaveBeenCalled();
  });

  test("throws when insert fails", async () => {
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue(new Error("DB error")),
      }),
    } as never);

    await expect(
      insertCourse({
        newCourse: { name: "Fail" } as never,
      }),
    ).rejects.toThrow("DB error");
  });
});

describe("updateCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([{ id: "course:1", name: "Updated" }]),
        }),
      }),
    } as never);
  });

  test("updates a course by ID", async () => {
    const result = await updateCourse({
      courseId: "course:1",
      updates: { name: "Updated" } as never,
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Updated");
  });
});

describe("deleteCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "course:1" }]),
      }),
    } as never);
  });

  test("deletes a course by ID", async () => {
    const result = await deleteCourse({ courseId: "course:1" });
    expect(result).toBeDefined();
    expect(result.id).toBe("course:1");
  });
});

describe("insertModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "module:01HRTEST", title: "Module 1" }]),
      }),
    } as never);
  });

  test("inserts a module with generated ID", async () => {
    const result = await insertModule({
      newModule: { title: "Module 1" } as never,
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Module 1");
  });
});

describe("updateModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([{ id: "module:1", title: "Updated Module" }]),
        }),
      }),
    } as never);
  });

  test("updates a module by ID", async () => {
    const result = await updateModule({
      moduleId: "module:1",
      updates: { title: "Updated Module" } as never,
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Updated Module");
  });
});

describe("deleteModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "module:1" }]),
      }),
    } as never);
  });

  test("deletes a module by ID", async () => {
    const result = await deleteModule({ moduleId: "module:1" });
    expect(result).toBeDefined();
    expect(result.id).toBe("module:1");
  });
});

describe("reorderModules", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "m1", order: 0 }]),
        }),
      }),
    } as never);
  });

  test("reorders modules with new order values", async () => {
    const result = await reorderModules({
      modules: [
        { id: "m1", order: 0 },
        { id: "m2", order: 1 },
      ],
    });

    expect(result).toHaveLength(2);
  });
});

describe("insertLesson", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "lesson:01HRTEST", title: "Lesson 1" }]),
      }),
    } as never);
  });

  test("inserts a lesson with generated ID", async () => {
    const result = await insertLesson({
      newLesson: { title: "Lesson 1" } as never,
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Lesson 1");
  });
});

describe("updateLesson", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([{ id: "lesson:1", title: "Updated Lesson" }]),
        }),
      }),
    } as never);
  });

  test("updates a lesson by ID", async () => {
    const result = await updateLesson({
      lessonId: "lesson:1",
      updates: { title: "Updated Lesson" } as never,
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Updated Lesson");
  });
});

describe("deleteLesson", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: "lesson:1" }]),
      }),
    } as never);
  });

  test("deletes a lesson by ID", async () => {
    const result = await deleteLesson({ lessonId: "lesson:1" });
    expect(result).toBeDefined();
    expect(result.id).toBe("lesson:1");
  });
});

describe("reorderLessons", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "l1", order: 0 }]),
        }),
      }),
    } as never);
  });

  test("reorders lessons with new order values", async () => {
    const result = await reorderLessons({
      lessons: [
        { id: "l1", order: 0 },
        { id: "l2", order: 1 },
      ],
    });

    expect(result).toHaveLength(2);
  });
});

describe("moveLessonToModule", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue([
              { id: "lesson:1", moduleId: "module:2", order: 3 },
            ]),
        }),
      }),
    } as never);
  });

  test("moves a lesson to a new module with new order", async () => {
    const result = await moveLessonToModule({
      lessonId: "lesson:1",
      newModuleId: "module:2",
      newOrder: 3,
    });

    expect(result).toBeDefined();
    expect(result.moduleId).toBe("module:2");
    expect(result.order).toBe(3);
  });
});
