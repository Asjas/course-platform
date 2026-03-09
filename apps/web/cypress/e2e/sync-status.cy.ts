describe("Sync Status Page", () => {
  it("redirects unauthenticated users to signin", () => {
    cy.visit("/sync-status");
    cy.url().should("include", "/signin");
  });

  it("renders sync status overview and tabs for authenticated users", () => {
    cy.loginAsRegularUser();
    cy.visit("/sync-status");

    cy.contains("h1", "Sync Status").should("be.visible");
    cy.contains("Monitor real-time data synchronization").should("be.visible");
    cy.contains("Online").should("be.visible");
    cy.contains("All (7)").should("be.visible");
    cy.contains("Connected").should("be.visible");
    cy.contains("Offline").should("be.visible");
    cy.contains("Support Tickets").should("be.visible");
    cy.contains("Courses").should("be.visible");
  });
});
