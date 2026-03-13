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
       * Custom command to ensure a user account exists. Attempts sign-up first
       * and falls back to sign-in if the account already exists. Returns to the
       * calling page when done so it can be used as a pure setup helper without
       * displacing the caller from their current URL.
       * @example cy.ensureUserExists({ name: 'Test', email: 'test@example.com', password: 'Pass123!' })
       */
      ensureUserExists(user: {
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
      /**
       * Insert or update an early signup row for admin early-signups E2E setup.
       * @example cy.createEarlySignup({ id: 'signup:1', email: 'a@b.com', name: 'A' })
       */
      createEarlySignup(input: {
        id: string;
        email: string;
        name: string;
        source?: "learnfastify" | "codewizard" | "other";
        confirmedAt?: string | null;
        unsubscribedAt?: string | null;
      }): Chainable<void>;
    }
  }
}

// Generate unique user data per test run using faker to avoid conflicts in concurrent CI
// Emails MUST be lowercased because Better Auth normalizes emails to lowercase,
// but the setUserRole SQL query uses case-sensitive matching.
const adminUser = {
  name: faker.person.fullName(),
  email: faker.internet.email({ provider: "e2e-admin.test" }).toLowerCase(),
  password: "AdminTest123!",
};
const regularUser = {
  name: faker.person.fullName(),
  email: faker.internet.email({ provider: "e2e-user.test" }).toLowerCase(),
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
    cy.url({ timeout: 10000 }).should("include", "/dashboard");
  },
);

Cypress.Commands.add(
  "ensureUserExists",
  (user: { name: string; email: string; password: string }) => {
    // Save the current URL so we can return to it after setup, allowing this
    // command to be used as a pure "ensure user exists" helper without
    // displacing the caller from their current page.
    cy.url().then((originalUrl) => {
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

      // Account may already exist from earlier specs; fall back to sign-in.
      cy.location("pathname", { timeout: 10000 }).then((pathname) => {
        const cleanupAndRestore = () => {
          // Clear cookies so the caller is not left with an active session.
          // ensureUserExists is a setup helper — it should only guarantee the
          // account exists, not leave the browser authenticated. Without this,
          // subsequent visits to auth pages (e.g. /signup, /signin) would be
          // redirected to /dashboard by the auth route guard.
          cy.clearAllCookies();

          // Only restore if the caller was on a real page (not about:blank).
          if (originalUrl && !originalUrl.startsWith("about:")) {
            cy.visit(originalUrl);
          }
        };

        if (pathname.includes("/dashboard")) {
          cleanupAndRestore();
          return null;
        }

        cy.clearAllCookies();
        cy.clearAllLocalStorage();
        cy.visit("/signin");
        cy.get('input[name="email"], #email', { timeout: 10000 })
          .first()
          .clear();
        cy.get('input[name="email"], #email').first().type(user.email);
        cy.get('input[name="password"], #password').first().clear();
        cy.get('input[name="password"], #password').first().type(user.password);
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should("include", "/dashboard");
        cleanupAndRestore();
        return null;
      });
      return null;
    });
  },
);

Cypress.Commands.add("signIn", (user: { email: string; password: string }) => {
  cy.visit("/signin");
  cy.get('input[name="email"], #email', { timeout: 10000 }).first().clear();
  cy.get('input[name="email"], #email').first().type(user.email);
  cy.get('input[name="password"], #password').first().clear();
  cy.get('input[name="password"], #password').first().type(user.password);
  cy.get('button[type="submit"]').click();
  cy.url({ timeout: 10000 }).should("include", "/dashboard");
});

Cypress.Commands.add("loginAsAdmin", () => {
  cy.session(
    "admin",
    () => {
      cy.ensureUserExists(adminUser);
      cy.task("setUserRole", { email: adminUser.email, role: "admin" });
      cy.clearAllCookies();
      cy.signIn({ email: adminUser.email, password: adminUser.password });
    },
    {
      validate() {
        cy.getCookies().should("have.length.greaterThan", 0);
      },
    },
  );
});

Cypress.Commands.add("loginAsRegularUser", () => {
  cy.session(
    "regularUser",
    () => {
      cy.ensureUserExists(regularUser);
      cy.clearAllCookies();
      cy.signIn({ email: regularUser.email, password: regularUser.password });
    },
    {
      validate() {
        cy.getCookies().should("have.length.greaterThan", 0);
      },
    },
  );
});

Cypress.Commands.add(
  "createEarlySignup",
  (input: {
    id: string;
    email: string;
    name: string;
    source?: "learnfastify" | "codewizard" | "other";
    confirmedAt?: string | null;
    unsubscribedAt?: string | null;
  }) => {
    cy.task("createEarlySignup", input);
  },
);

export {};
