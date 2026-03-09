describe("Purchases Route", () => {
  it("redirects unauthenticated users to signin", () => {
    cy.visit("/purchases");
    cy.url().should("include", "/signin");
  });

  it("shows purchases portal redirect message for authenticated users", () => {
    cy.loginAsRegularUser();
    cy.visit("/purchases");

    cy.contains("Redirecting you to the Polar.sh purchases portal.").should(
      "be.visible",
    );
    cy.contains("Please wait...").should("be.visible");
  });
});
