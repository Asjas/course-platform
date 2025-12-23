describe("Application", () => {
  it("should load without errors", () => {
    cy.visit("/");
    cy.get("body").should("exist");
  });
});
