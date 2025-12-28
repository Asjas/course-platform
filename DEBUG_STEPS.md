# Debug Steps Added for E2E Test Failures

This file tracks all debug logging added to diagnose e2e test authentication failures.
**These debug steps should be removed once the issue is resolved.**

## Files Modified

### 1. `.github/workflows/ci.yml` (e2e-tests job)

**Location: After "Run database migrations" step (line ~235-236)**
- Added step: "Debug - Check environment variables"
  - Verifies PEPPER_SECRET, DATABASE_URL, BETTER_AUTH_SECRET are set
  - Logs their lengths (not values for security)
  - Shows current working directory and Node version

**Location: After "Seed test database with E2E users" step (line ~238-240)**
- Added step: "Debug - Verify seeded users and passwords"
  - Queries database to verify users were seeded correctly
  - Checks if test@example.com user exists
  - Verifies account entry with hashed password exists
  - Shows password hash prefix (first 20 chars only)

**Location: After "Check server started successfully" step (line ~253-258)**
- Enhanced existing step to also check auth session endpoint
- Added step: "Debug - Test authentication manually"
  - Performs manual curl-based login with test user credentials
  - Saves cookies and checks session response
  - Verifies auth flow works outside of Cypress

**Location: "Cypress run" step (line ~260-271)**
- Added environment variables:
  - DEBUG: cypress:* (enables Cypress debug logging)
  - CYPRESS_DEBUG: true

### 2. `apps/web/cypress/support/commands.ts`

**Both loginAsAdmin and loginAsRegularUser commands enhanced with:**
- Log credentials being used (email and password length, not actual password)
- Verify sign-in page URL loaded correctly
- Confirm form fields populated with correct values
- Log when submit button is clicked
- Wait and check for error messages on page after submission
- Log all cookies after login attempt with their names
- Log localStorage contents
- Confirm Dashboard link appears (successful login)

## Debug Output to Look For

### CI Workflow Logs

1. **Environment Variables Check**
   - Should see "PEPPER_SECRET is set: yes"
   - PEPPER_SECRET length should be > 0
   - DATABASE_URL and BETTER_AUTH_SECRET should also be set

2. **Seeded Data Verification**
   - Users list should show admin and regular test users
   - Accounts list should show entries with password_prefix starting with "$argon2"
   - "Test user exists: true"
   - "Test user account exists: true"

3. **Manual Authentication Test**
   - Sign in response should return 200 OK
   - Cookies file should contain session cookies
   - Session response should return user data (not unauthorized)

4. **Cypress Debug Logs**
   - Will show detailed Cypress internals
   - Look for network requests, command execution, and errors

### Cypress Test Logs

For each login attempt:
- "DEBUG: Attempting admin/regular user login"
- "DEBUG: Email: [email address]"
- "DEBUG: Password length: [number]"
- "DEBUG: Sign-in page URL: [URL]"
- "DEBUG: Email field populated correctly"
- "DEBUG: Submit button clicked"
- "DEBUG: Cookies after login: [count] cookies"
- Cookie names (should include session-related cookies)
- LocalStorage contents
- "DEBUG: Login successful - Dashboard link visible" (if successful)
- OR "DEBUG: ERROR MESSAGE DETECTED ON PAGE" (if failed)

## Removal Checklist

Once the issue is resolved, remove the following:

- [ ] Remove "Debug - Check environment variables" step from `.github/workflows/ci.yml`
- [ ] Remove "Debug - Verify seeded users and passwords" step from `.github/workflows/ci.yml`
- [ ] Remove "Debug - Test authentication manually" step from `.github/workflows/ci.yml`
- [ ] Remove DEBUG and CYPRESS_DEBUG environment variables from "Cypress run" step
- [ ] Remove enhanced logging from Cypress session endpoint check
- [ ] Revert `apps/web/cypress/support/commands.ts` to remove all cy.log() debug statements
- [ ] Remove all `cy.wait(1000)` debug delays
- [ ] Remove debug checks for error messages and cookies in Cypress commands
- [ ] Delete this DEBUG_STEPS.md file
