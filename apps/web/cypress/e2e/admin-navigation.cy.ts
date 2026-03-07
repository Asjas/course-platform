describe("Admin Navigation & Access Control", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display admin navigation menu for admin users", () => {
    cy.visit("/admin");

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
});

describe("Non-Admin Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should redirect non-admin users away from admin pages", () => {
    cy.visit("/admin/courses");

    // Should redirect away from admin area
    cy.url().should("include", "/dashboard");
    cy.contains("Access denied. Admin privileges are required.").should(
      "be.visible",
    );
  });

  it("should not display admin navigation for regular users", () => {
    cy.visit("/dashboard");

    // Admin link should not be visible
    cy.contains("Admin").should("not.exist");
  });
});
