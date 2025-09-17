---
applyTo: "**"
description: "Make a plan to refactor the codebase to improve readability, maintainability, performance, and cyclomatic complexity."
---

# Codebase Refactoring Plan

Do you understand how the codebase is structured? I would like to make it cleaner and easy to read and understand by developers as well as for future maintainers.

## Objective

Analyze the codebase to refactor the TypeScript codebase to enhance:

- Readability: Clear naming, consistent formatting, and TypeScript interfaces.
- Maintainability: Modular code, reduced duplication, and comprehensive documentation.
- Testability: Components and hooks testable with React Testing Library and Vitest.
- Performance: Optimized rendering and data fetching with Tanstack Query.
- Cyclomatic Complexity: Simplified logic and reduced conditionals.

## Testability

- Write unit tests for all components and hooks using React Testing Library and Vitest.
- Cover main use cases, edge cases, and error states.

## Maintainability

- Eliminate duplication by extracting reusable hooks or utilities.
- Use immutable data with const and readonly.
- Leverage optional chaining (?.) and nullish coalescing (??) for safer code.
- Document setup and usage in README.md and inline comments.

## Performance

- Optimize Tanstack Query with staleTime and cacheTime to reduce API calls
- Use React.memo for components and useCallback for event handlers to prevent unnecessary renders.
- Flatten deeply nested component trees.

## Cyclomatic Complexity

- Refactor complex conditionals into smaller functions, early returns, or lookup tables.
- Avoid nested ternary operators; prefer if statements or switch for clarity.
- Extract logic from components into hooks for simpler control flow.

## Documentation and Consistency

- Create a docs/ folder with:
  - architecture.md: Folder structure and tech stack overview.
  - Update README.md with setup and usage instructions.

## Additional Notes

- The project is a pnpm monorepo (pnpm-workspace.yaml).
- Follow general coding guidelines for shared standards.
- Ensure all interactive elements have ARIA labels for accessibility.
- Use named exports for utilities and types when appropriate.
- Test Tanstack Query and Better Auth integrations thoroughly.
