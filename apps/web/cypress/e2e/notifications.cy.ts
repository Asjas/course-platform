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
  });

  it("should display the notifications bell on dashboard", () => {
    cy.visit("/dashboard");
    // The notification bell uses a sr-only span with text "Notifications"
    cy.contains("button", "Notifications").should("exist");
  });

  it("should show notification panel when bell is clicked", () => {
    cy.visit("/dashboard");
    cy.contains("button", "Notifications").first().click();

    // Should show some notification content after clicking the bell
    // The PopoverPanel renders notification content
    cy.get("h3").contains("Notifications").should("exist");
  });
});
