---
applyTo: "apps/web/**/*.ts, apps/web/**/*.tsx, apps/web/**/*.css, packages/**/*.ts, packages/**/*.tsx, packages/**/*.css, marketing/**/*.ts, marketing/**/*.tsx, marketing/**/*.css"
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
  - TanStack Query as an internal dependency for collection sync/caching layers.
  - TanStack Form for form building and validation.
  - Better Auth client for authentication (login/logout flows).
  - Zod 4 for schema validation.
  - tRPC client for collection internals and non-component service code.
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
- Use collection hooks from `~/lib/db.collections` for server state in components.

## Code Style

- Always validate external data with Zod schemas.
- **Zod 4 trim + validation**: Use `z.string().trim().check(z.email())` pattern — `.trim()` is not available on standalone types like `z.email()`. See [library-patterns-reference.md](../docs/library-patterns-reference.md) for details.
- Follow ESLint rules defined in `eslint.config.mjs`.
- Prefer `const` over `let` for variable declarations.
- Use double quotes (`"`) for string literals.
- Place each prop on a new line when there are more than two props.
- Include error and pending boundaries for all routes.
- **NEVER use file extensions (`.js`, `.ts`, `.tsx`) in imports** - Vite handles module resolution automatically. Use `~/lib/utils` not `~/lib/utils.js`.
- **NEVER use `window.confirm()` or `confirm()` for user confirmations** - use the `ConfirmDialog` component from `~/components/confirm-dialog` instead for accessible, keyboard-navigable dialogs.
- **React Compiler**: `babel-plugin-react-compiler` is enabled — do NOT add manual `useMemo`/`useCallback`
  unless you have a specific, measured performance problem. The compiler handles memoization automatically.
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

## Data Fetching Patterns

### Collection-First (Offline-First) Pattern

**Architectural Exception:** This project uses an offline-first architecture for web and Tauri native apps. Standard TanStack Router patterns (returning data from loaders for component consumption via `useLoaderData()`) are intentionally replaced with a preload-plus-collection-hook pattern to enable offline sync and local-first data access. Loader-returned data is still preferred for non-synced, request-scoped data (auth checks, route metadata).

All component-level data operations must use collection hooks/utilities from
`~/lib/db.collections`.

```tsx
import { CoursesCollection, useCourseById } from "~/lib/db.collections";

// ALWAYS preload in route loader
export const Route = createFileRoute("/_authenticated/courses/$courseId")({
  loader: async () => {
    await CoursesCollection.preload();
  },
  component: CoursePage,
});

// Use reactive collection hook in component
const { data: course, isLoading } = useCourseById({ courseId });
```

For multiple collections, preload in parallel:

```tsx
export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  loader: async () => {
    await Promise.all([
      CoursesCollection.preload(),
      ReviewsCollection.preload(),
    ]);
  },
  component: DashboardPage,
});
```

Insert with optimistic updates:

```tsx
const tx = ReviewsCollection.insert(newReview);
await tx.isPersisted.promise;
```

### Temporary Exception Policy

Direct component usage of tRPC/React Query is prohibited, except for explicitly
documented transitional modules in `docs/offline-first-architecture.md`.

## Form Patterns

### TanStack Form with Zod Validation

All forms use `@tanstack/react-form` with Zod schemas for validation. The form
validates on `blur` and `submit`. Field errors are displayed via
`~/components/field-info.tsx`:

```tsx
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import FieldInfo from "~/components/field-info";
import { myFormSchema } from "~/schema/my-form";
import { authClient } from "~/lib/auth.client";

export default function MyForm() {
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onBlur: myFormSchema,
      onSubmit: myFormSchema,
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signIn.email(value);
      if (error) {
        toast.error(error.message || "Failed");
        return;
      }
      toast.success("Success!");
    },
  });

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}
      noValidate
    >
      {/* Block navigation on unsaved changes */}
      <form.Subscribe
        selector={(state) => [state.isDirty]}
        children={([isDirty]) => <BlockerComponent formIsDirty={isDirty} />}
      />

      <form.Field
        name="email"
        children={({ state, handleChange, handleBlur }) => (
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              state={state}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <FieldInfo field={state} />
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.isDirty, state.isSubmitting]}
        children={([isDirty, isSubmitting]) => (
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        )}
      />
    </form>
  );
}
```

Key rules:
- Always use `validators: { onBlur, onSubmit }` with a Zod schema.
- Display field errors with `<FieldInfo field={state} />` from `~/components/field-info`.
- Use `<form.Subscribe>` for reactive submit-button state — not a plain button.
- Add `<BlockerComponent formIsDirty={isDirty} />` to prevent accidental navigation.
- Use `noValidate` on the `<form>` element to disable native browser validation.

### Create/Edit Mode Pattern

For forms that handle both create and update operations, check for an existing item from
the collection and conditionally use `Collection.insert` or `Collection.update`:

```tsx
const { data: existingItem } = useItemById({ id });
const isEditing = !!existingItem;

async function handleSubmit() {
  const toastId = toast.loading(isEditing ? "Updating..." : "Creating...");
  try {
    if (isEditing && existingItem) {
      await ItemsCollection.update(existingItem.id, (draft) => {
        draft.title = title;
      });
    } else {
      const tx = ItemsCollection.insert({ id: ulid(), title });
      await tx.isPersisted.promise;
    }
    toast.success(isEditing ? "Updated!" : "Created!", { id: toastId });
    setIsSheetOpen(false);
  } catch {
    toast.error(`Failed to ${isEditing ? "update" : "create"}`, { id: toastId });
  }
}
```

### Toast Notifications

Use `sonner` for user feedback with loading states:

```tsx
import { toast } from "sonner";

const toastId = toast.loading("Processing...");
try {
  await doSomething();
  toast.success("Done!", { id: toastId });
} catch (error) {
  toast.error("Failed", { id: toastId });
}
```

## Sheet/Modal Pattern

Use Sheet components for side panel forms:

```tsx
const [isSheetOpen, setIsSheetOpen] = useState(false);

<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>{isEditing ? "Edit Item" : "Create Item"}</SheetTitle>
      <SheetDescription>
        {isEditing ? "Update your item." : "Add a new item."}
      </SheetDescription>
    </SheetHeader>
    {/* Form content */}
  </SheetContent>
</Sheet>
```

## Confirmation Dialog Pattern

**NEVER use `window.confirm()` or `confirm()`** - always use the accessible `ConfirmDialog` component:

```tsx
import { ConfirmDialog } from "~/components/confirm-dialog";

function MyComponent() {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string; name: string} | null>(null);

  function handleDeleteClick(itemId: string, itemName: string) {
    setItemToDelete({ id: itemId, name: itemName });
    setDeleteConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    if (!itemToDelete) return;
    // Perform deletion
    await deleteItem(itemToDelete.id);
    setItemToDelete(null);
  }

  return (
    <>
      <button onClick={() => handleDeleteClick(item.id, item.name)}>
        Delete
      </button>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        description={`Are you sure you want to delete ${itemToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"  // Use "destructive" for dangerous actions
      />
    </>
  );
}
```

The `ConfirmDialog` component provides:
- Keyboard navigation support (Tab, Enter, Escape)
- Proper ARIA attributes for screen readers
- Consistent styling with the rest of the application
- Two variants: "default" (green) and "destructive" (red)

## Conditional UI Based on State

Show different UI based on data state:

```tsx
{/* Button text changes based on mode */}
<button onClick={() => setIsSheetOpen(true)}>
  {isEditing ? (
    <>
      <Edit3 className="h-4 w-4" />
      Edit Item
    </>
  ) : (
    "Add Item"
  )}
</button>

{/* Show status badge when item exists */}
{existingItem && (
  <p className="text-xs text-gray-500">
    Status:{" "}
    {existingItem.approved ? (
      <span className="text-green-600">(Approved)</span>
    ) : (
      <span className="text-yellow-600">(Pending)</span>
    )}
  </p>
)}

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

- `react` + `react-dom` — React 19 with React Compiler (`babel-plugin-react-compiler`)
- `@tanstack/react-router` — File-based routing with auto code-splitting
- `@tanstack/react-query` — Internal dependency for collection sync/caching
- `@tanstack/react-form` — Form management with Zod validators
- `@tanstack/react-db` + `@tanstack/query-db-collection` — Offline-first collections
- `@trpc/client` + `@trpc/tanstack-react-query` — Type-safe API (collection internals only)
- `better-auth` — Authentication client
- `zod` — Schema validation (v4, use `.check()` pattern)
- `lucide-react` — Icons
- `react-aria-components` — Accessible interactive components
- `sonner` — Toast notifications
- `tailwindcss` + Lightning CSS — CSS framework with auto compilation
- `class-variance-authority` + `tailwind-merge` — Component variants
- `ulid` — ID generation for new entities
- `@mdx-js/react` — MDX content rendering
- `dompurify` — HTML sanitization for markdown output

For verified library patterns, gotchas, and testing best practices, see [docs/library-patterns-reference.md](../docs/library-patterns-reference.md).
