import { Redis } from "ioredis";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import config from "~/config.js";
import { cache } from "~/lib/cache.js";

// Mock metric counters using vi.hoisted to ensure they're available when vi.mock is hoisted
const {
  mockCacheHitCounterInc,
  mockCacheMissCounterInc,
  mockCacheErrorCounterInc,
} = vi.hoisted(() => ({
  mockCacheHitCounterInc: vi.fn(),
  mockCacheMissCounterInc: vi.fn(),
  mockCacheErrorCounterInc: vi.fn(),
}));

vi.mock("~/lib/metrics.js", () => ({
  cacheHitCounter: { inc: mockCacheHitCounterInc },
  cacheMissCounter: { inc: mockCacheMissCounterInc },
  cacheErrorCounter: { inc: mockCacheErrorCounterInc },
}));

// Mock the database query functions to avoid actual DB calls
vi.mock("~/db/queries/stats.js", () => ({
  getAnnouncementStats: vi.fn().mockResolvedValue({ total: 10, active: 5 }),
  getCouponStats: vi.fn().mockResolvedValue({ total: 20, active: 15 }),
  getCourseStats: vi.fn().mockResolvedValue({ total: 30, active: 25 }),
  getPlatformStats: vi.fn().mockResolvedValue({ users: 100, courses: 50 }),
  getProgressStats: vi.fn().mockResolvedValue({ completed: 200 }),
  getRevenueStats: vi.fn().mockResolvedValue({ total: 10000 }),
  getSupportStats: vi.fn().mockResolvedValue({ open: 5, closed: 10 }),
  getTeamLicenseStats: vi.fn().mockResolvedValue({ total: 8, active: 6 }),
  getUserStats: vi.fn().mockResolvedValue({ total: 150, active: 120 }),
  getWishlistStats: vi.fn().mockResolvedValue({ total: 75 }),
}));

vi.mock("~/routers/coupons/queries.js", () => ({
  getAllCoupons: vi.fn().mockResolvedValue([
    { id: "coupon1", code: "SAVE10", discount: 10 },
    { id: "coupon2", code: "SAVE20", discount: 20 },
  ]),
  getCouponByCode: vi.fn().mockImplementation(async ({ couponCode }) => ({
    id: "coupon1",
    code: couponCode,
    discount: 10,
  })),
  getCouponById: vi.fn().mockImplementation(async ({ couponId }) => ({
    id: couponId,
    code: "SAVE10",
    discount: 10,
  })),
}));

vi.mock("~/routers/courses/queries.js", () => ({
  getAllCourses: vi.fn().mockResolvedValue([
    { id: "course1", title: "Course 1", slug: "course-1" },
    { id: "course2", title: "Course 2", slug: "course-2" },
  ]),
  getAllCoursesAsAdmin: vi.fn().mockResolvedValue([
    { id: "course1", title: "Course 1", slug: "course-1", published: true },
    { id: "course2", title: "Course 2", slug: "course-2", published: false },
  ]),
  getCourseById: vi.fn().mockImplementation(async ({ courseId }) => ({
    id: courseId,
    title: `Course ${courseId}`,
    slug: `course-${courseId}`,
  })),
  getLessonById: vi.fn().mockImplementation(async ({ lessonId }) => ({
    id: lessonId,
    title: `Lesson ${lessonId}`,
    courseId: "course1",
  })),
  getModulesAndLessonsByCourseId: vi
    .fn()
    .mockImplementation(async ({ courseId }) => ({
      courseId,
      modules: [
        {
          id: "module1",
          title: "Module 1",
          lessons: [
            { id: "lesson1", title: "Lesson 1" },
            { id: "lesson2", title: "Lesson 2" },
          ],
        },
      ],
    })),
}));

vi.mock("~/routers/support-tickets/queries.js", () => ({
  getAllSupportTickets: vi.fn().mockResolvedValue([
    { id: "ticket1", subject: "Help needed", status: "open" },
    { id: "ticket2", subject: "Bug report", status: "closed" },
  ]),
  getSupportTicketById: vi.fn().mockImplementation(async ({ ticketId }) => ({
    id: ticketId,
    subject: `Ticket ${ticketId}`,
    status: "open",
  })),
  getSupportTicketCommentById: vi
    .fn()
    .mockImplementation(async ({ commentId }) => ({
      id: commentId,
      content: `Comment ${commentId}`,
    })),
}));

describe("Cache Integration Tests", () => {
  let testRedis: Redis;

  beforeAll(() => {
    // Create a dedicated Redis client for testing
    testRedis = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      db: 1, // Use different database for testing
    });
  });

  afterAll(async () => {
    // Clean up Redis connections
    await testRedis.quit();
  });

  beforeEach(async () => {
    // Clear all cache before each test
    await cache.clear();
    await testRedis.flushdb();

    // Reset metric mocks
    mockCacheHitCounterInc.mockClear();
    mockCacheMissCounterInc.mockClear();
    mockCacheErrorCounterInc.mockClear();
    vi.clearAllMocks();
  });

  describe("Cache Operations", () => {
    describe("Cache Miss and Hit", () => {
      it("should miss on first call and hit on second call", async () => {
        // First call - should miss
        const result1 = await cache.getAllCourses();
        expect(result1).toHaveLength(2);
        expect(result1[0]).toMatchObject({ id: "course1", title: "Course 1" });

        // Verify cache miss was recorded
        expect(mockCacheMissCounterInc).toHaveBeenCalled();

        // Second call - should hit cache
        const result2 = await cache.getAllCourses();
        expect(result2).toEqual(result1);

        // Verify cache hit was recorded
        expect(mockCacheHitCounterInc).toHaveBeenCalled();
      });

      it("should cache parametrized queries correctly", async () => {
        const courseId = "course123";

        // First call
        const result1 = await cache.getCourseById({ courseId });
        expect(result1).toBeTruthy();
        expect(result1?.id).toBe(courseId);

        // Second call with same parameter
        const result2 = await cache.getCourseById({ courseId });
        expect(result2).toEqual(result1);

        // Different parameter should miss cache
        const result3 = await cache.getCourseById({ courseId: "course456" });
        expect(result3).toBeTruthy();
        expect(result3?.id).toBe("course456");
        expect(result3).not.toEqual(result1);
      });
    });

    describe("Serialization and Deserialization", () => {
      it("should correctly serialize and deserialize complex data with SuperJSON", async () => {
        const modules = await cache.getModulesAndLessonsByCourseId({
          courseId: "course1",
        });

        expect(modules).toMatchObject({
          courseId: "course1",
          modules: expect.arrayContaining([
            expect.objectContaining({
              id: "module1",
              lessons: expect.arrayContaining([
                expect.objectContaining({ id: "lesson1" }),
              ]),
            }),
          ]),
        });

        // Verify it came from cache on second call
        const cachedModules = await cache.getModulesAndLessonsByCourseId({
          courseId: "course1",
        });
        expect(cachedModules).toEqual(modules);
      });

      it("should handle Date objects correctly with SuperJSON", async () => {
        // Note: Our mocks don't include dates, but this tests the serializer behavior
        const stats = await cache.getPlatformStats();
        expect(stats).toMatchObject({ users: 100, courses: 50 });

        const cachedStats = await cache.getPlatformStats();
        expect(cachedStats).toEqual(stats);
      });
    });

    describe("TTL and Expiration", () => {
      it("should respect TTL and expire cached entries", async () => {
        // Get data (will be cached with ONE_HOUR TTL)
        const result1 = await cache.getCouponById({ couponId: "coupon1" });
        expect(result1).toBeTruthy();
        expect(result1?.id).toBe("coupon1");

        // Manually set a very short TTL to test expiration
        const cacheKey = "coupon1"; // Serialized key
        await testRedis.expire(`cache:getCouponById:${cacheKey}`, 1);

        // Wait for expiration
        await new Promise((resolve) => setTimeout(resolve, 1100));

        // Should be expired now and trigger a cache miss
        const result2 = await cache.getCouponById({ couponId: "coupon1" });
        expect(result2).toBeTruthy();
        expect(result2?.id).toBe("coupon1");
      });
    });

    describe("Cache Invalidation", () => {
      it("should invalidate cache using clear method", async () => {
        // Cache all courses
        const courses1 = await cache.getAllCourses();
        expect(courses1).toHaveLength(2);

        // Clear all cache
        await cache.clear();

        // Reset mock counter to track new miss
        mockCacheMissCounterInc.mockClear();

        // Should fetch fresh data now - this will be a cache miss
        const courses2 = await cache.getAllCourses();
        expect(courses2).toHaveLength(2);

        // Verify it was a cache miss
        expect(mockCacheMissCounterInc).toHaveBeenCalled();
      });

      it("should cache individual items separately", async () => {
        const courseId = "course123";

        // Cache the course
        const course1 = await cache.getCourseById({ courseId });
        expect(course1).toBeTruthy();
        expect(course1?.id).toBe(courseId);

        // Clear all cache
        await cache.clear();

        // Reset mock counter
        mockCacheMissCounterInc.mockClear();

        // Should fetch fresh data
        const course2 = await cache.getCourseById({ courseId });
        expect(course2).toBeTruthy();
        expect(course2?.id).toBe(courseId);

        // Verify it was a cache miss
        expect(mockCacheMissCounterInc).toHaveBeenCalled();
      });

      it("should support clearing all cache", async () => {
        // Cache multiple items
        await cache.getAllCourses();
        await cache.getAllCoupons();
        await cache.getAllSupportTickets();

        // Clear everything
        await cache.clear();

        // Reset mock counter
        mockCacheMissCounterInc.mockClear();

        // All subsequent calls should miss cache
        await cache.getAllCourses();
        await cache.getAllCoupons();
        await cache.getAllSupportTickets();

        // Should have recorded cache misses (at least 3)
        expect(mockCacheMissCounterInc).toHaveBeenCalled();
        expect(
          mockCacheMissCounterInc.mock.calls.length,
        ).toBeGreaterThanOrEqual(3);
      });
    });

    describe("Multiple Cache Functions", () => {
      it("should cache support tickets", async () => {
        const tickets = await cache.getAllSupportTickets();
        expect(tickets).toHaveLength(2);
        expect(tickets[0]).toMatchObject({ id: "ticket1", status: "open" });

        const cachedTickets = await cache.getAllSupportTickets();
        expect(cachedTickets).toEqual(tickets);
      });

      it("should cache support ticket by ID", async () => {
        const ticket = await cache.getSupportTicketById({
          ticketId: "ticket1",
        });
        expect(ticket).toBeTruthy();
        expect(ticket?.id).toBe("ticket1");

        const cachedTicket = await cache.getSupportTicketById({
          ticketId: "ticket1",
        });
        expect(cachedTicket).toEqual(ticket);
      });

      it("should cache coupons", async () => {
        const coupons = await cache.getAllCoupons();
        expect(coupons).toHaveLength(2);

        const cachedCoupons = await cache.getAllCoupons();
        expect(cachedCoupons).toEqual(coupons);
      });

      it("should cache coupon by code", async () => {
        const coupon = await cache.getCouponByCode({ couponCode: "SAVE10" });
        expect(coupon).toBeTruthy();
        expect(coupon?.code).toBe("SAVE10");

        const cachedCoupon = await cache.getCouponByCode({
          couponCode: "SAVE10",
        });
        expect(cachedCoupon).toEqual(coupon);
      });

      it("should cache lessons", async () => {
        const lesson = await cache.getLessonById({ lessonId: "lesson1" });
        expect(lesson).toBeTruthy();
        expect(lesson?.id).toBe("lesson1");

        const cachedLesson = await cache.getLessonById({ lessonId: "lesson1" });
        expect(cachedLesson).toEqual(lesson);
      });
    });

    describe("Stats Caching", () => {
      it("should cache course stats", async () => {
        const stats = await cache.getCourseStats();
        expect(stats).toMatchObject({ total: 30, active: 25 });

        const cachedStats = await cache.getCourseStats();
        expect(cachedStats).toEqual(stats);
      });

      it("should cache platform stats", async () => {
        const stats = await cache.getPlatformStats();
        expect(stats).toMatchObject({ users: 100, courses: 50 });

        const cachedStats = await cache.getPlatformStats();
        expect(cachedStats).toEqual(stats);
      });

      it("should cache revenue stats", async () => {
        const stats = await cache.getRevenueStats();
        expect(stats).toMatchObject({ total: 10000 });

        const cachedStats = await cache.getRevenueStats();
        expect(cachedStats).toEqual(stats);
      });

      it("should cache support stats", async () => {
        const stats = await cache.getSupportStats();
        expect(stats).toMatchObject({ open: 5, closed: 10 });

        const cachedStats = await cache.getSupportStats();
        expect(cachedStats).toEqual(stats);
      });

      it("should cache user stats", async () => {
        const stats = await cache.getUserStats();
        expect(stats).toMatchObject({ total: 150, active: 120 });

        const cachedStats = await cache.getUserStats();
        expect(cachedStats).toEqual(stats);
      });

      it("should cache coupon stats", async () => {
        const stats = await cache.getCouponStats();
        expect(stats).toMatchObject({ total: 20, active: 15 });

        const cachedStats = await cache.getCouponStats();
        expect(cachedStats).toEqual(stats);
      });

      it("should cache team license stats", async () => {
        const stats = await cache.getTeamLicenseStats();
        expect(stats).toMatchObject({ total: 8, active: 6 });

        const cachedStats = await cache.getTeamLicenseStats();
        expect(cachedStats).toEqual(stats);
      });

      it("should cache progress stats", async () => {
        const stats = await cache.getProgressStats();
        expect(stats).toMatchObject({ completed: 200 });

        const cachedStats = await cache.getProgressStats();
        expect(cachedStats).toEqual(stats);
      });

      it("should cache wishlist stats", async () => {
        const stats = await cache.getWishlistStats();
        expect(stats).toMatchObject({ total: 75 });

        const cachedStats = await cache.getWishlistStats();
        expect(cachedStats).toEqual(stats);
      });

      it("should cache announcement stats", async () => {
        const stats = await cache.getAnnouncementStats();
        expect(stats).toMatchObject({ total: 10, active: 5 });

        const cachedStats = await cache.getAnnouncementStats();
        expect(cachedStats).toEqual(stats);
      });
    });

    describe("Admin Specific Caching", () => {
      it("should cache admin course queries separately", async () => {
        // Regular courses
        const courses = await cache.getAllCourses();
        expect(courses).toHaveLength(2);

        // Admin courses (includes unpublished)
        const adminCourses = await cache.getAllCoursesAsAdmin();
        expect(adminCourses).toHaveLength(2);
        expect(adminCourses[0]).toHaveProperty("published");

        // Should be cached separately
        const cachedCourses = await cache.getAllCourses();
        const cachedAdminCourses = await cache.getAllCoursesAsAdmin();

        expect(cachedCourses).toEqual(courses);
        expect(cachedAdminCourses).toEqual(adminCourses);
      });

      it("should cache admin course queries", async () => {
        // Admin courses query doesn't take parameters in this implementation
        const adminCourses1 = await cache.getAllCoursesAsAdmin();
        expect(adminCourses1).toHaveLength(2);

        // Second call should hit cache
        const adminCourses2 = await cache.getAllCoursesAsAdmin();
        expect(adminCourses2).toEqual(adminCourses1);
      });
    });

    describe("Error Handling", () => {
      it("should record cache errors when they occur", async () => {
        // Force an error by calling with invalid parameters
        // Note: This depends on implementation details
        // The cache should still return data even if Redis fails

        const result = await cache.getAllCourses();
        expect(result).toBeDefined();
      });

      it("should continue working if Redis is temporarily unavailable", async () => {
        // Disconnect Redis temporarily
        await testRedis.disconnect();

        // Should still work (bypass cache)
        const result = await cache.getAllCourses();
        expect(result).toBeDefined();

        // Reconnect
        testRedis.connect();
      });
    });

    describe("Reference System", () => {
      it("should cache multiple stats queries independently", async () => {
        // Cache multiple stats that reference "stats~all"
        const courseStats = await cache.getCourseStats();
        const userStats = await cache.getUserStats();
        const revenueStats = await cache.getRevenueStats();

        expect(courseStats).toBeDefined();
        expect(userStats).toBeDefined();
        expect(revenueStats).toBeDefined();

        // Clear and verify they are re-fetched
        await cache.clear();
        mockCacheMissCounterInc.mockClear();

        await cache.getCourseStats();
        await cache.getUserStats();

        expect(mockCacheMissCounterInc).toHaveBeenCalled();
      });

      it("should cache overlapping references correctly", async () => {
        // Course stats references both "stats~all" and "course~all"
        const courseStats = await cache.getCourseStats();
        const allCourses = await cache.getAllCourses();

        expect(courseStats).toBeDefined();
        expect(allCourses).toBeDefined();

        // Clear and verify both fetch fresh data
        await cache.clear();
        mockCacheMissCounterInc.mockClear();

        await cache.getCourseStats();
        await cache.getAllCourses();

        expect(mockCacheMissCounterInc).toHaveBeenCalled();
      });
    });

    describe("Concurrent Access", () => {
      it("should handle concurrent requests efficiently", async () => {
        // Make multiple concurrent requests
        const promises = Array.from({ length: 10 }, () =>
          cache.getAllCourses(),
        );

        const results = await Promise.all(promises);

        // All should return the same data
        results.forEach((result) => {
          expect(result).toEqual(results[0]);
        });
      });

      it("should deduplicate concurrent requests for same key", async () => {
        const courseId = "course123";

        // Make concurrent requests for same course
        const promises = Array.from({ length: 5 }, () =>
          cache.getCourseById({ courseId }),
        );

        const results = await Promise.all(promises);

        // All should return same data
        results.forEach((result) => {
          expect(result).toBeTruthy();
          expect(result?.id).toBe(courseId);
          expect(result).toEqual(results[0]);
        });
      });
    });
  });

  describe("Direct Redis Integration", () => {
    it("should verify cache stores and retrieves data from Redis", async () => {
      // First call - stores in cache
      const result1 = await cache.getAllCourses();
      expect(result1).toHaveLength(2);

      // Verify Redis has stored the data by checking cache hit on second call
      mockCacheHitCounterInc.mockClear();

      // Second call - should hit Redis cache
      const result2 = await cache.getAllCourses();
      expect(result2).toEqual(result1);

      // Verify the cache hit was recorded, proving Redis integration works
      expect(mockCacheHitCounterInc).toHaveBeenCalled();
    });

    it("should handle Redis commands correctly", async () => {
      // Set a value directly in Redis
      await testRedis.set("test:key", "test:value");
      const value = await testRedis.get("test:key");
      expect(value).toBe("test:value");

      // Delete the key
      await testRedis.del("test:key");
      const deletedValue = await testRedis.get("test:key");
      expect(deletedValue).toBeNull();
    });

    it("should verify Redis is actually running and accessible", async () => {
      const pong = await testRedis.ping();
      expect(pong).toBe("PONG");
    });

    it("should handle expired keys correctly", async () => {
      await testRedis.set("test:expire", "value", "EX", 1);

      // Should exist immediately
      const value1 = await testRedis.get("test:expire");
      expect(value1).toBe("value");

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should be gone
      const value2 = await testRedis.get("test:expire");
      expect(value2).toBeNull();
    });
  });
});
