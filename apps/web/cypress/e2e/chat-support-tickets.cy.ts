import { faker } from "@faker-js/faker";

function ensureUsernameSetViaProfile() {
  const username = `chat_${faker.string.alphanumeric(8)}`;

  cy.visit("/profile");
  cy.get('input[name="username"]', { timeout: 10000 }).clear();
  cy.get('input[name="username"]').type(username);
  cy.contains("button", "Save").click();
  cy.contains("Profile updated successfully", { timeout: 15000 }).should(
    "be.visible",
  );
}

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

    // Enter a valid username (no dots - must match /^[a-zA-Z0-9_-]+$/)
    const username = `user_${faker.string.alphanumeric(8)}`;
    cy.get('input[name="username"]').type(username);

    // Submit the username
    cy.contains("button", "Set Username & Join Chat").click();

    // Verify chat becomes accessible; the flow triggers a page reload on success
    cy.contains("Channels", { timeout: 20000 }).should("be.visible");
  });
});

describe("Chat Support Ticket Management", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();

    // Ensure username is set deterministically before entering chat-support flows
    ensureUsernameSetViaProfile();
    cy.visit("/chat/general");
    cy.contains("Username Required for Chat").should("not.exist");
    cy.contains("Channels", { timeout: 15000 }).should("be.visible");
  });

  it("should display chat support section and navigate to create ticket", () => {
    // Navigate to the create ticket page
    cy.visit("/chat/support/new");

    // Verify the create ticket form is visible
    cy.contains("Create Support Ticket").should("be.visible");
    cy.get('input[name="title"]').should("be.visible");
    cy.get('input[name="repo"]').should("be.visible");
  });

  it("should fill and submit the create ticket form", () => {
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

    // Cancel button should also be enabled
    cy.contains("button", "Cancel").should("not.be.disabled");

    // Submit the form - use force:true to avoid being covered by sticky header
    cy.contains("button", "Save").click({ force: true });
  });

  it("should allow navigation back to chat from support pages", () => {
    // Navigate to the create page
    cy.visit("/chat/support/new");

    // Click the "Back to chat" button
    cy.contains("Back to chat").click();

    // Should navigate back to the general chat channel
    cy.url().should("include", "/chat/general");
  });

  it("should block a different user from accessing someone else's support ticket", () => {
    const ownerUser = {
      name: faker.person.fullName(),
      email: faker.internet
        .email({ provider: "e2e-owner-ticket.test" })
        .toLowerCase(),
      password: "OwnerTicket123!",
    };
    const otherUser = {
      name: faker.person.fullName(),
      email: faker.internet
        .email({ provider: "e2e-other-ticket.test" })
        .toLowerCase(),
      password: "OtherTicket123!",
    };

    const ticketTitle = `Owner Ticket ${faker.string.alphanumeric(8)}`;
    let ownerTicketId = "";

    cy.signUpViaApi(ownerUser);
    cy.signIn({ email: ownerUser.email, password: ownerUser.password });
    ensureUsernameSetViaProfile();

    cy.visit("/chat/support/new");
    cy.get('input[name="title"]').type(ticketTitle);
    cy.get('input[name="repo"]').type("https://github.com/test/repo");
    cy.get("textarea").type("Owner-only support ticket content");
    cy.contains("button", "Save").click({ force: true });

    cy.url().should("include", "/support/");
    cy.url().then((url) => {
      ownerTicketId = url.split("/support/")[1]?.split("?")[0] ?? "";
      expect(ownerTicketId).to.not.equal("");
      return null;
    });

    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
      return null;
    });

    cy.signUpViaApi(otherUser);
    cy.signIn({ email: otherUser.email, password: otherUser.password });
    ensureUsernameSetViaProfile();

    cy.then(() => {
      cy.visit(`/support/${ownerTicketId}`, {
        failOnStatusCode: false,
      });

      cy.contains(/authorized|access denied|forbidden|permission/i, {
        timeout: 15000,
      }).should("be.visible");
      cy.contains("Ticket Not Found").should("be.visible");

      return null;
    });
  });
});

describe("Chat Access After Setting Username on Profile Page", () => {
  it("should access chat without modal after setting username on profile page", () => {
    // Sign up a fresh user via the UI form (this also logs them in)
    const freshUser = {
      name: faker.person.fullName(),
      email: faker.internet.email({ provider: "e2e-profile.test" }),
      password: "ProfileTest123!",
    };

    cy.signUp(freshUser);

    // Navigate to the profile page
    cy.visit("/profile");

    // Verify we're on the profile page
    cy.contains("h1", "Profile").should("be.visible");

    // Set a username in the profile form (no dots - must match /^[a-zA-Z0-9_-]+$/)
    const username = `user_${faker.string.alphanumeric(8)}`;
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
