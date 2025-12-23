describe("Admin Course Creation Flow", () => {
  it("should display course creation form", () => {
    cy.visit("/admin/courses/create");
    
    // Verify the form loads
    cy.contains("Create New Course").should("be.visible");
    cy.get('input[name="name"]').should("exist");
    cy.get('input[name="slug"]').should("exist");
    cy.get('textarea[name="description"]').should("exist");
    cy.contains("Create Course").should("be.visible");
  });
});
