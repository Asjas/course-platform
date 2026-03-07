describe("Notifications - Unauthenticated", () => {
  it("should not show notifications bell when not logged in", () => {
    cy.visit("/");
    // Notification bell should not be visible for unauthenticated users
    cy.get('[aria-label*="notification"]').should("not.exist");
  });
});

describe("Notifications - Authenticated", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should display the notifications bell on dashboard", () => {
    cy.visit("/dashboard");
    // The notification bell button should be present in the header
    cy.get("button").filter('[aria-label*="otification"]').should("exist");
  });

  it("should show notification panel when bell is clicked", () => {
    cy.visit("/dashboard");
    cy.get("button").filter('[aria-label*="otification"]').first().click();

    // Should show some notification content after clicking the bell
    cy.get("body").then(($body) => {
      const hasDialog = $body.find('[role="dialog"]').length > 0;
      const hasMenu = $body.find('[role="menu"]').length > 0;
      const hasPanel =
        $body.find('[data-testid="notifications-panel"]').length > 0;
      expect(hasDialog || hasMenu || hasPanel).to.be.true;
    });
  });
});
