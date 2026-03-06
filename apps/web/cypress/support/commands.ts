/// <reference types="cypress" />
import { faker } from "@faker-js/faker";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to sign up a new user via the signup form
       * @example cy.signUp({ name: 'Test', email: 'test@example.com', password: 'Pass123!' })
       */
      signUp(user: {
        name: string;
        email: string;
        password: string;
      }): Chainable<void>;
      /**
       * Custom command to sign up via API (faster, no UI interaction)
       * @example cy.signUpViaApi({ name: 'Test', email: 'test@example.com', password: 'Pass123!' })
       */
      signUpViaApi(user: {
        name: string;
        email: string;
        password: string;
      }): Chainable<void>;
      /**
       * Custom command to sign in via the signin form
       * @example cy.signIn({ email: 'test@example.com', password: 'Pass123!' })
       */
      signIn(user: { email: string; password: string }): Chainable<void>;
      /**
       * Custom command to sign up and sign in as an admin user
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<void>;
      /**
       * Custom command to sign up and sign in as a regular user
       * @example cy.loginAsRegularUser()
       */
      loginAsRegularUser(): Chainable<void>;
    }
  }
}

// Generate unique user data per test run using faker to avoid conflicts in concurrent CI
const adminUser = {
  name: faker.person.fullName(),
  email: faker.internet.email({ provider: "e2e-admin.test" }),
  password: "AdminTest123!",
};
const regularUser = {
  name: faker.person.fullName(),
  email: faker.internet.email({ provider: "e2e-user.test" }),
  password: "UserTest123!",
};

Cypress.Commands.add(
  "signUp",
  (user: { name: string; email: string; password: string }) => {
    cy.visit("/signup");
    cy.get("#name").clear();
    cy.get("#name").type(user.name);
    cy.get("#email").clear();
    cy.get("#email").type(user.email);
    cy.get("#password").clear();
    cy.get("#password").type(user.password);
    cy.get("#confirmPassword").clear();
    cy.get("#confirmPassword").type(user.password);
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard");
  },
);

Cypress.Commands.add(
  "signUpViaApi",
  (user: { name: string; email: string; password: string }) => {
    cy.request({
      method: "POST",
      url: "http://localhost:3000/api/auth/sign-up/email",
      body: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
      failOnStatusCode: false,
    })
      .its("status")
      .should("be.oneOf", [200, 422]);
  },
);

Cypress.Commands.add("signIn", (user: { email: string; password: string }) => {
  cy.visit("/signin");
  cy.get("#email").clear();
  cy.get("#email").type(user.email);
  cy.get("#password").clear();
  cy.get("#password").type(user.password);
  cy.get('button[type="submit"]').click();
  cy.url().should("include", "/dashboard");
});

Cypress.Commands.add("loginAsAdmin", () => {
  cy.signUpViaApi(adminUser);
  cy.task("setUserRole", { email: adminUser.email, role: "admin" });
  cy.signIn({ email: adminUser.email, password: adminUser.password });
});

Cypress.Commands.add("loginAsRegularUser", () => {
  cy.signUpViaApi(regularUser);
  cy.signIn({ email: regularUser.email, password: regularUser.password });
});

export {};
