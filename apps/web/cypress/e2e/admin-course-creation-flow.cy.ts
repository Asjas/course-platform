describe("Static Build", () => {
  it("should successfully build and serve the application", () => {
    cy.visit("/");
    cy.get("body").should("exist");
  });
});
