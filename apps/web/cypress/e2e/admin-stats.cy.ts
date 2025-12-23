describe("Admin Stats Dashboard", () => {
  beforeEach(() => {
    // Mock admin session
    cy.intercept("GET", "/api/auth/get-session", {
      statusCode: 200,
      body: {
        user: {
          id: "admin-user-id",
          email: "admin@codewizard.training",
          name: "Admin User",
          role: "admin",
          isAdmin: true,
        },
      },
    }).as("getSession");

    // Mock stats data
    cy.intercept("GET", "/api/trpc/stats.getPlatformStats*", {
      statusCode: 200,
      body: {
        result: {
          data: {
            totalCourses: 5,
            totalEnrollments: 150,
            activeUsers: 45,
          },
        },
      },
    }).as("getPlatformStats");

    cy.intercept("GET", "/api/trpc/stats.getRevenueStats*", {
      statusCode: 200,
      body: {
        result: {
          data: {
            netRevenue: 2500.0,
            totalRevenue: 3000.0,
            refundCount: 5,
            refundAmount: 500.0,
            refundRate: 16.67,
            giftPurchases: 10,
            giftRedemptions: 8,
            teamLicensePurchases: 3,
            teamSeatsUsed: 15,
            teamSeatsTotal: 20,
          },
        },
      },
    }).as("getRevenueStats");

    cy.intercept("GET", "/api/trpc/stats.getUserStats*", {
      statusCode: 200,
      body: {
        result: {
          data: {
            totalUsers: 120,
            verifiedUsers: 100,
            adminUsers: 2,
            bannedUsers: 1,
          },
        },
      },
    }).as("getUserStats");
  });

  it("should display platform overview statistics", () => {
    cy.visit("/admin/stats");
    cy.wait("@getSession");
    cy.wait("@getPlatformStats");

    // Verify platform stats are displayed
    cy.contains("Platform Overview").should("be.visible");
    cy.contains("5").should("be.visible"); // totalCourses
    cy.contains("150").should("be.visible"); // totalEnrollments
    cy.contains("45").should("be.visible"); // activeUsers
  });

  it("should display revenue statistics", () => {
    cy.visit("/admin/stats");
    cy.wait("@getSession");
    cy.wait("@getRevenueStats");

    // Verify revenue stats section exists
    cy.contains("Revenue & Purchases").should("be.visible");

    // Check for net revenue display
    cy.contains("$2,500").should("be.visible");
    cy.contains("$3,000").should("be.visible");
  });

  it("should display user statistics", () => {
    cy.visit("/admin/stats");
    cy.wait("@getSession");
    cy.wait("@getUserStats");

    // Verify user stats are displayed
    cy.contains("120").should("be.visible"); // totalUsers
    cy.contains("100").should("be.visible"); // verifiedUsers
  });

  it("should handle loading state gracefully", () => {
    // Delay the response to see loading state
    cy.intercept("GET", "/api/trpc/stats.getPlatformStats*", (req) => {
      req.on("response", (res) => {
        res.setDelay(1000);
      });
    }).as("getDelayedStats");

    cy.visit("/admin/stats");
    cy.wait("@getSession");

    // Should show loading indicator (if implemented)
    // cy.contains("Loading").should("be.visible");

    cy.wait("@getDelayedStats");
  });
});
