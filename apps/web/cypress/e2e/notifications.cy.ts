const NOTIFICATION_LOAD_TIMEOUT = 15000;

function interceptNotificationQueries() {
  cy.intercept("GET", "**/trpc/announcements.getUnreadForUser*").as(
    "getUnreadAnnouncements",
  );
  cy.intercept("GET", "**/trpc/notifications.getUnreadForUser*").as(
    "getUnreadNotifications",
  );
  cy.intercept("GET", "**/trpc/announcements.getReadForUser*").as(
    "getReadAnnouncements",
  );
  cy.intercept("GET", "**/trpc/notifications.getReadForUser*").as(
    "getReadNotifications",
  );
}

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
    interceptNotificationQueries();

    cy.contains("button", "Notifications").first().click();

    // Wait for the notification data to load before asserting
    cy.wait("@getUnreadAnnouncements", { timeout: NOTIFICATION_LOAD_TIMEOUT });
    cy.wait("@getUnreadNotifications", { timeout: NOTIFICATION_LOAD_TIMEOUT });

    // The New tab should show the empty state (test user has no notifications)
    cy.contains("No new notifications").should("be.visible");
  });

  it("should switch to Read tab and show content", () => {
    interceptNotificationQueries();

    cy.contains("button", "Notifications").first().click();

    // Wait for initial data to load
    cy.wait("@getUnreadAnnouncements", { timeout: NOTIFICATION_LOAD_TIMEOUT });
    cy.wait("@getUnreadNotifications", { timeout: NOTIFICATION_LOAD_TIMEOUT });

    // Click the Read tab
    cy.contains("button", "Read").click();

    // Wait for read notifications data to load
    cy.wait("@getReadAnnouncements", { timeout: NOTIFICATION_LOAD_TIMEOUT });
    cy.wait("@getReadNotifications", { timeout: NOTIFICATION_LOAD_TIMEOUT });

    // The Read tab should show the empty state (test user has no read notifications)
    cy.contains("No read notifications").should("be.visible");
  });

  it("should switch back to New tab after viewing Read tab", () => {
    interceptNotificationQueries();

    cy.contains("button", "Notifications").first().click();

    // Wait for initial data to load
    cy.wait("@getUnreadAnnouncements", { timeout: NOTIFICATION_LOAD_TIMEOUT });
    cy.wait("@getUnreadNotifications", { timeout: NOTIFICATION_LOAD_TIMEOUT });

    // Switch to Read tab
    cy.contains("button", "Read").click();
    cy.wait("@getReadAnnouncements", { timeout: NOTIFICATION_LOAD_TIMEOUT });
    cy.wait("@getReadNotifications", { timeout: NOTIFICATION_LOAD_TIMEOUT });

    // Switch back to New tab
    cy.contains("button", /^New/).click();

    // Verify the New tab content shows the empty state
    cy.contains("No new notifications").should("be.visible");
  });
});
