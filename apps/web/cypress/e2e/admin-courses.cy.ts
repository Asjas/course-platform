describe("Admin Courses Management", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display courses list page", () => {
    cy.visit("/admin/courses");

    // Verify page loads
    cy.contains("Courses").should("be.visible");
  });

  it("should navigate to create course page", () => {
    cy.visit("/admin/courses");

    cy.contains("Create Course").click();
    cy.url().should("include", "/admin/courses/create");
  });
});
