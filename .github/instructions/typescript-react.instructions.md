---
applyTo: "**/*.ts, **/*.tsx, **/*.css"
description: 'Guidelines for building TanStack Router applications with TypeScript'
---

# React with TypeScript Development Instructions

Instructions for building high-quality React.js applications with modern patterns, hooks, and best practices following the official React documentation at https://react.dev/reference/react, the official TanStank Router documentation at https://tanstack.com/router/latest and the TypeScript documentation on https://www.typescriptlang.org/docs/.

## Project Context
- Latest React version (React 19+)
- TypeScript for type safety (when applicable)
- Functional components with hooks as default
- Follow React's official style guide and best practices
- Use modern build tools (Vite)
- Implement proper component composition and reusability patterns

## Component Structure
- Use functional components exclusively. Avoid class-based components.
- Frontend stack:
  - Tanstack Router for routing and natigation with TypeScript.
  - Tanstack Query for data fetching and state management.
  - Tanstack DB for client-side data management.
  - Tanstack Form for form building.
  - Better Auth for authentication-related components (e.g., login/logout flows).
  - Zod (validation)
- CSS Styling:
  - Use Tailwind CSS (via tailwind.css) classes for styling, applied via className.
- Testing:
  - Ensure test coverage with React Testing Library and Vitest for all components.

## TypeScript Usage
- Define interfaces for component props, prefixed with I (e.g., IComponentProps).
- Specify parameter types for all function parameters.
- Specify return types for all functions, including components (e.g., : JSX.Element for components).
- Use explicit types over any. Prefer unknown when the type is unclear and must be narrowed.

## Naming Conventions
- Use PascalCase for component names (e.g., SignIn, UserProfile).
- Use camelCase for variables, functions, and methods
- Avoid abbreviations unless widely understood (e.g., id is fine, but avoid usr for user).
- Use descriptive prop names that reflect their purpose (e.g., userName instead of name if it represents a user's name).

## Hooks and Functions
- Define components using ES5 function declarations (e.g., function MyComponent() {}) instead of arrow functions (e.g., const MyComponent = () => {}).
- Prefer ES5 function declarations (e.g., function handleClick() {}) over ES6 arrow functions for event handlers and utilities.
- Minimize use of React hooks (useState, useEffect, etc.). When necessary, use Tanstack Query for state management.

## Code Style
- Always validate external data with Zod schemas
- Follow ESLint rules as defined in the project configuration.
- Prefer const over let for variable declarations.
- Use double quotes (") for string literals.
- Place each prop on a new line for readability when there are more than two props.
- Add a single space after the colon in type annotations (e.g., name: string).
- Include a blank line between major sections (e.g., imports, interfaces, component body).
- Use try/catch blocks for async operations.
- Include error and pending boundaries for all routes
- Accessibility:
  - Use HTML5 elements when needed over generic div elements.
  - Follow accessibility best practices with ARIA attributes

## Example

```tsx
// Interface for props
interface IMyComponentProps {
  name: string;
  count: number;
}

// Functional component with ES5 function declaration
function MyComponent(props: IMyComponentProps): JSX.Element {
  const initialCount = props.count;

  function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    console.log('Clicked:', props.name);
  }

  return (
    <div>
      <h1>Hello, {props.name}</h1>
      <button onClick={handleClick}>Click me</button>
      <p>Count: {initialCount}</p>
    </div>
  );
}
```

## Additional Notes

- Ensure all components are exported with export default or named exports.
- Use named exports for utility functions and types when appropriate.
- Write clear JSDoc comments for complex logic or interfaces when necessary.
