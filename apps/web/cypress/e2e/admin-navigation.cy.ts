describe("Admin Navigation & Access Control", () => {
  beforeEach(() => {
    // Intercept auth check to simulate admin user
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
        session: {
          id: "session-id",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        },
      },
    }).as("getSession");
  });

  it("should display admin navigation menu for admin users", () => {
    cy.visit("/admin");

    // Wait for auth check
    cy.wait("@getSession");

    // Verify admin sidebar links exist
    cy.contains("Stats").should("be.visible");
    cy.contains("Users").should("be.visible");
    cy.contains("Coupons").should("be.visible");
    cy.contains("Courses").should("be.visible");
    cy.contains("Announcements").should("be.visible");
    cy.contains("Purchases").should("be.visible");
  });

  it("should navigate between admin pages", () => {
    cy.visit("/admin/stats");
    cy.wait("@getSession");

    // Navigate to Courses
    cy.contains("a", "Courses").click();
    cy.url().should("include", "/admin/courses");

    // Navigate to Announcements
    cy.contains("a", "Announcements").click();
    cy.url().should("include", "/admin/announcements");

    // Navigate back to Stats
    cy.contains("a", "Stats").click();
    cy.url().should("include", "/admin/stats");
  });

  it("should redirect non-admin users away from admin pages", () => {
    // Intercept auth to return non-admin user
    cy.intercept("GET", "/api/auth/get-session", {
      statusCode: 200,
      body: {
        user: {
          id: "regular-user-id",
          email: "user@example.com",
          name: "Regular User",
          role: "user",
          isAdmin: false,
        },
      },
    }).as("getNonAdminSession");

    cy.visit("/admin/courses");
    cy.wait("@getNonAdminSession");

    // Should redirect away from admin area
    cy.url().should("not.include", "/admin");
  });
});
