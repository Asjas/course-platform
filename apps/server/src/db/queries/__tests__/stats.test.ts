import {
  getAnnouncementStats,
  getCouponStats,
  getCourseStats,
  getPlatformStats,
  getProgressStats,
  getRevenueStats,
  getSupportStats,
  getTeamLicenseStats,
  getUserStats,
  getWishlistStats,
} from "../stats.js";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn(),
    query: {
      platformAnnouncement: {
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock("~/db/index.js", () => ({
  db: mockDb,
}));

vi.mock("drizzle-orm", async () => {
  const actual = await vi.importActual("drizzle-orm");
  return {
    ...actual,
    count: vi.fn(() => "count()"),
    desc: vi.fn((field) => field),
    eq: vi.fn(() => true),
    sql: {
      placeholder: vi.fn((name) => `placeholder:${name}`),
    } as never,
  };
});

describe("getCourseStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns course stats with enrollment data", async () => {
    const mockEnrollmentStats = [
      {
        courseId: "course:1",
        totalEnrollments: 100,
        activeEnrollments: 60,
        completedEnrollments: 30,
      },
    ];

    const mockCourses = [
      {
        id: "course:1",
        name: "Test Course",
        slug: "test-course",
        published: true,
        price: 99,
        totalModules: 5,
        totalLessons: 25,
      },
    ];

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockResolvedValue(mockEnrollmentStats),
    });

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockResolvedValue(mockCourses),
    });

    const result = await getCourseStats();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "course:1",
      name: "Test Course",
      totalEnrollments: 100,
      activeEnrollments: 60,
      completedEnrollments: 30,
      completionRate: 30,
    });
  });

  test("handles courses with no enrollments", async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockResolvedValue([]),
    });

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockResolvedValue([
        {
          id: "course:2",
          name: "Empty Course",
          slug: "empty",
          published: false,
          price: 0,
          totalModules: 0,
          totalLessons: 0,
        },
      ]),
    });

    const result = await getCourseStats();

    expect(result[0]).toMatchObject({
      totalEnrollments: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      completionRate: 0,
    });
  });
});

describe("getPlatformStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns platform statistics", async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([{ count: 50 }]),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([{ count: 200 }]),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 150 }]),
      });

    const result = await getPlatformStats();

    expect(result).toEqual({
      totalCourses: 50,
      totalEnrollments: 200,
      activeEnrollments: 150,
    });
  });

  test("handles zero counts", async () => {
    mockDb.select
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) })
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      });

    const result = await getPlatformStats();

    expect(result).toEqual({
      totalCourses: 0,
      totalEnrollments: 0,
      activeEnrollments: 0,
    });
  });
});

describe("getRevenueStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calculates revenue statistics correctly", async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockResolvedValue([
        {
          totalRevenue: 10000,
          refundedAmount: 1000,
          totalPaid: 100,
          refundCount: 10,
          giftCount: 5,
          teamPurchaseCount: 2,
        },
      ]),
    });

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockResolvedValue([
        {
          individualCount: 80,
          giftCount: 10,
          teamCount: 5,
          refundedCount: 3,
          cancelledCount: 2,
        },
      ]),
    });

    const result = await getRevenueStats();

    expect(result.totalRevenue).toBe(10000);
    expect(result.netRevenue).toBe(9000);
    expect(result.refundRate).toBe(10);
    expect(result.individualEnrollments).toBe(80);
  });

  test("handles zero revenue scenario", async () => {
    mockDb.select
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) })
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) });

    const result = await getRevenueStats();

    expect(result.totalRevenue).toBe(0);
    expect(result.refundRate).toBe(0);
  });
});

describe("getSupportStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calculates support ticket statistics", async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockResolvedValue([
        {
          totalTickets: 100,
          openTickets: 30,
          inProgressTickets: 20,
          resolvedTickets: 40,
          closedTickets: 10,
          urgentTickets: 5,
          highPriorityTickets: 15,
        },
      ]),
    });

    const result = await getSupportStats();

    expect(result.totalTickets).toBe(100);
    expect(result.activeTickets).toBe(50);
    expect(result.resolutionRate).toBe(50);
  });

  test("handles no tickets scenario", async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockResolvedValue([]),
    });

    const result = await getSupportStats();

    expect(result.totalTickets).toBe(0);
    expect(result.resolutionRate).toBe(0);
  });
});

describe("getUserStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calculates user statistics", async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockResolvedValue([
        {
          totalUsers: 500,
          bannedUsers: 10,
          verifiedUsers: 450,
          adminUsers: 5,
        },
      ]),
    });

    const result = await getUserStats();

    expect(result.totalUsers).toBe(500);
    expect(result.activeUsers).toBe(490);
    expect(result.verificationRate).toBe(90);
  });

  test("prevents division by zero", async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockResolvedValue([]),
    });

    const result = await getUserStats();

    expect(result.verificationRate).toBe(0);
  });
});

describe("getCouponStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calculates coupon statistics", async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: vi
          .fn()
          .mockResolvedValue([{ totalCoupons: 20, activeCoupons: 15 }]),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([{ totalRedemptions: 100 }]),
      });

    const result = await getCouponStats();

    expect(result.totalCoupons).toBe(20);
    expect(result.avgRedemptionsPerCoupon).toBe(5);
  });

  test("handles zero coupons", async () => {
    mockDb.select
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) })
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) });

    const result = await getCouponStats();

    expect(result.avgRedemptionsPerCoupon).toBe(0);
  });
});

describe("getTeamLicenseStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calculates team license statistics", async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: vi
          .fn()
          .mockResolvedValue([
            { totalLicenses: 10, totalSeats: 100, claimedSeats: 75 },
          ]),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([
          {
            totalInvites: 100,
            pendingInvites: 25,
            claimedInvites: 75,
          },
        ]),
      });

    const result = await getTeamLicenseStats();

    expect(result.totalLicenses).toBe(10);
    expect(result.availableSeats).toBe(25);
    expect(result.seatUtilization).toBe(75);
  });

  test("handles no licenses", async () => {
    mockDb.select
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) })
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) });

    const result = await getTeamLicenseStats();

    expect(result.seatUtilization).toBe(0);
  });
});

describe("getProgressStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calculates progress statistics", async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([
          {
            totalCourseProgress: 100,
            completedCourses: 60,
            avgProgress: 75.5,
          },
        ]),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([
          {
            totalLessonProgress: 500,
            completedLessons: 400,
          },
        ]),
      });

    const result = await getProgressStats();

    expect(result.courseCompletionRate).toBe(60);
    expect(result.lessonCompletionRate).toBe(80);
    expect(result.avgCourseProgress).toBe(76);
  });

  test("handles no progress data", async () => {
    mockDb.select
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) })
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) });

    const result = await getProgressStats();

    expect(result.courseCompletionRate).toBe(0);
    expect(result.lessonCompletionRate).toBe(0);
  });
});

describe("getWishlistStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns wishlist statistics with top wishlisted courses", async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([{ totalWishlistItems: 250 }]),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            courseId: "course:1",
            courseName: "Popular Course",
            wishlistCount: 50,
          },
          {
            courseId: "course:2",
            courseName: "Second Course",
            wishlistCount: 30,
          },
        ]),
      });

    const result = await getWishlistStats();

    expect(result.totalWishlistItems).toBe(250);
    expect(result.topWishlisted).toHaveLength(2);
    expect(result.topWishlisted[0].count).toBe(50);
  });

  test("handles missing course names", async () => {
    mockDb.select
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            courseId: "course:3",
            courseName: null,
            wishlistCount: 10,
          },
        ]),
      });

    const result = await getWishlistStats();

    expect(result.topWishlisted[0].courseName).toBe("Unknown");
  });
});

describe("getAnnouncementStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("calculates announcement statistics", async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: vi
          .fn()
          .mockResolvedValue([
            { totalAnnouncements: 50, publishedAnnouncements: 40 },
          ]),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockResolvedValue([{ totalReads: 500 }]),
      });

    const result = await getAnnouncementStats();

    expect(result.totalAnnouncements).toBe(50);
    expect(result.publishedAnnouncements).toBe(40);
    expect(result.totalReads).toBe(500);
  });

  test("handles no announcements", async () => {
    mockDb.select
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) })
      .mockReturnValueOnce({ from: vi.fn().mockResolvedValue([]) });

    const result = await getAnnouncementStats();

    expect(result.totalAnnouncements).toBe(0);
  });
});
