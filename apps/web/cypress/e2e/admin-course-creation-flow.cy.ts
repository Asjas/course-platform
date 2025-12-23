describe("Admin Course Creation Flow", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display course creation form", () => {
    cy.visit("/admin/courses/create");

    // Verify form fields are present
    cy.get('input[name="name"]').should("be.visible");
    cy.get('input[name="slug"]').should("be.visible");
    cy.get('textarea[name="description"]').should("be.visible");
    cy.get('select[name="level"]').should("be.visible");
    cy.get('input[name="price"]').should("be.visible");
  });

  it("should show course structure preview", () => {
    cy.visit("/admin/courses/create");

    // Verify preview section exists
    cy.contains("Course Structure").should("be.visible");
  });
});
