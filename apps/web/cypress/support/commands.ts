/// <reference types="cypress" />

/* eslint-disable @typescript-eslint/no-namespace, promise/always-return */
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in as admin
       * @example cy.loginAsAdmin()
       */
      loginAsAdmin(): Chainable<void>;
      /**
       * Custom command to log in as regular user
       * @example cy.loginAsRegularUser()
       */
      loginAsRegularUser(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("loginAsAdmin", () => {
  cy.fixture("users").then((users) => {
    cy.visit("/signin");
    cy.get('input[name="email"]').clear();
    cy.get('input[name="email"]').type(users.admin.email);
    cy.get('input[name="password"]').clear();
    cy.get('input[name="password"]').type(users.admin.password);
    cy.get('button[type="submit"]').click();
    // Wait for redirect to dashboard
    cy.url().should("include", "/dashboard");
  });
});

Cypress.Commands.add("loginAsRegularUser", () => {
  cy.fixture("users").then((users) => {
    cy.visit("/signin");
    cy.get('input[name="email"]').clear();
    cy.get('input[name="email"]').type(users.regular.email);
    cy.get('input[name="password"]').clear();
    cy.get('input[name="password"]').type(users.regular.password);
    cy.get('button[type="submit"]').click();
    // Wait for redirect to dashboard
    cy.url().should("include", "/dashboard");
  });
});

export {};
