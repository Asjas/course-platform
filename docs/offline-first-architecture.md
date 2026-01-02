# Offline-First Architecture Documentation

## Overview

This document outlines the offline-first architecture for the Course Platform,
designed to support both web and Tauri native applications with full offline
capabilities.

## Core Principle

**All data fetching, viewing, editing, and deletion MUST go through TanStack
React-DB collections.** Direct usage of React Query or tRPC in components is
prohibited as it breaks offline functionality.

---

## Data Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Frontend Components                            │
│                   (use hooks like useCourses, useReviews)               │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Collection Hooks Layer                           │
│              (apps/web/src/lib/collections/hooks/*.ts)                  │
│         Provides: useCourses(), useCourseById(), etc.                   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        TanStack React-DB Collections                     │
│              (apps/web/src/lib/collections/*.collection.ts)             │
│     - Automatic caching and persistence                                  │
│     - Optimistic updates via onInsert/onUpdate/onDelete                 │
│     - SSE subscription for real-time sync                               │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
    ┌───────────────────────────┐   ┌───────────────────────────────────┐
    │      tRPC Client          │   │        SSE Subscription            │
    │  (queryFn for initial     │   │   (real-time updates from         │
    │   data fetch)             │   │    Redis Streams)                  │
    └───────────────────────────┘   └───────────────────────────────────┘
```

---

## Drizzle Schema → Collection Mapping

### Currently Implemented Collections

| Drizzle Table          | Collection                          | Status  | SSE | CRUD |
| ---------------------- | ----------------------------------- | ------- | --- | ---- |
| `supportTicket`        | `SupportTicketsCollection`          | ✅ Done | ✅  | CRD  |
| `coupon`               | `CouponsCollection`                 | ✅ Done | ✅  | CRUD |
| `platformAnnouncement` | `AnnouncementsCollection`           | ✅ Done | ✅  | R    |
| `course`               | `CoursesCollection`                 | ✅ Done | ✅  | R    |
| `course` (admin)       | `CoursesAdminCollection`            | ✅ Done | ✅  | R    |
| `courseReview`         | `ReviewsCollection`                 | ✅ Done | ✅  | CRUD |
| `chatMessageReport`    | `ChatReportsCollection`             | ✅ Done | ✅  | R    |
| `user` (searchable)    | `SearchableUsersCollection`         | ✅ Done | ✅  | R    |
| `syncStatus`           | `SyncStatusCollection`              | ✅ Done | -   | RU   |
| `gdprAuditLog`         | `GdprAuditLogsCollection`           | ✅ Done | -   | R    |
| Chat Messages          | `createChannelMessagesCollection()` | ✅ Done | ✅  | CRD  |
| DM Messages            | `createDMMessagesCollection()`      | ✅ Done | ✅  | CRD  |

### Collections Needed

| Drizzle Table                 | Collection Needed              | Priority  | SSE | CRUD |
| ----------------------------- | ------------------------------ | --------- | --- | ---- |
| `user`                        | `UsersCollection`              | 🔴 High   | ✅  | CRUD |
| `enrollment`                  | `EnrollmentsCollection`        | 🔴 High   | ✅  | CR   |
| `courseProgress`              | `CourseProgressCollection`     | 🔴 High   | ✅  | RU   |
| `lessonProgress`              | `LessonProgressCollection`     | 🔴 High   | ✅  | RU   |
| `courseModule`                | `ModulesCollection`            | 🟡 Medium | ✅  | CRUD |
| `courseLesson`                | `LessonsCollection`            | 🟡 Medium | ✅  | CRUD |
| `payment`                     | `PaymentsCollection`           | 🟡 Medium | ✅  | R    |
| `invoice`                     | `InvoicesCollection`           | 🟡 Medium | ✅  | R    |
| `userNotification`            | `NotificationsCollection`      | 🟡 Medium | ✅  | RU   |
| `directMessageRequest`        | `DMRequestsCollection`         | 🟡 Medium | ✅  | CRU  |
| `directMessageConversation`   | `DMConversationsCollection`    | 🟡 Medium | ✅  | RU   |
| `teamLicense`                 | `TeamLicensesCollection`       | 🟢 Low    | ✅  | CRUD |
| `teamLicenseInvite`           | `TeamLicenseInvitesCollection` | 🟢 Low    | ✅  | CRUD |
| `courseWishlist`              | `WishlistsCollection`          | 🟢 Low    | ✅  | CRD  |
| `courseCompletionCertificate` | `CertificatesCollection`       | 🟢 Low    | ✅  | R    |
| `courseInstructorNote`        | `InstructorNotesCollection`    | 🟢 Low    | ✅  | CRUD |
| `courseFaq`                   | `CourseFaqsCollection`         | 🟢 Low    | ✅  | CRUD |
| `platformAnnouncementRead`    | N/A (join table)               | -         | -   | -    |

### Tables That Don't Need Collections

| Table          | Reason               |
| -------------- | -------------------- |
| `account`      | Better Auth internal |
| `session`      | Better Auth internal |
| `verification` | Better Auth internal |
| `organization` | Future feature       |
| `member`       | Future feature       |
| `invitation`   | Future feature       |

---

## Directory Structure (Target)

```
apps/web/src/lib/collections/
├── index.ts                           # Re-exports all collections and hooks
├── types.ts                           # Shared types (SyncState, EntitySyncUpdate)
├── utils.ts                           # Sync utilities (getLastSyncTimestamp, etc.)
│
├── support-tickets/
│   ├── support-tickets.collection.ts  # Collection definition with onInsert/onUpdate/onDelete
│   └── hooks.ts                       # useSupportTickets, useSupportTicketById, etc.
│
├── coupons/
│   ├── coupons.collection.ts
│   └── hooks.ts
│
├── announcements/
│   ├── announcements.collection.ts
│   └── hooks.ts
│
├── courses/
│   ├── courses.collection.ts          # Both CoursesCollection and CoursesAdminCollection
│   └── hooks.ts
│
├── reviews/
│   ├── reviews.collection.ts
│   └── hooks.ts
│
├── chat-reports/
│   ├── chat-reports.collection.ts
│   └── hooks.ts
│
├── searchable-users/
│   ├── searchable-users.collection.ts
│   └── hooks.ts
│
├── sync-status/
│   ├── sync-status.collection.ts
│   └── hooks.ts
│
├── gdpr-audit-logs/
│   ├── gdpr-audit-logs.collection.ts
│   └── hooks.ts
│
├── chat-messages/
│   ├── chat-messages.collection.ts    # Factory functions for channel/DM messages
│   └── hooks.ts
│
└── notifications/
    ├── notifications.collection.ts
    └── hooks.ts
```

---

## Collection Template

Each collection should follow this pattern:

```typescript
// collections/example/example.collection.ts
import type { ExampleType } from "@apps/server/src/routers/example/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

export type Example = ExampleType[number];

export const ExampleCollection = createCollection(
  queryCollectionOptions<Example>({
    queryClient,
    getKey: (item) => item.id,
    queryKey: trpc.example.getAll.queryKey(),
    queryFn: () => trpcClient.example.getAll.query(),

    // Only include handlers for operations the collection supports
    onInsert: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];
        await trpcClient.example.create.mutate(modified);
      } catch (error) {
        console.error("Error inserting example:", error);
        toast.error("Failed to create. Please try again.");
        throw error;
      }
    },

    onUpdate: async ({ transaction }) => {
      try {
        const { modified } = transaction.mutations[0];
        await trpcClient.example.update.mutate({
          id: modified.id,
          // ... fields
        });
      } catch (error) {
        console.error("Error updating example:", error);
        toast.error("Failed to update. Please try again.");
        throw error;
      }
    },

    onDelete: async ({ transaction }) => {
      try {
        const { original } = transaction.mutations[0];
        await trpcClient.example.delete.mutate({ id: original.id });
      } catch (error) {
        console.error("Error deleting example:", error);
        toast.error("Failed to delete. Please try again.");
        throw error;
      }
    },
  }),
);
```

```typescript
// collections/example/hooks.ts
import { ExampleCollection } from "./example.collection";
import { eq, useLiveQuery } from "@tanstack/react-db";

export function useExamples() {
  return useLiveQuery(ExampleCollection);
}

export function useExampleById({ exampleId }: { exampleId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ example: ExampleCollection })
        .where(({ example }) => eq(example.id, exampleId))
        .findOne();
    },
    [exampleId],
  );
}

export function useExamplesByUserId({ userId }: { userId: string }) {
  return useLiveQuery(
    (query) => {
      return query
        .from({ example: ExampleCollection })
        .where(({ example }) => eq(example.userId, userId))
        .select(({ example }) => example);
    },
    [userId],
  );
}
```

---

## SSE Sync Requirements

Each collection that needs real-time updates must have:

### Server Side (apps/server)

1. **Sync config** in `src/lib/sse-sync.ts`:

```typescript
export const exampleSyncConfig: EntitySyncConfig = {
  streamKeyPrefix: "sync:examples",
  maxStreamLength: 10000,
};
```

2. **Subscription endpoint** in router:

```typescript
subscribeToUpdates: publicProcedure
  .input(z.object({ lastEventId: z.string().nullish() }))
  .use(isAuthenticated)
  .subscription(async function* ({ input }) {
    yield* streamEntityUpdates<Example>(
      exampleSyncConfig,
      input.lastEventId,
    );
  }),
```

3. **Offline sync query**:

```typescript
getUpdatesSince: publicProcedure
  .input(z.object({ since: z.number() }))
  .use(isAuthenticated)
  .query(async ({ input }) => {
    return getEntityUpdatesSince<Example>(exampleSyncConfig, input.since);
  }),
```

4. **Publish changes in mutations**:

```typescript
await publishEntityChange(
  exampleSyncConfig,
  createSyncUpdate("created", example.id, example, ctx.user.id),
);
```

### Frontend Side (apps/web)

1. **Sync hook** in `src/hooks/useSseSync.ts`:

```typescript
export function useExamplesSync() {
  return useSseCollectionSync<Example>({
    collectionName: "examples",
    collection: ExampleCollection,
    subscriptionEndpoint: "example.subscribeToUpdates",
    getUpdatesSince: (since) =>
      trpcClient.example.getUpdatesSince.query({ since }),
  });
}
```

---

## Route Preloading

All routes using collections MUST preload in their loader:

```typescript
export const Route = createFileRoute("/_authenticated/examples")({
  loader: async () => {
    await ExampleCollection.preload();
  },
  component: ExamplesPage,
});

// For multiple collections
export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: async () => {
    await Promise.all([
      CoursesCollection.preload(),
      EnrollmentsCollection.preload(),
      ProgressCollection.preload(),
    ]);
  },
  component: DashboardPage,
});
```

---

## Security Audit Findings

### PUBLIC ENDPOINTS (Require Review)

The following endpoints have NO authentication:

| Router           | Endpoint               | Status      | Action Needed                                |
| ---------------- | ---------------------- | ----------- | -------------------------------------------- |
| `announcements`  | `getPublished`         | ⚠️          | Review if should be public                   |
| `announcements`  | `getById`              | ✅          | OK for public announcements                  |
| `announcements`  | `getUnreadForUser`     | 🔴          | ADD AUTH - takes userId without verification |
| `announcements`  | `getReadForUser`       | 🔴          | ADD AUTH - takes userId without verification |
| `announcements`  | `markAsRead`           | 🔴          | ADD AUTH - allows marking any user's as read |
| `courses`        | `getAll`               | ✅          | OK - public course listing                   |
| `courses`        | `getBySlug`            | ✅          | OK - public course detail                    |
| `courses`        | `getCourseLessons`     | ⚠️          | Check enrollment for non-preview             |
| `courses`        | `getLessonById`        | ⚠️          | Check enrollment for non-preview             |
| `courses`        | `subscribeToUpdates`   | ✅          | OK - public SSE                              |
| `courses`        | `getUpdatesSince`      | ✅          | OK - public sync                             |
| `supportTickets` | `getAll`               | 🔴 CRITICAL | ADD AUTH - exposes ALL tickets               |
| `supportTickets` | `getSupportTicketById` | 🔴 CRITICAL | ADD AUTH + ownership check                   |
| `stats`          | `getStats`             | ⚠️          | Review if aggregate data is OK public        |
| `coupons`        | `redeemCoupon`         | ⚠️          | Should require auth                          |

### Authorization Concerns

| Router           | Endpoint           | Issue                                                    |
| ---------------- | ------------------ | -------------------------------------------------------- |
| `notifications`  | `getUnreadForUser` | Takes userId input, should verify ctx.user.id === userId |
| `notifications`  | `getReadForUser`   | Takes userId input, no verification                      |
| `notifications`  | `markAsRead`       | Any user can mark any notification                       |
| `notifications`  | `markAllAsRead`    | Any user can mark all for any user                       |
| `notifications`  | `batchDelete`      | Any user can delete any notifications                    |
| `directMessages` | `getDMRequest`     | No check user is requester/recipient                     |

---

## Migration Checklist

### Phase 1: Security Fixes (Immediate)

- [ ] Fix `supportTickets` - add auth and ownership checks
- [ ] Fix `announcements` user-scoped endpoints - add auth
- [ ] Fix `notifications` authorization - verify userId matches ctx.user.id
- [ ] Fix `directMessages` authorization

### Phase 2: Collection Refactoring

- [ ] Create `collections/` directory structure
- [ ] Move `SupportTicketsCollection` to `collections/support-tickets/`
- [ ] Move `CouponsCollection` to `collections/coupons/`
- [ ] Move all other collections
- [ ] Update all imports

### Phase 3: New Collections

- [ ] Create `EnrollmentsCollection`
- [ ] Create `CourseProgressCollection` / `LessonProgressCollection`
- [ ] Create `NotificationsCollection`
- [ ] Create `DMRequestsCollection` / `DMConversationsCollection`
- [ ] Create remaining collections as needed

### Phase 4: SSE Implementation

- [ ] Add SSE to all new collections
- [ ] Verify all collections have `subscribeToUpdates` endpoint
- [ ] Verify all collections have `getUpdatesSince` endpoint
- [ ] Create sync hooks in `useSseSync.ts`

### Phase 5: Component Migration

- [ ] Audit all components using direct tRPC/React Query
- [ ] Migrate to collection hooks
- [ ] Remove direct tRPC usage from components

---

## Anti-Patterns (DO NOT DO)

```typescript
// ❌ BAD: Direct tRPC in components
function MyComponent() {
  const { data } = trpc.courses.getAll.useQuery();
  // This breaks offline!
}

// ❌ BAD: Direct React Query
function MyComponent() {
  const { data } = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetch('/api/courses')
  });
  // This breaks offline!
}

// ✅ GOOD: Use collection hooks
function MyComponent() {
  const { data } = useCourses();
  // Works offline via React-DB!
}
```

---

## Last Updated

2026-01-02
