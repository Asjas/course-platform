describe("Admin Navigation & Access Control", () => {
  it("should display admin navigation menu", () => {
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
