describe("Preview Server", () => {
  it("should run the preview server successfully", () => {
    cy.visit("/");
    cy.get("body").should("exist");
  });
});
