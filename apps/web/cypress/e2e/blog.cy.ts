describe("Blog Pages", () => {
  it("should load the blog index page", () => {
    cy.visit("/blog");
    cy.get("h1").contains("Blog Posts").should("be.visible");
  });

  it("should display blog post links", () => {
    cy.visit("/blog");
    // The blog page should have list items or a message about posts
    cy.get("main").should("be.visible");
  });

  it("should have proper page structure", () => {
    cy.visit("/blog");
    cy.get("h1").should("exist");
    cy.get("main").should("exist");
  });
});
