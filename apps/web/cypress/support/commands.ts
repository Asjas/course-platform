/// <reference types="cypress" />
import { faker } from "@faker-js/faker";

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
    cy.url({ timeout: 15000 }).should("include", "/dashboard");
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

/**
 * Wait for async content to render before inspecting the DOM.
 * Retries until either `selector` matches at least one element OR the page
 * body contains `emptyText` (the empty-state message). Use this before a
 * `cy.get("body").then()` block that branches on whether content has loaded.
 *
 * @example
 * cy.waitForContent('a[href*="/courses/"]', "No courses available yet");
 * cy.waitForContent('a[href*="/chat/dm"]', "No direct messages yet");
 */
Cypress.Commands.add(
  "waitForContent",
  (selector: string, emptyText: string) => {
    cy.get("body").should(($body) => {
      expect(
        $body.find(selector).length > 0 || $body.text().includes(emptyText),
        `"${selector}" elements or "${emptyText}" to appear`,
      ).to.equal(true);
    });
  },
);

export {};
