describe("Chat Support Ticket Management", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should navigate to embedded support ticket creation from chat", () => {
    // Navigate to chat
    cy.visit("/chat/general");

    // Navigate to a course support page (assuming a course exists)
    // Note: This test assumes at least one course is available in the system
    cy.contains("Support").should("be.visible");

    // Click on the first course in the support section
    cy.contains("Support")
      .parent()
      .parent()
      .within(() => {
        cy.get("a").first().click();
      });

    // Should be on a course-specific support page
    cy.url().should("include", "/chat/support/");

    // Click the "Create new ticket" button
    cy.contains("button", "Create new ticket").click();

    // Should navigate to the embedded create route
    cy.url().should("include", "/chat/support/new");

    // Verify the create ticket form is visible
    cy.contains("Create Support Ticket").should("be.visible");
    cy.get('input[name="title"]').should("be.visible");
    cy.get('input[name="repo"]').should("be.visible");
  });

  it("should navigate to chat support index after creating a ticket", () => {
    // Navigate directly to the create page
    cy.visit("/chat/support/new");

    // Fill out the form
    cy.get('input[name="title"]').type("Test Support Ticket");
    cy.get('input[name="repo"]').type("https://github.com/test/repo");

    // Fill in the description using the markdown editor
    // Note: The exact selector may need adjustment based on the editor implementation
    cy.get('[data-testid="github-message-editor"]')
      .or('textarea[name="description"]')
      .type("This is a test support ticket description");

    // Submit the form
    cy.contains("button", "Save").click();

    // Should navigate to the support index page after creation
    cy.url().should("eq", Cypress.config().baseUrl + "/chat/support");

    // Verify we're on the support tickets page
    cy.contains("Support Tickets").should("be.visible");
  });

  it("should display the support tickets list in chat", () => {
    // Navigate to the chat support index
    cy.visit("/chat/support");

    // Verify the page displays correctly
    cy.contains("Support Tickets").should("be.visible");
    cy.contains("View and manage all support tickets").should("be.visible");

    // Verify the "Create new ticket" button is visible
    cy.contains("Create new ticket").should("be.visible");
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
