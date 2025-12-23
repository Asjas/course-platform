describe("Announcements", () => {
  it("should load the home page", () => {
    cy.visit("/");
    cy.get("body").should("exist");
  });
});
