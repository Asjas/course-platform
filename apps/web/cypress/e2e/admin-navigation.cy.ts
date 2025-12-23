describe("Navigation", () => {
  it("should load the application", () => {
    cy.visit("/");
    cy.get("body").should("exist");
  });
});
