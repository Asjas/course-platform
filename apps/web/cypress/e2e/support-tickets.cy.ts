import { faker } from "@faker-js/faker";

function buildSafeUser(provider: string, password: string) {
  const suffix = faker.string.alphanumeric(8).toLowerCase();

  return {
    name: `E2E User ${suffix}`,
    email: faker.internet.email({ provider }).toLowerCase(),
    password,
  };
}

function resetBrowserSession() {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
    return null;
  });
}

function signInAsFreshRegularUser() {
  resetBrowserSession();
  cy.loginAsRegularUser();
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
    const ownerUser = buildSafeUser("e2e-owner-ticket.test", "OwnerTicket123!");
    const otherUser = buildSafeUser("e2e-other-ticket.test", "OtherTicket123!");

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
      cy.visit(`/support/${ownerTicketId}`);

      // Use content-based waiting instead of cy.intercept/cy.wait because
      // httpBatchStreamLink may batch the supportTickets query with other
      // procedures, producing a URL that doesn't match a simple glob.
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
      name: `Owner Controls ${faker.string.alphanumeric(6)}`,
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

    cy.confirmDeleteDialog();

    cy.get('[role="dialog"]').should("not.exist");

    cy.contains(/ticket deleted successfully/i, { timeout: 10000 }).should(
      "be.visible",
    );
  });

  it("should show admin controls and allow admin to delete any ticket", () => {
    const regularUser = {
      name: `Regular Ticket ${faker.string.alphanumeric(6)}`,
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

    // Clear session and elevate this existing user to admin for the access-control check
    resetBrowserSession();
    cy.task("setUserRole", { email: regularUser.email, role: "admin" });
    cy.signIn({ email: regularUser.email, password: regularUser.password });

    // Navigate to support tickets list
    cy.visit("/support");

    // Admin should see Edit and Delete controls for any ticket
    cy.contains("tr", ticketTitle, { timeout: 15000 }).within(() => {
      cy.contains("a", "Edit").should("be.visible");
      cy.contains("button", "Delete").should("be.visible").click();
    });

    // Confirm deletion
    cy.confirmDeleteDialog();

    cy.get('[role="dialog"]').should("not.exist");

    // Verify successful deletion
    cy.contains(/ticket deleted successfully/i, { timeout: 10000 }).should(
      "be.visible",
    );
    cy.contains("tr", ticketTitle).should("not.exist");
  });
});
