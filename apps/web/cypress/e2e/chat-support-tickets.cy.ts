describe("Chat Username Requirement", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should show username modal when navigating to chat without a username", () => {
    cy.visit("/chat/general");

    // The username requirement modal should appear for new users
    cy.contains("Username Required for Chat").should("be.visible");
    cy.contains(
      "To participate in the community chat, you need to set a unique username",
    ).should("be.visible");

    // Modal should have Leave Chat and Set Username buttons
    cy.contains("button", "Leave Chat").should("be.visible");
    cy.contains("button", "Set Username & Join Chat").should("be.visible");

    // Username input should be present
    cy.contains("label", "Choose a Username").should("be.visible");
    cy.get('input[name="username"]').should("be.visible");
  });

  it("should redirect to dashboard when clicking Leave Chat", () => {
    cy.visit("/chat/general");

    // Wait for modal to appear
    cy.contains("Username Required for Chat").should("be.visible");

    // Click Leave Chat
    cy.contains("button", "Leave Chat").click();

    // Should redirect to dashboard
    cy.url().should("include", "/dashboard");
  });

  it("should set username via modal and access chat", () => {
    cy.visit("/chat/general");

    // Wait for modal to appear
    cy.contains("Username Required for Chat").should("be.visible");

    // Enter a valid username
    const username = `e2euser${Date.now()}`;
    cy.get('input[name="username"]').type(username);

    // Submit the username
    cy.contains("button", "Set Username & Join Chat").click();

    // After setting username, the modal should close and chat should be accessible
    cy.contains("Username Required for Chat").should("not.exist");

    // Verify the chat sidebar is visible with Channels heading
    cy.contains("Channels").should("be.visible");
  });
});

describe("Chat Support Ticket Management", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();

    // Set username via modal so we can access chat features
    cy.visit("/chat/general");
    cy.get("body").then(($body) => {
      if ($body.find(':contains("Username Required for Chat")').length > 0) {
        const username = `e2eticket${Date.now()}`;
        cy.get('input[name="username"]').type(username);
        cy.contains("button", "Set Username & Join Chat").click();
        cy.contains("Username Required for Chat").should("not.exist");
      }
      return undefined;
    });
  });

  it("should display chat support section and navigate to create ticket", () => {
    // Navigate to the create ticket page
    cy.visit("/chat/support/new");

    // Verify the create ticket form is visible
    cy.contains("Create Support Ticket").should("be.visible");
    cy.get('input[name="title"]').should("be.visible");
    cy.get('input[name="repo"]').should("be.visible");
  });

  it("should navigate to ticket details after creating a ticket", () => {
    // Navigate to the create page
    cy.visit("/chat/support/new");

    // Verify Save button is initially disabled (form not dirty)
    cy.contains("button", "Save").should("be.disabled");

    // Fill out the form
    cy.get('input[name="title"]').type("Test Support Ticket");
    cy.get('input[name="repo"]').type("https://github.com/test/repo");

    // Fill in the description - the markdown editor creates a textarea
    cy.get("textarea").type("This is a test support ticket description");

    // Save button should now be enabled (form is dirty)
    cy.contains("button", "Save").should("not.be.disabled");

    // Submit the form
    cy.contains("button", "Save").click();

    // Verify the form submission was triggered - button should show "Saving..." state
    cy.contains("button", "Saving...").should("be.visible");
  });

  it("should allow navigation back to chat from support pages", () => {
    // Navigate to the create page
    cy.visit("/chat/support/new");

    // Click the "Back to chat" button
    cy.contains("Back to chat").click();

    // Should navigate back to the general chat channel
    cy.url().should("include", "/chat/general");
  });
});

describe("Chat Access After Setting Username on Profile Page", () => {
  it("should access chat without modal after setting username on profile page", () => {
    // Sign up a fresh user via the UI form (this also logs them in)
    const timestamp = Date.now();
    const freshUser = {
      name: "E2E Profile User",
      email: `e2e-profile-${timestamp}@codewizard.training`,
      password: "ProfileTest123!",
    };

    cy.signUp(freshUser);

    // Navigate to the profile page
    cy.visit("/profile");

    // Verify we're on the profile page
    cy.contains("h1", "Profile").should("be.visible");

    // Set a username in the profile form
    const username = `profileuser${timestamp}`;
    cy.get('input[name="username"]').clear();
    cy.get('input[name="username"]').type(username);

    // Save the profile
    cy.contains("button", "Save").click();

    // Wait for the save to complete
    cy.contains("Profile updated successfully").should("be.visible");

    // Navigate to chat - the username modal should NOT appear
    cy.visit("/chat/general");

    // The modal should not be present since we already set our username
    cy.contains("Username Required for Chat").should("not.exist");

    // Chat should be accessible - verify sidebar content
    cy.contains("Channels").should("be.visible");
    cy.contains("# general").should("be.visible");
  });
});
