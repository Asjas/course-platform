---
applyTo: "**/*.ts, **/*.tsx, **/*.css"
description: "Guidelines for building React applications with TanStack Router and TypeScript"
---

# React with TypeScript Development Instructions

Instructions for building high-quality React.js applications with modern patterns, hooks, and best practices following the official React documentation at https://react.dev/reference/react, the official TanStack Router documentation at https://tanstack.com/router/latest and the TypeScript documentation on https://www.typescriptlang.org/docs/.

## Project Context

- Latest React version (React 19+)
- TypeScript for type safety (strict mode)
- Functional components with hooks as default
- Follow React's official style guide and best practices
- Modern build tools (Vite 7)
- Implement proper component composition and reusability patterns

## Component Structure

- Use functional components exclusively. Avoid class-based components.
- Frontend stack:
  - TanStack Router for routing and navigation with file-based routing.
  - TanStack Query for data fetching and server state management.
  - TanStack Form for form building and validation.
  - Better Auth client for authentication (login/logout flows).
  - Zod 4 for schema validation.
  - tRPC client for type-safe API calls.
- UI Libraries:
  - Radix UI primitives via `@packages/shared-ui`.
  - React Aria Components for accessible interactive components.
  - Lucide React for icons.
- CSS Styling:
  - Tailwind CSS 4 with Lightning CSS via `tailwind.css`.
  - Use `class-variance-authority` for component variants.
  - Use `tailwind-merge` for conditional class merging.
- Testing:
  - React Testing Library and Vitest for unit tests.
  - Cypress for E2E tests.

## TypeScript Usage

- Define types for component props (e.g., `MyComponentProps`).
- Do NOT prefix interfaces with `I` - use descriptive names directly.
- Specify parameter types for all function parameters.
- Use explicit types over `any`. Prefer `unknown` when the type is unclear.
- Component return types are typically inferred - no need to specify `: JSX.Element`.

## Naming Conventions

- Use PascalCase for component names (e.g., `SignIn`, `UserProfile`).
- Use camelCase for variables, functions, and methods.
- Avoid abbreviations unless widely understood.
- Use descriptive prop names that reflect their purpose.

## Hooks and Functions

- Define components using ES5 function declarations (e.g., `function MyComponent() {}`).
- Use `export default function` for page/route components.
- Use React hooks appropriately (`useState`, `useEffect`, etc.).
- Use TanStack Query for server state (`useQuery`, `useMutation`).

## Code Style

- Always validate external data with Zod schemas.
- Follow ESLint rules defined in `eslint.config.mjs`.
- Prefer `const` over `let` for variable declarations.
- Use double quotes (`"`) for string literals.
- Place each prop on a new line when there are more than two props.
- Include error and pending boundaries for all routes.
- Accessibility:
  - Use semantic HTML5 elements over generic `div` elements.
  - Follow WCAG 2.2 accessibility guidelines.
  - Use React Aria Components for complex interactive patterns.

## TanStack Router Patterns

- File-based routing in `/src/routes/` directory.
- Root layout: `__root.tsx`.
- Index routes: `index.tsx`.
- Dynamic params: `$param.tsx` (e.g., `verify-email.$token.tsx`).
- Route groups: `(group)/` for layout grouping.
- Protected routes: `_authenticated/` layout prefix.

## Example

```tsx
interface MyComponentProps {
  name: string;
  count: number;
}

function MyComponent(props: MyComponentProps) {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    console.log("Clicked:", props.name);
  }

  return (
    <div>
      <h1>Hello, {props.name}</h1>
      <button onClick={handleClick}>Click me</button>
      <p>Count: {props.count}</p>
    </div>
  );
}

export default MyComponent;
```

## Key Libraries

- `react` + `react-dom` - React 19
- `@tanstack/react-router` - File-based routing
- `@tanstack/react-query` - Server state management
- `@tanstack/react-form` - Form management
- `@trpc/client` + `@trpc/tanstack-react-query` - Type-safe API
- `better-auth` - Authentication client
- `zod` - Schema validation
- `lucide-react` - Icons
- `react-aria-components` - Accessible components
- `sonner` - Toast notifications
- `tailwindcss` - CSS framework
