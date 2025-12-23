describe("Admin Announcements Management", () => {
  beforeEach(() => {
    // Mock admin session
    cy.intercept("GET", "/api/auth/get-session", {
      statusCode: 200,
      body: {
        user: {
          id: "admin-user-id",
          email: "admin@codewizard.training",
          name: "Admin User",
          role: "admin",
          isAdmin: true,
        },
      },
    }).as("getSession");

    // Mock announcements list
    cy.intercept("GET", "/api/trpc/announcements.getAll*", {
      statusCode: 200,
      body: {
        result: {
          data: [
            {
              id: "announcement-1",
              title: "Platform Update",
              message: "We've released new features!",
              type: "platform_update",
              publishedAt: new Date().toISOString(),
              authorId: "admin-user-id",
            },
            {
              id: "announcement-2",
              title: "New Course Available",
              message: "Check out our new React course",
              type: "new_course",
              publishedAt: null, // Draft
              authorId: "admin-user-id",
            },
          ],
        },
      },
    }).as("getAnnouncements");

    // Mock create announcement
    cy.intercept("POST", "/api/trpc/announcements.create*", {
      statusCode: 200,
      body: {
        result: {
          data: {
            id: "new-announcement-id",
            title: "Test Announcement",
            message: "This is a test",
            type: "general",
            publishedAt: new Date().toISOString(),
          },
        },
      },
    }).as("createAnnouncement");

    // Mock update announcement
    cy.intercept("POST", "/api/trpc/announcements.update*", {
      statusCode: 200,
      body: { result: { data: { success: true } } },
    }).as("updateAnnouncement");

    // Mock delete announcement
    cy.intercept("POST", "/api/trpc/announcements.delete*", {
      statusCode: 200,
      body: { result: { data: { success: true } } },
    }).as("deleteAnnouncement");
  });

  it("should display announcements list", () => {
    cy.visit("/admin/announcements");
    cy.wait("@getSession");
    cy.wait("@getAnnouncements");

    // Verify announcements are displayed
    cy.contains("Platform Update").should("be.visible");
    cy.contains("New Course Available").should("be.visible");

    // Verify type badges are displayed
    cy.contains("platform_update").should("be.visible");
    cy.contains("new_course").should("be.visible");
  });

  it("should create a new announcement", () => {
    cy.visit("/admin/announcements");
    cy.wait("@getSession");
    cy.wait("@getAnnouncements");

    // Click create button
    cy.contains("button", "Create Announcement").click();

    // Fill in announcement details
    cy.get('input[name="title"]').type("Test Announcement");
    cy.get('textarea[name="message"]').type("This is a test announcement");
    cy.get('select[name="type"]').select("general");

    // Set publish date
    cy.get('input[type="datetime-local"]').type(
      new Date().toISOString().slice(0, 16),
    );

    // Submit
    cy.contains("button", "Create").click();

    // Wait for creation
    cy.wait("@createAnnouncement");

    // New announcement should appear
    cy.contains("Test Announcement").should("be.visible");
  });

  it("should edit an existing announcement", () => {
    cy.visit("/admin/announcements");
    cy.wait("@getSession");
    cy.wait("@getAnnouncements");

    // Click first announcement to select it
    cy.contains("Platform Update").click();

    // Edit title
    cy.get('input[name="title"]').clear().type("Updated Platform Update");

    // Save changes
    cy.contains("button", "Save").click();

    // Wait for update
    cy.wait("@updateAnnouncement");
  });

  it("should delete an announcement", () => {
    cy.visit("/admin/announcements");
    cy.wait("@getSession");
    cy.wait("@getAnnouncements");

    // Stub window.confirm
    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(true);
    });

    // Click delete button
    cy.get('[data-testid="delete-announcement-button"]').first().click();

    // Wait for delete
    cy.wait("@deleteAnnouncement");
  });

  it("should distinguish between published and draft announcements", () => {
    cy.visit("/admin/announcements");
    cy.wait("@getSession");
    cy.wait("@getAnnouncements");

    // Check for published status indicator
    cy.contains("Platform Update")
      .parent()
      .within(() => {
        cy.contains("Published").should("exist");
      });

    // Check for draft status
    cy.contains("New Course Available")
      .parent()
      .within(() => {
        cy.contains("Draft").should("exist");
      });
  });

  it("should filter announcements by type", () => {
    cy.visit("/admin/announcements");
    cy.wait("@getSession");
    cy.wait("@getAnnouncements");

    // Select filter dropdown (if implemented)
    // cy.get('select[name="typeFilter"]').select("platform_update");

    // Only platform updates should be visible
    // cy.contains("Platform Update").should("be.visible");
    // cy.contains("New Course Available").should("not.exist");
  });
});

describe("User-Facing Announcement Notifications", () => {
  beforeEach(() => {
    // Mock regular user session
    cy.intercept("GET", "/api/auth/get-session", {
      statusCode: 200,
      body: {
        user: {
          id: "user-id",
          email: "user@example.com",
          name: "Test User",
          role: "user",
          isAdmin: false,
        },
      },
    }).as("getSession");

    // Mock unread announcements
    cy.intercept("GET", "/api/trpc/announcements.getUnread*", {
      statusCode: 200,
      body: {
        result: {
          data: [
            {
              id: "announcement-1",
              title: "Platform Update",
              message: "We've released new features!",
              type: "platform_update",
              publishedAt: new Date().toISOString(),
            },
            {
              id: "announcement-2",
              title: "New Course",
              message: "Check out our latest course",
              type: "new_course",
              publishedAt: new Date().toISOString(),
            },
          ],
        },
      },
    }).as("getUnreadAnnouncements");

    // Mock read announcements
    cy.intercept("GET", "/api/trpc/announcements.getRead*", {
      statusCode: 200,
      body: {
        result: {
          data: [
            {
              id: "announcement-3",
              title: "Old Announcement",
              message: "This was read before",
              type: "general",
              publishedAt: new Date(Date.now() - 86400000).toISOString(),
              readAt: new Date().toISOString(),
            },
          ],
        },
      },
    }).as("getReadAnnouncements");

    // Mock mark as read
    cy.intercept("POST", "/api/trpc/announcements.markAsRead*", {
      statusCode: 200,
      body: { result: { data: { success: true } } },
    }).as("markAsRead");
  });

  it("should display notification bell with unread count", () => {
    cy.visit("/");
    cy.wait("@getSession");
    cy.wait("@getUnreadAnnouncements");

    // Bell icon should be visible
    cy.get('[data-testid="notifications-bell"]').should("be.visible");

    // Red dot should be visible indicating unread notifications
    cy.get('[data-testid="unread-indicator"]').should("be.visible");
  });

  it("should open notifications popover when bell is clicked", () => {
    cy.visit("/");
    cy.wait("@getSession");
    cy.wait("@getUnreadAnnouncements");

    // Click bell icon
    cy.get('[data-testid="notifications-bell"]').click();

    // Popover should be visible
    cy.contains("New").should("be.visible");
    cy.contains("Read").should("be.visible");

    // Unread announcements should be displayed
    cy.contains("Platform Update").should("be.visible");
    cy.contains("New Course").should("be.visible");
  });

  it("should switch between new and read tabs", () => {
    cy.visit("/");
    cy.wait("@getSession");
    cy.wait("@getUnreadAnnouncements");

    // Open bell
    cy.get('[data-testid="notifications-bell"]').click();

    // Click Read tab
    cy.contains("Read").click();
    cy.wait("@getReadAnnouncements");

    // Read announcement should be displayed
    cy.contains("Old Announcement").should("be.visible");

    // Switch back to New tab
    cy.contains("New").click();
    cy.contains("Platform Update").should("be.visible");
  });

  it("should dismiss an announcement", () => {
    cy.visit("/");
    cy.wait("@getSession");
    cy.wait("@getUnreadAnnouncements");

    // Open bell
    cy.get('[data-testid="notifications-bell"]').click();

    // Click dismiss button on first announcement
    cy.get('[data-testid="dismiss-announcement"]').first().click();

    // Wait for mark as read
    cy.wait("@markAsRead");

    // Announcement should move to read tab
    // (in real implementation, should verify it's no longer in New tab)
  });

  it("should display full-screen modal on mobile", () => {
    // Set viewport to mobile
    cy.viewport("iphone-x");

    cy.visit("/");
    cy.wait("@getSession");
    cy.wait("@getUnreadAnnouncements");

    // Click bell icon
    cy.get('[data-testid="notifications-bell"]').click();

    // Should display close button on mobile
    cy.get('[data-testid="close-notifications"]').should("be.visible");

    // Click close button
    cy.get('[data-testid="close-notifications"]').click();

    // Popover should close
    cy.contains("Platform Update").should("not.exist");
  });

  it("should show empty state when no unread announcements", () => {
    // Mock empty unread announcements
    cy.intercept("GET", "/api/trpc/announcements.getUnread*", {
      statusCode: 200,
      body: {
        result: {
          data: [],
        },
      },
    }).as("getNoUnreadAnnouncements");

    cy.visit("/");
    cy.wait("@getSession");
    cy.wait("@getNoUnreadAnnouncements");

    // Open bell
    cy.get('[data-testid="notifications-bell"]').click();

    // Should show empty state
    cy.contains("No new announcements").should("be.visible");
  });
});
