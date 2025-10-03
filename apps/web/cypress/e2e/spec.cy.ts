describe("The Home Page", () => {
  it("successfully loads and contains critical information", () => {
    cy.visit("/");

    // Should have navigation links to Home, Blog and Sign In pages
    cy.get("a").contains("Home").should("have.attr", "href", "/");
    cy.get("a").contains("Blog").should("have.attr", "href", "/blog");
    cy.get("a").contains("Sign In").should("have.attr", "href", "/signin");

    // Should contain a h1 heading
    cy.get("h1").contains("Master Lasting Web Dev Skills");

    // Should have a contact email link
    cy.get("a")
      .contains("contact@codewizard.training")
      .should("have.attr", "href", "mailto:contact@codewizard.training");
  });

  it('navigates to Sign In page when "Sign In" button is clicked', () => {
    cy.visit("/");

    // Click the "Sign In" button
    cy.get('a[href="/signin"]').click();

    // Verify that the URL is correct
    cy.url().should("include", "/signin");

    // Verify that the Sign In page contains a heading
    cy.get("h2").contains("Sign In to Your Account");

    // Check for presence of form fields and buttons
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
    cy.get('input[type="checkbox"][id="remember"]').should("exist");
    cy.get('button[type="submit"]').should("exist");

    // Check for presence of links to Sign Up and Reset Password pages
    cy.get('a[href="/signup"]').contains("Sign Up");
    cy.get('a[href="/reset-password"]').contains("Reset Password");
  });
});

describe("Terms of Service Page", () => {
  it("successfully loads and contains critical information", () => {
    cy.visit("/terms");

    // Should contain a h1 heading
    cy.get("h1").contains("Terms of Service");

    // should contain a link to privacy policy
    cy.get("a")
      .contains("Privacy Policy")
      .should("have.attr", "href", "/privacy");

    // should contain an email link to request refunds
    cy.get("a")
      .contains("refunds@codewizard.training")
      .should("have.attr", "href", "mailto:refunds@codewizard.training");

    // should contain an email link for general contact
    cy.get("a")
      .contains("contact@codewizard.training")
      .should("have.attr", "href", "mailto:contact@codewizard.training");
  });
});

describe("Privacy Policy Page", () => {
  it("successfully loads and contains critical information", () => {
    cy.visit("/privacy");

    // Should contain a h1 heading
    cy.get("h1").contains("Privacy Policy");

    // should contain a link to terms of service
    cy.get("a")
      .contains("Terms of Service Policy")
      .should("have.attr", "href", "/terms");

    // should contain an email link for privacy contact
    cy.get("a")
      .contains("privacy@codewizard.training")
      .should("have.attr", "href", "mailto:privacy@codewizard.training");
  });
});
