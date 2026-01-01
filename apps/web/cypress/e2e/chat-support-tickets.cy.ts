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
