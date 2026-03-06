describe("Reset Password Page", () => {
  beforeEach(() => {
    cy.visit("/reset-password");
  });

  it("should display the reset password form", () => {
    cy.contains("Reset Password").should("be.visible");

    // Should show the email input for requesting a reset
    cy.get("#email").should("be.visible");
    cy.contains("button", "Send reset link").should("be.visible");
  });

  it("should display auth navigation links", () => {
    // Should have a link to sign in
    cy.get('a[href="/signin"]').contains("Sign in").should("be.visible");

    // Should have a link to sign up
    cy.get('a[href="/signup"]').contains("Sign Up").should("be.visible");

    // Should NOT show a Forgot Password link (already on reset page)
    cy.get('a[href="/reset-password"]').should("not.exist");
  });

  it("should have submit button disabled when form is empty", () => {
    cy.contains("button", "Send reset link").should("be.disabled");
  });

  it("should enable submit button after entering an email", () => {
    cy.get("#email").type("user@example.com");
    cy.contains("button", "Send reset link").should("not.be.disabled");
  });
});
