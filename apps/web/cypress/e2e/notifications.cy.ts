describe("Notifications - Unauthenticated", () => {
  it("should not show notifications bell when not logged in", () => {
    cy.visit("/");
    // Notification bell should not be visible for unauthenticated users
    // The bell uses an sr-only span "Notifications" rather than aria-label
    cy.contains("button", "Notifications").should("not.exist");
  });
});

describe("Notifications - Authenticated", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
    cy.visit("/dashboard");
  });

  it("should display the notifications bell on dashboard", () => {
    // The notification bell uses a sr-only span with text "Notifications"
    cy.contains("button", "Notifications").should("exist");
  });

  it("should show notification panel with heading when bell is clicked", () => {
    cy.contains("button", "Notifications").first().click();

    // Should show the Notifications heading inside the popover
    cy.get("h3").contains("Notifications").should("be.visible");
  });

  it("should show New and Read tab buttons in the panel", () => {
    cy.contains("button", "Notifications").first().click();

    // The New tab button should be visible (active by default)
    cy.contains("button", /^New/).should("be.visible");
    cy.contains("button", "Read").should("be.visible");
  });

  it("should display notification items or empty state in New tab", () => {
    cy.contains("button", "Notifications").first().click();

    // The New tab should show either notification items or the empty state text
    cy.get("body").then(($body) => {
      if ($body.find(':contains("No new notifications")').length > 0) {
        cy.contains("No new notifications").should("be.visible");
      } else {
        // If there are notifications, at least one notification item should be rendered
        cy.get("h4").should("have.length.greaterThan", 0);
      }
      return undefined;
    });
  });

  it("should switch to Read tab and show content", () => {
    cy.contains("button", "Notifications").first().click();

    // Click the Read tab
    cy.contains("button", "Read").click();

    // The Read tab should show either read items or the empty state text
    cy.get("body").then(($body) => {
      if ($body.find(':contains("No read notifications")').length > 0) {
        cy.contains("No read notifications").should("be.visible");
      } else {
        // If there are read notifications, at least one should be rendered
        cy.get("h4").should("have.length.greaterThan", 0);
      }
      return undefined;
    });
  });

  it("should switch back to New tab after viewing Read tab", () => {
    cy.contains("button", "Notifications").first().click();

    // Switch to Read tab
    cy.contains("button", "Read").click();
    // Switch back to New tab
    cy.contains("button", /^New/).click();

    // Verify the New tab content is shown (either items or empty state)
    cy.get("body").then(($body) => {
      if ($body.find(':contains("No new notifications")').length > 0) {
        cy.contains("No new notifications").should("be.visible");
      } else {
        cy.get("h4").should("have.length.greaterThan", 0);
      }
      return undefined;
    });
  });
});
