describe("Downloads Page", () => {
  beforeEach(() => {
    cy.visit("/downloads");
  });

  it("should display the downloads page with heading", () => {
    cy.get("h1").contains("Downloads").should("be.visible");
  });

  it("should display the coming soon message", () => {
    cy.contains("Downloads will be available here soon").should("be.visible");
    cy.contains("Check back later").should("be.visible");
  });

  it("should display a description of the page purpose", () => {
    cy.contains("Access course materials, resources, and tools").should(
      "be.visible",
    );
  });
});
