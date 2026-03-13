/// <reference types="cypress" />

export {};

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
      /**
       * Wait for async content to render before inspecting the DOM.
       * Retries (via `.should`) until either `selector` matches an element OR
       * the body text includes `emptyText`.
       * @example cy.waitForContent('a[href*="/courses/"]', "No courses available yet")
       */
      waitForContent(selector: string, emptyText: string): Chainable<void>;
    }
  }
}
