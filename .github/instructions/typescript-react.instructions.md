---
applyTo: "**/*.tsx"
---

# React with TypeScript Coding Style Guide

## Component Structure

- Use functional components exclusively. Avoid class-based components.
- Define components using ES5 function declarations (e.g., function MyComponent() {}) instead of arrow functions (e.g., const MyComponent = () => {}).
- Use PascalCase for component names (e.g., SignIn, UserProfile).

## TypeScript Usage

- Define interfaces for component props, prefixed with I (e.g., IComponentProps).
- Specify parameter types for all function parameters.
- Specify return types for all functions, including components (e.g., : JSX.Element for components).
- Use explicit types over any. Prefer unknown when the type is unclear and must be narrowed.

## Naming Conventions

- Use camelCase for variables, functions, and methods
- Avoid abbreviations unless widely understood (e.g., id is fine, but avoid usr for user).

## Hooks and Functions

- Prefer ES5 function declarations for event handlers and utility functions (e.g., function handleClick() {}).
- Avoid using arrow functions for event handlers or utilities unless required for lexical this binding.
- Minimize use of React hooks (useState, useEffect, etc.). When necessary, type their inputs and outputs explicitly (e.g., useState<string>("")).

## Code Style

- Use double quotes (") for string literals.
- Place each prop on a new line for readability when there are more than two props.
- Add a single space after the colon in type annotations (e.g., name: string).
- Include a blank line between major sections (e.g., imports, interfaces, component body).

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
- Use descriptive prop names that reflect their purpose (e.g., userName instead of name if it represents a user's name).
- Avoid inline styles; use Tailwind classes for styling.
- Write clear JSDoc comments for complex logic or interfaces when necessary.
