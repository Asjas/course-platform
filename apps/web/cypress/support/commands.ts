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

/* eslint-disable cypress/unsafe-to-chain-command, cypress/no-unnecessary-waiting, promise/no-nesting */
Cypress.Commands.add("loginAsAdmin", () => {
  cy.fixture("users").then((users) => {
    // DEBUG: Log the credentials being used
    cy.log("DEBUG: Attempting admin login");
    cy.log(`DEBUG: Email: ${users.admin.email}`);
    cy.log(`DEBUG: Password length: ${users.admin.password.length}`);

    cy.visit("/signin");

    // DEBUG: Check if sign-in page loaded
    cy.url()
      .should("include", "/signin")
      .then((url) => {
        cy.log(`DEBUG: Sign-in page URL: ${url}`);
      });

    cy.get("#email").clear();
    cy.get("#email").type(users.admin.email);
    cy.get("#password").clear();
    cy.get("#password").type(users.admin.password);

    // DEBUG: Check form values before submit
    cy.get("#email")
      .should("have.value", users.admin.email)
      .then(() => {
        cy.log("DEBUG: Email field populated correctly");
      });

    cy.get('button[type="submit"]')
      .click()
      .then(() => {
        cy.log("DEBUG: Submit button clicked");
      });

    // DEBUG: Wait and check for any error messages
    cy.wait(1000);
    cy.get("body").then(($body) => {
      if ($body.text().includes("Invalid") || $body.text().includes("Error")) {
        cy.log("DEBUG: ERROR MESSAGE DETECTED ON PAGE");
        cy.log($body.text());
      }
    });

    // DEBUG: Check cookies after login attempt
    cy.getAllCookies().then((cookies) => {
      cy.log(`DEBUG: Cookies after login: ${cookies.length} cookies`);
      cookies.forEach((cookie) => {
        cy.log(`DEBUG: Cookie: ${cookie.name}`);
      });
    });

    // DEBUG: Check local storage
    cy.window().then((win) => {
      const storage = JSON.stringify(win.localStorage);
      cy.log(`DEBUG: LocalStorage: ${storage}`);
    });

    // Wait for successful login - Dashboard link should appear in navigation
    cy.contains("Dashboard", { timeout: 10000 })
      .should("be.visible")
      .then(() => {
        cy.log("DEBUG: Login successful - Dashboard link visible");
      });
  });
});

Cypress.Commands.add("loginAsRegularUser", () => {
  cy.fixture("users").then((users) => {
    // DEBUG: Log the credentials being used
    cy.log("DEBUG: Attempting regular user login");
    cy.log(`DEBUG: Email: ${users.regular.email}`);
    cy.log(`DEBUG: Password length: ${users.regular.password.length}`);

    cy.visit("/signin");

    // DEBUG: Check if sign-in page loaded
    cy.url()
      .should("include", "/signin")
      .then((url) => {
        cy.log(`DEBUG: Sign-in page URL: ${url}`);
      });

    cy.get("#email").clear();
    cy.get("#email").type(users.regular.email);
    cy.get("#password").clear();
    cy.get("#password").type(users.regular.password);

    // DEBUG: Check form values before submit
    cy.get("#email")
      .should("have.value", users.regular.email)
      .then(() => {
        cy.log("DEBUG: Email field populated correctly");
      });

    cy.get('button[type="submit"]')
      .click()
      .then(() => {
        cy.log("DEBUG: Submit button clicked");
      });

    // DEBUG: Wait and check for any error messages
    cy.wait(1000);
    cy.get("body").then(($body) => {
      if ($body.text().includes("Invalid") || $body.text().includes("Error")) {
        cy.log("DEBUG: ERROR MESSAGE DETECTED ON PAGE");
        cy.log($body.text());
      }
    });

    // DEBUG: Check cookies after login attempt
    cy.getAllCookies().then((cookies) => {
      cy.log(`DEBUG: Cookies after login: ${cookies.length} cookies`);
      cookies.forEach((cookie) => {
        cy.log(`DEBUG: Cookie: ${cookie.name}`);
      });
    });

    // DEBUG: Check local storage
    cy.window().then((win) => {
      const storage = JSON.stringify(win.localStorage);
      cy.log(`DEBUG: LocalStorage: ${storage}`);
    });

    // Wait for successful login - Dashboard link should appear in navigation
    cy.contains("Dashboard", { timeout: 10000 })
      .should("be.visible")
      .then(() => {
        cy.log("DEBUG: Login successful - Dashboard link visible");
      });
  });
});
/* eslint-enable cypress/unsafe-to-chain-command, cypress/no-unnecessary-waiting, promise/no-nesting */

export {};
