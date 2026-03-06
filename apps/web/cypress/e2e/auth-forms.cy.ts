import { faker } from "@faker-js/faker";

describe("Sign In Form Validation", () => {
  beforeEach(() => {
    cy.visit("/signin");
  });

  it("should have submit button disabled when form is empty", () => {
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("should have a remember me checkbox", () => {
    cy.get("#remember").should("exist");
    cy.get("#remember").should("not.be.checked");
    cy.get("#remember").check();
    cy.get("#remember").should("be.checked");
  });

  it("should display auth navigation links", () => {
    // Should have a link to sign up
    cy.get('a[href="/signup"]').contains("Sign Up").should("be.visible");

    // Should have a link to reset password
    cy.get('a[href="/reset-password"]')
      .contains("Reset Password")
      .should("be.visible");

    // Should NOT show sign in link (already on sign in page)
    cy.get("a").filter('[href="/signin"]').should("have.length", 0);
  });

  it("should enable submit button after entering credentials", () => {
    cy.get("#email").type("test@example.com");
    cy.get("#password").type("SomePassword123!");
    cy.get('button[type="submit"]').should("not.be.disabled");
  });

  it("should display the correct heading", () => {
    cy.contains("Sign In to Your Account").should("be.visible");
  });
});

describe("Sign Up Form Validation", () => {
  beforeEach(() => {
    cy.visit("/signup");
  });

  it("should have submit button disabled when form is empty", () => {
    cy.get('button[type="submit"]').should("be.disabled");
  });

  it("should display all required form fields", () => {
    cy.get("#name").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("#confirmPassword").should("be.visible");
  });

  it("should display the correct heading", () => {
    cy.contains("Account Signup").should("be.visible");
  });

  it("should display auth navigation links", () => {
    // Should have a link to sign in
    cy.get('a[href="/signin"]').contains("Sign in").should("be.visible");

    // Should have a link to reset password
    cy.get('a[href="/reset-password"]')
      .contains("Reset Password")
      .should("be.visible");

    // Should NOT show sign up link (already on sign up page)
    cy.get("a").filter('[href="/signup"]').should("have.length", 0);
  });

  it("should enable submit button after filling all fields", () => {
    cy.get("#name").type("Test User");
    cy.get("#email").type("test@example.com");
    cy.get("#password").type("StrongPass123!");
    cy.get("#confirmPassword").type("StrongPass123!");
    cy.get('button[type="submit"]').should("not.be.disabled");
  });

  it("should navigate to sign in page via auth link", () => {
    cy.get('a[href="/signin"]').click();
    cy.url().should("include", "/signin");
    cy.contains("Sign In to Your Account").should("be.visible");
  });

  it("should reject sign up with duplicate email", () => {
    const testUser = {
      name: faker.person.fullName(),
      email: faker.internet.email({ provider: "e2e-dup.test" }).toLowerCase(),
      password: "DupTest123!",
    };

    // Sign up the user first via API
    cy.signUpViaApi(testUser);

    // Try signing up again with the same email via the form
    cy.get("#name").type(testUser.name);
    cy.get("#email").type(testUser.email);
    cy.get("#password").type(testUser.password);
    cy.get("#confirmPassword").type(testUser.password);
    cy.get('button[type="submit"]').click();

    // Should stay on the signup page (not redirected to dashboard)
    cy.url().should("include", "/signup");
  });
});
