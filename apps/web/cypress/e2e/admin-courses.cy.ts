describe("Application Build", () => {
  it("should serve the built application", () => {
    cy.visit("/");
    cy.get("body").should("exist");
  });
});
