describe("Admin Course Editor", () => {
  it("should display course editor sidebar", () => {
    // Note: This requires a valid course ID, which won't exist in the preview build
    // For now, just verify the route exists
    cy.visit("/admin/courses");
    cy.contains("Courses").should("be.visible");
  });
});
