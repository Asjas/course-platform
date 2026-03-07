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
- **Network**: Use `cy.intercept()` to stub or wait for API calls.

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
    // Intercept the auth API
    cy.intercept("POST", "/api/auth/sign-in", {
      statusCode: 200,
      body: { success: true },
    }).as("signIn");

    cy.get('input[name="email"]').type("user@example.com");
    cy.get('input[name="password"]').type("validpassword");
    cy.contains("button", "Sign In").click();

    cy.wait("@signIn");
    cy.url().should("include", "/dashboard");
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

For authorization scenarios, assert both behaviors:
1. Route/data access is blocked (redirect, forbidden state, or missing data)
2. A user-facing popup/toast shows the backend permission/access error message
3. Ownership boundaries are enforced: user A can access user A content, and user B is blocked from user A content

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
- Tests run on Node.js 20-24 in GitHub Actions.
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
