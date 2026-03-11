describe("Default Layout Structure", () => {
  it("should render the skip-to-main link for accessibility", () => {
    cy.visit("/");
    // The skip link has class sr-only but should be in the DOM
    cy.get('a[href="#maincontent"]')
      .should("exist")
      .and("contain.text", "Skip to main");
  });

  it("should render header and footer on every public page", () => {
    cy.visit("/");
    cy.get("header, nav").should("exist");
    cy.get("footer").should("exist");
  });

  it("should render header and footer on the terms page", () => {
    cy.visit("/terms");
    cy.get("header, nav").should("exist");
    cy.get("footer").should("exist");
  });

  it("should render header and footer on the dashboard for authenticated users", () => {
    cy.loginAsRegularUser();
    cy.visit("/dashboard");
    cy.get("header, nav").should("exist");
    cy.get("footer").should("exist");
  });
});
