describe("Admin Course Editor", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display course editor page", () => {
    cy.visit("/admin/courses");
    
    // Verify courses page loads
    cy.contains("Courses").should("be.visible");
  });
});
