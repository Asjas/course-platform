describe("Chat Support Ticket Management", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should display chat support section and navigate to create ticket", () => {
    // Navigate to chat
    cy.visit("/chat/general");

    // Verify Support section is visible in the sidebar
    cy.contains("Support").should("be.visible");

    // Navigate directly to the create ticket page
    cy.visit("/chat/support/new");

    // Verify the create ticket form is visible
    cy.contains("Create Support Ticket").should("be.visible");
    cy.get('input[name="title"]').should("be.visible");
    cy.get('input[name="repo"]').should("be.visible");
  });

  it("should navigate to ticket details after creating a ticket", () => {
    // Navigate directly to the create page
    cy.visit("/chat/support/new");

    // Fill out the form
    cy.get('input[name="title"]').type("Test Support Ticket");
    cy.get('input[name="repo"]').type("https://github.com/test/repo");

    // Fill in the description - the markdown editor creates a textarea
    cy.get("textarea").type("This is a test support ticket description");

    // Submit the form
    cy.contains("button", "Save").click();

    // Should navigate to the ticket details page after creation
    cy.url().should("include", "/support/suptick:");

    // Verify we're on the support ticket details page
    cy.contains("Test Support Ticket").should("be.visible");
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
