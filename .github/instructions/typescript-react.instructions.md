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
- **NEVER use `window.confirm()` or `confirm()` for user confirmations** - use the `ConfirmDialog` component from `~/components/confirm-dialog` instead for accessible, keyboard-navigable dialogs.
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

### tRPC with TanStack Query

Use `trpc.<router>.<method>.queryOptions()` with `useQuery` for queries:

```tsx
import { useQuery } from "@tanstack/react-query";
import { trpc, trpcClient } from "~/lib/trpc.client";

// Fetching data with useQuery
const { data, isLoading, refetch } = useQuery({
  ...trpc.reviews.getUserReviewForCourse.queryOptions({ courseId }),
  enabled: !!courseId, // Conditional fetching
});
```

Use `trpcClient` directly for mutations (not `useMutation`):

```tsx
// Direct mutation call
await trpcClient.reviews.updateUserReview.mutate({
  reviewId: existingReview.id,
  rating,
  title,
  comment,
});
```

### Collections with TanStack Query DB

Use collections from `~/lib/db.collections` for reactive data:

```tsx
import { CoursesCollection, useCourseById } from "~/lib/db.collections";

// Preload in route loader
export const Route = createFileRoute("/_authenticated/courses/$courseId")({
  loader: async ({ params }) => {
    await CoursesCollection.preload();
  },
});

// Use reactive query in component
const { data: course, isLoading } = useCourseById({ courseId });
```

Insert with optimistic updates:

```tsx
const tx = ReviewsCollection.insert(newReview);
await tx.isPersisted.promise;
await ReviewsCollection.utils.refetch();
```

## Form Patterns

### Create/Edit Mode Pattern

For forms that handle both create and update operations:

```tsx
// Fetch existing data
const { data: existingItem, refetch } = useQuery({
  ...trpc.items.getById.queryOptions({ id }),
  enabled: !!id,
});

// Determine mode
const isEditing = !!existingItem;

// Pre-populate form when opening
useEffect(() => {
  if (isSheetOpen && existingItem) {
    setTitle(existingItem.title);
    setContent(existingItem.content);
  } else if (isSheetOpen && !existingItem) {
    // Reset for new item
    setTitle("");
    setContent("");
  }
}, [isSheetOpen, existingItem]);

// Handle submit with mode-aware logic
async function handleSubmit() {
  setIsSubmitting(true);
  const toastId = toast.loading(isEditing ? "Updating..." : "Creating...");

  try {
    if (isEditing && existingItem) {
      await trpcClient.items.update.mutate({ id: existingItem.id, title, content });
      await refetch();
      toast.success("Updated successfully!", { id: toastId });
    } else {
      // Create new item
      const tx = ItemsCollection.insert({ id: ulid(), title, content });
      await tx.isPersisted.promise;
      toast.success("Created successfully!", { id: toastId });
    }
    setIsSheetOpen(false);
  } catch (error) {
    toast.error(`Failed to ${isEditing ? "update" : "create"}`, { id: toastId });
  } finally {
    setIsSubmitting(false);
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
