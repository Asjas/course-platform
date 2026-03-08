import { faker } from "@faker-js/faker";

describe("The Home Page", () => {
  it("successfully loads and contains critical information", () => {
    cy.visit("/");

    // Should have navigation links to Home, Blog and Sign In pages
    cy.get("a").contains("Home").should("have.attr", "href", "/");
    cy.get("a").contains("Sign In").should("have.attr", "href", "/signin");

    // Should contain a h1 heading
    cy.get("h1").contains("Master Lasting Web Dev Skills");

    // Should have a contact email link
    cy.get("a")
      .contains("contact@codewizard.training")
      .should("have.attr", "href", "mailto:contact@codewizard.training");
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

describe("The Sign Up Page", () => {
  it("successfully loads and contains the signup form", () => {
    cy.visit("/signup");

    // Verify the signup form is visible
    cy.get("form").should("be.visible");
    cy.get("#name").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("#confirmPassword").should("be.visible");
    cy.get('button[type="submit"]').should("be.visible");
  });
});

describe("User Authentication Flow", () => {
  const testUser = {
    name: faker.person.fullName(),
    email: faker.internet.email({ provider: "e2e-auth.test" }).toLowerCase(),
    password: "E2eTestPass123!",
  };

  it("should sign up a new user and redirect to dashboard", () => {
    cy.signUp(testUser);

    // Should be on the dashboard after signup
    cy.url().should("include", "/dashboard");
  });

  it("should sign in with the newly created user", () => {
    // Ensure the user exists (may already exist from previous test)
    cy.ensureUserExists(testUser);

    // Now sign in with the same credentials
    cy.signIn({ email: testUser.email, password: testUser.password });

    // Should be on the dashboard after signin
    cy.url().should("include", "/dashboard");
  });
});

describe("The Sign In Page", () => {
  it("successfully loads and contains the signin form", () => {
    cy.visit("/signin");

    // Verify that the Sign In page contains a heading
    cy.get("h2").contains("Sign In to Your Account");

    // Check for presence of form fields and buttons
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("#remember").should("exist");
    cy.get('button[type="submit"]').should("be.visible");

    // Check for presence of links to Sign Up and Reset Password pages
    cy.get('a[href="/signup"]').contains("Sign Up");
    cy.get('a[href="/reset-password"]').contains("Reset Password");
  });
});
