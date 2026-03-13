describe("Notifications - Unauthenticated", () => {
  it("should not show notifications bell when not logged in", () => {
    cy.visit("/");
    // Notification bell should not be visible for unauthenticated users
    // The bell uses an sr-only span "Notifications" rather than aria-label
    cy.contains("button", "Notifications").should("not.exist");
  });
});

describe("Notifications - Authenticated", () => {
  function assertNewTabContentVisible() {
    cy.get("body").then(($body) => {
      const hasEmpty = $body.text().includes("No new notifications");

      if (hasEmpty) {
        return cy
          .contains("No new notifications", { timeout: 10000 })
          .should("be.visible");
      }

      // If there are notifications, assert at least one item card is rendered.
      return cy
        .get('[aria-label="Dismiss notification"]', {
          timeout: 10000,
        })
        .should("have.length.greaterThan", 0);
    });
  }

  function assertReadTabContentVisible() {
    cy.get("body").then(($body) => {
      const hasEmpty = $body.text().includes("No read notifications");

      if (hasEmpty) {
        return cy
          .contains("No read notifications", { timeout: 10000 })
          .should("be.visible");
      }

      return cy.contains("Dismissed", { timeout: 10000 }).should("be.visible");
    });
  }

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

  it("should render New tab content", () => {
    cy.contains("button", "Notifications").first().click();
    assertNewTabContentVisible();
  });

  it("should switch to Read tab and render content", () => {
    cy.contains("button", "Notifications").first().click();
    assertNewTabContentVisible();

    // Click the Read tab
    cy.contains("button", "Read").click();
    assertReadTabContentVisible();
  });

  it("should switch back to New tab after viewing Read tab", () => {
    cy.contains("button", "Notifications").first().click();
    assertNewTabContentVisible();

    // Switch to Read tab
    cy.contains("button", "Read").click();
    assertReadTabContentVisible();

    // Switch back to New tab
    cy.contains("button", /^New/).click();
    assertNewTabContentVisible();
  });
});
