import { faker } from "@faker-js/faker";

const supportAdminUser = {
  name: faker.person.fullName(),
  email: faker.internet
    .email({ provider: "e2e-support-admin.test" })
    .toLowerCase(),
  password: "SupportAdmin123!",
};

function resetBrowserSession() {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
    return null;
  });
}

function signInAsFreshRegularUser() {
  const regularUser = {
    name: faker.person.fullName(),
    email: faker.internet
      .email({ provider: "e2e-support-regular.test" })
      .toLowerCase(),
    password: "RegularUser123!",
  };

  resetBrowserSession();
  cy.signUp(regularUser);
}

function createSupportTicket({
  title,
  description,
  repo = "https://github.com/test/repo",
}: {
  title: string;
  description: string;
  repo?: string;
}) {
  cy.intercept("POST", "**/trpc/supportTickets.createSupportTicket*").as(
    "createSupportTicket",
  );

  cy.visit("/support/create-ticket");
  cy.get('input[name="title"]').should("be.visible").type(title);
  cy.get('input[name="repo"]').should("be.visible").type(repo);
  cy.get("textarea#description").should("be.visible").type(description);
  cy.contains("button", "Save").should("not.be.disabled").click({
    force: true,
  });

  cy.wait("@createSupportTicket", { timeout: 20000 })
    .its("response.statusCode")
    .should("be.oneOf", [200, 201]);

  cy.url({ timeout: 20000 }).should(
    "match",
    /\/support\/(?!create-ticket$)[^/?#]+/,
  );
}

describe("Support Ticket Management", () => {
  before(() => {
    // The server assigns new tickets to SUPPORT_ASSIGNED_TO_USER_ID.
    // Ensure the assignee user exists so ticket creation does not fail FK checks.
    cy.task("createTestUser", {
      id: "dsaf",
      name: "Support Assignee",
      email: "support-assignee@e2e.test",
      role: "admin",
    });

    cy.ensureUserExists(supportAdminUser);
    cy.task("setUserRole", { email: supportAdminUser.email, role: "admin" });
    cy.clearAllCookies();
  });

  beforeEach(() => {
    signInAsFreshRegularUser();
    cy.visit("/dashboard");
    cy.url().should("include", "/dashboard");
  });

  it("should display support section and navigate to create ticket", () => {
    // Navigate to the create ticket page
    cy.visit("/support/create-ticket");

    // Verify the create ticket form is visible
    cy.contains("Create Support Ticket").should("be.visible");
    cy.get('input[name="title"]').should("be.visible");
    cy.get('input[name="repo"]').should("be.visible");
  });

  it("should fill and submit the create ticket form", () => {
    createSupportTicket({
      title: "Test Support Ticket",
      description: "This is a test support ticket description",
    });
  });

  it("should allow navigation back to support list from create page", () => {
    // Navigate to the create page
    cy.visit("/support/create-ticket");

    // Click the "Back to all tickets" button
    cy.contains("Back to all tickets").click();

    // Should navigate back to support tickets list
    cy.url().should("include", "/support");
  });

  it("should allow a different user to view someone else's support ticket", () => {
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
    const ticketDescription = "Owner-only support ticket content";
    let ownerTicketId = "";

    resetBrowserSession();
    cy.signUp(ownerUser);

    createSupportTicket({
      title: ticketTitle,
      description: ticketDescription,
    });
    cy.url().then((url) => {
      const pathname = new URL(url).pathname;
      ownerTicketId = pathname.split("/").filter(Boolean).pop() ?? "";
      expect(ownerTicketId).to.not.equal("create-ticket");
      expect(ownerTicketId).to.not.equal("");
      return null;
    });

    resetBrowserSession();

    cy.signUp(otherUser);

    cy.then(() => {
      // Intercept the tRPC query that loads all support tickets so we can wait
      // for it to complete before asserting on content. The route loader calls
      // SupportTicketsCollection.preload() which triggers this request.
      cy.intercept("GET", "**/trpc/supportTickets*").as("loadTickets");
      cy.visit(`/support/${ownerTicketId}`);
      cy.wait("@loadTickets", { timeout: 15000 });

      // Wait for any loading state to clear before asserting on ticket content.
      // The collection query might still be resolving even after the API call completes.
      cy.get("body").then(($body) => {
        if ($body.find('[data-testid="loading"]').length > 0) {
          cy.get('[data-testid="loading"]', { timeout: 15000 }).should(
            "not.exist",
          );
        }
        return null;
      });

      cy.contains(ticketTitle, { timeout: 15000 }).should("be.visible");
      cy.contains(ticketDescription).should("be.visible");

      // Non-owners can view public tickets, but owner controls are not shown here.
      cy.contains("button", "Delete").should("not.exist");
      cy.contains("a", "Edit").should("not.exist");

      return null;
    });
  });

  it("should show owner controls and allow creator to delete their own ticket", () => {
    const ownTicketTitle = `Own Ticket ${faker.string.alphanumeric(8)}`;

    // Use a fresh user to avoid stale session issues from shared beforeEach
    resetBrowserSession();
    const ownerUser = {
      name: faker.person.fullName(),
      email: faker.internet
        .email({ provider: "e2e-owner-controls.test" })
        .toLowerCase(),
      password: "OwnerControls123!",
    };

    cy.signUp(ownerUser);

    createSupportTicket({
      title: ownTicketTitle,
      description: "Ticket created by current user",
    });

    cy.visit("/support");
    cy.contains("tr", ownTicketTitle, { timeout: 15000 }).within(() => {
      cy.contains("a", "Edit").should("be.visible");
      cy.contains("button", "Delete").should("be.visible").click();
    });

    cy.get('[role="dialog"]').within(() => {
      cy.contains("button", "Delete").click();
    });

    cy.contains(/ticket deleted successfully/i).should("be.visible");
    cy.contains("tr", ownTicketTitle).should("not.exist");
  });

  it("should show admin controls and allow admin to delete any ticket", () => {
    const regularUser = {
      name: faker.person.fullName(),
      email: faker.internet
        .email({ provider: "e2e-regular-ticket.test" })
        .toLowerCase(),
      password: "RegularTicket123!",
    };

    const ticketTitle = `Regular User Ticket ${faker.string.alphanumeric(8)}`;
    const ticketDescription = "Regular user support ticket content";
    let ticketId = "";

    // Create a ticket as a regular user
    resetBrowserSession();

    cy.signUp(regularUser);

    createSupportTicket({
      title: ticketTitle,
      description: ticketDescription,
    });
    cy.url().then((url) => {
      const pathname = new URL(url).pathname;
      ticketId = pathname.split("/").filter(Boolean).pop() ?? "";
      expect(ticketId).to.not.equal("create-ticket");
      expect(ticketId).to.not.equal("");
      return null;
    });

    // Clear session and login as admin
    resetBrowserSession();
    cy.signIn({
      email: supportAdminUser.email,
      password: supportAdminUser.password,
    });

    // Navigate to support tickets list
    cy.visit("/support");

    // Admin should see Edit and Delete controls for any ticket
    cy.contains("tr", ticketTitle, { timeout: 15000 }).within(() => {
      cy.contains("a", "Edit").should("be.visible");
      cy.contains("button", "Delete").should("be.visible").click();
    });

    // Confirm deletion
    cy.get('[role="dialog"]').within(() => {
      cy.contains("button", "Delete").click();
    });

    // Verify successful deletion
    cy.contains(/ticket deleted successfully/i).should("be.visible");
    cy.contains("tr", ticketTitle).should("not.exist");
  });
});
