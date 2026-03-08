---
applyTo: "apps/web/cypress/**"
description: "Cypress E2E test generation instructions for the web application"
---

# Cypress E2E Testing Guidelines

## Test Writing Guidelines

### Code Quality Standards
- **Selectors**: Prioritize `data-testid` attributes for test stability. Use `cy.contains()` for user-facing text and `cy.get()` for specific elements.
- **Assertions**: Use Cypress's built-in assertions which automatically retry. Chain assertions with `.should()`.
- **Waits**: Rely on Cypress's automatic waiting. Avoid `cy.wait()` with arbitrary timeouts; use `cy.intercept()` for network requests.
- **Clarity**: Use descriptive test titles that clearly state the intent.

### Test Structure
- **Imports**: No imports needed - Cypress commands are globally available.
- **Organization**: Group related tests under `describe()` blocks.
- **Hooks**: Use `beforeEach()` for common setup (e.g., visiting a page, login).
- **Titles**: Follow naming convention: `Feature - Specific action or scenario`.

### File Organization
- **Location**: Store test files in `apps/web/cypress/e2e/`.
- **Naming**: Use `<feature-or-page>.cy.ts` (e.g., `login.cy.ts`, `checkout.cy.ts`).
- **Fixtures**: Store test data in `apps/web/cypress/fixtures/`.
- **Support**: Custom commands in `apps/web/cypress/support/commands.ts`.

### Assertion Best Practices
- **Visibility**: Use `.should("be.visible")` for elements that must be seen.
- **Text Content**: Use `.should("contain", "text")` or `.should("have.text", "exact text")`.
- **Element State**: Use `.should("be.disabled")`, `.should("be.checked")`, etc.
- **URL**: Use `cy.url().should("include", "/path")` for navigation verification.
- **Network (Non-Auth)**: Use `cy.intercept()` for CRUD operations to wait for API calls and verify network timing.
- **Network (Authorization)**: Do NOT use `cy.intercept()` to mock permission responses. Test through the UI and let the real backend enforce permissions.

## Example Test Structure

```typescript
describe("User Authentication", () => {
  beforeEach(() => {
    cy.visit("/signin");
  });

  it("should display the sign in form", () => {
    cy.get("form").should("be.visible");
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.contains("button", "Sign In").should("be.visible");
  });

  it("should show error for invalid credentials", () => {
    cy.get('input[name="email"]').type("invalid@example.com");
    cy.get('input[name="password"]').type("wrongpassword");
    cy.contains("button", "Sign In").click();

    cy.contains("Invalid credentials").should("be.visible");
  });

  it("should redirect to dashboard after successful login", () => {
    // Test through the UI, calling the real backend
    cy.get('input[name="email"]').type("user@example.com");
    cy.get('input[name="password"]').type("validpassword");
    cy.contains("button", "Sign In").click();

    // Wait for real backend to respond and redirect
    cy.url().should("include", "/dashboard");
    cy.contains("Welcome").should("be.visible");
  });
});
```

## Test Execution

### Mandatory Local E2E Workflow

1. Start backend API first: `pnpm --filter @apps/server dev`
2. Start web preview next: `pnpm --filter @apps/web preview`
3. Wait for both services to be ready (`http://localhost:5000` and `http://localhost:4173`)
4. Run only the changed spec file(s)

**Do not run** `pnpm preview` from repository root for web E2E setup. Use the filtered command above.
Use this form for targeted runs:

```bash
pnpm --filter @apps/web e2e:run -- --spec "cypress/e2e/<changed-spec>.cy.ts"
```

After creating or editing an E2E spec, run that spec immediately.
Do not run the full E2E suite for targeted validation unless explicitly requested.

For CRUD scenarios, cleanup must be done using normal UI delete actions so cleanup also validates delete behavior.

### Authorization Testing (CRITICAL: Test Through UI, Not by Mocking)

**NEVER use `cy.intercept()` or `cy.request()` to mock/bypass permission enforcement. Test through the real UI.**

For authorization scenarios, assert both behaviors by testing through the UI:

1. **Route-level access control**:
   - Navigate to protected page as non-admin → Page doesn't load or redirects
   - Verify error message appears (not hardcoded, but from real backend)
   - Navigate to protected page as admin → Page loads normally

2. **When route guards block page load**:
  - Do not add impossible UI mutation tests for that page as non-admin
  - E2E should assert the page is blocked (redirect/forbidden state) and user-facing error is visible
  - Add server-side Vitest tests for protected tRPC endpoints to verify non-admin requests are rejected
  - Keep endpoint permission assertions in `apps/server` tests as part of the overall strategy

3. **Ownership boundaries**:
   - User A navigates to their own content → Loads successfully
   - User B tries to access User A's content → Access denied (real backend enforces)
   - Verify error message appears to user B
   - Exception: Support tickets are completely public (no authentication required); E2E should verify anyone can view ticket details but only owners and admins see edit/delete controls

4. **Role boundaries**:
   - Admin navigates to `/admin/*` → Page loads, admin actions work
   - Non-admin navigates to `/admin/*` → Page fails to load or shows error
   - Verify appropriate user-facing messages

**Key Principle**: "As a user, you expect the page to not load or show an error message. NOT for the app to make direct HTTP requests to test permissions."

If an admin page is inaccessible to non-admin users by design, the Cypress test should stop at route-level denial and not attempt form submission from that state.

### Known Failure Modes (Do Not Repeat)

- 2026-03-07: Running `pnpm preview` from repository root failed with
  `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "preview" not found`.
  Always run `pnpm --filter @apps/web preview`.
- 2026-03-07: Running Cypress before backend startup caused `cy.request`
  failures for `http://localhost:5000/api/auth/sign-up/email`.
  Always start backend first and verify readiness before test runs.

### Commands
```bash
# Open Cypress interactive mode
pnpm run --filter @apps/web e2e

# Run tests headless
pnpm run --filter @apps/web e2e:run

# Run specific test file
pnpm run --filter @apps/web e2e:run -- --spec "cypress/e2e/login.cy.ts"
```

### CI/CD
- Tests run on Node.js 22-24 in GitHub Actions.
- Build the app first: `pnpm build --filter @apps/web`.
- Start preview server: `pnpm --filter @apps/web preview`.
- Cypress runs against `http://localhost:4173`.

## Custom Commands

Define reusable commands in `cypress/support/commands.ts`:

```typescript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/signin");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.contains("button", "Sign In").click();
});
```

## Quality Checklist

Before finalizing tests:
- [ ] Selectors are stable (prefer `data-testid` over CSS classes)
- [ ] Tests are independent and don't rely on order
- [ ] Network requests are intercepted where appropriate
- [ ] Tests have meaningful assertions
- [ ] No arbitrary `cy.wait()` calls with milliseconds
- [ ] Tests follow consistent naming conventions
