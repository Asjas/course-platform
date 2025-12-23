describe("Admin Courses Management", () => {
  it("should display courses page for admin", () => {
    cy.visit("/admin/courses");
    
    // Verify the page loads
    cy.contains("Courses").should("be.visible");
    cy.contains("Create Course").should("be.visible");
  });
});
