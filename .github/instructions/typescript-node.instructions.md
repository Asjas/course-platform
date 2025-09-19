---
applyTo: "apps/server/**"
description: "Coding style guide for Node.js backend with TypeScript, Fastify, Drizzle, Better Auth, with Vitest testing"
---

# Project Context

- Backend Stack:
  - Node.js with TypeScript for server-side logic.
  - Fastify for HTTP server and routing.
  - Drizzle for database queries and mutations.
  - Better Auth for authentication.
  - Vitest for unit and integration testing.
- Database Structure:
  - Schemas defined in /src/db/schema/ (e.g., /src/db/schema/user/user.js for user schema).
  - Queries in /src/db/query.ts using Drizzle’s query builder with prepared statements.
  - Mutations in /src/db/mutation.ts for database inserts, updates, and deletes.

## Coding Guidelines
- General Standards
  - Prefer ES5 function declarations (e.g., function handleRequest() {} or export async function newUser() {}) over arrow functions for route handlers and utilities.
  - Specify parameter types and return types for all functions using TypeScript.
  - Use camelCase for variables, functions, and methods (e.g., userId, fetchUser).
  - Follow ESLint rules defined in the project configuration.
  - Prefer const over let for immutable variables.
  - Use double quotes (") for string literals.
  - Add JSDoc comments for complex functions or types.
  - Use .js for relative file import extension even though TypeScript is being used.
  - Use try/catch blocks for async operations.
- Fastify Routes
  - Define routes using ES5 function declarations for handlers.
  - Use TypeScript interfaces for request/response payloads (e.g., IUserRequest).
  - Register routes in a modular way (e.g., /src/routes/user.ts).
  - Integrate Better Auth for protected routes (e.g., use auth.middleware).
- Drizzle Database
  - Schemas: Define in /src/db/schema/<entity>/ (e.g., /src/db/schema/user/user.js).
  - Queries: Place in /src/db/query.ts using Drizzle’s query builder with prepared statements (e.g., sql.placeholder).
  - Mutations: Place in /src/db/mutation.ts using Drizzle’s insert/update/delete methods.
  - Use TypeScript’s inferred types (e.g., typeof user.$inferInsert) for type safety.
  - Name prepared queries descriptively (e.g., selectUserById, insertUser).
- Testing
  - Write unit and integration tests using Vitest.
  - Test Fastify routes, Drizzle queries, and mutations.
  - Mock database and auth dependencies (e.g., vi.mock for Drizzle’s db).
  - Cover main use cases, edge cases, and error scenarios.
- Documentation and Consistency
  - Add JSDoc comments for functions, interfaces, and complex logic.
  - Organize files by feature (e.g., /src/routes/user.ts, /src/db/schema/user.ts).
  - Create /docs/README.md for architecture and API endpoint details.

## Additional Notes

- File Organization:
  - Routes: /src/routes/<entity>.ts (e.g., /src/routes/user.ts).
  - Queries: /src/db/query.ts for all prepared queries.
  - Mutations: /src/db/mutation.ts for all insert/update/delete operations.
  - Schemas: /src/db/schema/<entity>/<entity>.js (e.g., /src/db/schema/user/user.js).
- Better Auth: Use auth.middleware for protected routes and auth.session for session management.
- Performance: Optimize Drizzle queries with prepared statements and indexes.
- Testing: Ensure 80%+ test coverage for routes, queries, and mutations.
- Documentation: Include endpoint details (e.g., GET /users/:id) in /docs/README.md.
