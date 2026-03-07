describe("Theme Toggle", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display the theme toggle button", () => {
    cy.get("button").filter('[aria-label*="theme"]').should("exist");
  });

  it("should have an accessible label indicating current theme", () => {
    cy.get("button").filter('[aria-label*="Change theme"]').should("exist");
  });

  it("should show theme options on click", () => {
    cy.get("button").filter('[aria-label*="theme"]').first().click();

    cy.contains("Light").should("be.visible");
    cy.contains("Dark").should("be.visible");
    cy.contains("System").should("be.visible");
  });

  it("should switch to light theme", () => {
    cy.get("button").filter('[aria-label*="theme"]').first().click();

    cy.contains("Light").click();

    // HTML element should not have dark class
    cy.get("html").should("not.have.class", "dark");
  });

  it("should switch to dark theme", () => {
    cy.get("button").filter('[aria-label*="theme"]').first().click();

    cy.contains("Dark").click();

    // HTML element should have dark class
    cy.get("html").should("have.class", "dark");
  });

  it("should persist theme preference across page navigation", () => {
    // Set to light theme
    cy.get("button").filter('[aria-label*="theme"]').first().click();
    cy.contains("Light").click();

    // Navigate to another page
    cy.visit("/terms");

    // Theme should still be light
    cy.get("html").should("not.have.class", "dark");
  });
});
