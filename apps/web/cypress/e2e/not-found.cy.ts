describe("Not Found Page", () => {
  it("should display 'Page not found' text for an invalid route", () => {
    cy.visit("/this-page-does-not-exist", { failOnStatusCode: false });
    cy.contains("Page not found").should("be.visible");
  });

  it("should display a link to go back to the home page", () => {
    cy.visit("/this-page-does-not-exist", { failOnStatusCode: false });
    cy.get("a").contains("Go to home").should("have.attr", "href", "/");
  });

  it("should navigate back to home when 'Go to home' link is clicked", () => {
    cy.visit("/this-page-does-not-exist", { failOnStatusCode: false });
    cy.get("a").contains("Go to home").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });
});
