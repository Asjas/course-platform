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
│            (apps/web/src/lib/collections/<entity>/hooks.ts)             │
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

| Drizzle Table          | Collection                             | Status  | SSE | CRUD |
| ---------------------- | -------------------------------------- | ------- | --- | ---- |
| `supportTicket`        | `SupportTicketsCollection`             | ✅ Done | ✅  | CRD  |
| `coupon`               | `CouponsCollection`                    | ✅ Done | ✅  | CRUD |
| `platformAnnouncement` | `AnnouncementsCollection`              | ✅ Done | ✅  | R    |
| `course`               | `CoursesCollection`                    | ✅ Done | ✅  | R    |
| `course` (admin)       | `CoursesAdminCollection`               | ✅ Done | ✅  | R    |
| `courseProgress`       | `CourseProgressCollection`             | ✅ Done | -   | R    |
| `lessonProgress`       | `LessonProgressCollection`             | ✅ Done | -   | R    |
| `courseReview`         | `ReviewsCollection`                    | ✅ Done | ✅  | CRUD |
| `chatMessageReport`    | `ChatReportsCollection`                | ✅ Done | ✅  | RU   |
| `user` (searchable)    | `SearchableUsersCollection`            | ✅ Done | ✅  | R    |
| `syncStatus`           | `SyncStatusCollection`                 | ✅ Done | -   | RU   |
| `gdprAuditLog`         | `GdprAuditLogsCollection`              | ✅ Done | -   | R    |
| `payment`/`invoice`    | `PurchasesCollection`                  | ✅ Done | -   | R    |
| `userNotification`     | N/A (React Query hooks, no collection) | ✅ Done | ✅  | RU   |
| Chat Messages          | `createChannelMessagesCollection()`    | ✅ Done | ✅  | CRUD |
| DM Messages            | `createDMMessagesCollection()`         | ✅ Done | ✅  | CRUD |
| Thread Messages        | `createThreadMessagesCollection()`     | ✅ Done | ✅  | CRUD |

### Collections Needed

| Drizzle Table                 | Collection Needed              | Priority  | SSE | CRUD |
| ----------------------------- | ------------------------------ | --------- | --- | ---- |
| `user`                        | `UsersCollection`              | 🔴 High   | ✅  | CRUD |
| `enrollment`                  | `EnrollmentsCollection`        | 🔴 High   | ✅  | CR   |
| `courseModule`                | `ModulesCollection`            | 🟡 Medium | ✅  | CRUD |
| `courseLesson`                | `LessonsCollection`            | 🟡 Medium | ✅  | CRUD |
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

| Table                  | Reason                                            |
| ---------------------- | ------------------------------------------------- |
| `account`              | Better Auth internal                              |
| `session`              | Better Auth internal                              |
| `verification`         | Better Auth internal                              |
| `organization`         | Organization feature (app schema, not yet active) |
| `member`               | Organization feature (app schema, not yet active) |
| `invitation`           | Organization feature (app schema, not yet active) |
| `supportTicketComment` | Managed via parent `supportTicket` relations      |
| `teamLicenseSeat`      | Managed via parent `teamLicense` relations        |

---

## Directory Structure (Current)

Each collection subdirectory contains an `index.ts` re-exporting its contents.

```
apps/web/src/lib/collections/
├── index.ts                           # Re-exports all collections and hooks
├── types.ts                           # Shared types (SyncState, EntitySyncUpdate)
├── utils.ts                           # Sync utilities (getLastSyncTimestamp, etc.)
│
├── support-tickets/
│   ├── support-tickets.collection.ts  # Collection with onInsert/onDelete
│   ├── hooks.ts                       # useSupportTickets, useSupportTicketsByCourseId, useSupportTicketById
│   └── index.ts
│
├── coupons/
│   ├── coupons.collection.ts          # Collection with onInsert/onUpdate/onDelete
│   ├── hooks.ts                       # useCoupons, useCouponById
│   └── index.ts
│
├── announcements/
│   ├── announcements.collection.ts
│   ├── hooks.ts                       # useAnnouncements, useUnreadAnnouncements, useReadAnnouncements
│   └── index.ts
│
├── courses/
│   ├── courses.collection.ts          # CoursesCollection, CoursesAdminCollection,
│   │                                  # CourseProgressCollection, LessonProgressCollection
│   ├── hooks.ts                       # useCourses, useCoursesAdmin, useCourseById
│   └── index.ts
│
├── reviews/
│   ├── reviews.collection.ts          # Collection with onInsert/onUpdate/onDelete
│   ├── hooks.ts                       # useReviews, useReviewById
│   └── index.ts
│
├── chat-reports/
│   ├── chat-reports.collection.ts     # Collection with onUpdate (status changes)
│   ├── hooks.ts                       # useChatReports, useChatReportById
│   └── index.ts
│
├── searchable-users/
│   ├── searchable-users.collection.ts # Read-only collection
│   ├── hooks.ts                       # useSearchableUsers
│   └── index.ts
│
├── sync-status/
│   ├── sync-status.collection.ts      # Collection with onUpdate
│   ├── hooks.ts                       # useSyncStatuses, useSyncStatusByCollection
│   └── index.ts
│
├── gdpr-audit-logs/
│   ├── gdpr-audit-logs.collection.ts  # Read-only collection
│   ├── hooks.ts                       # useGdprAuditLogs
│   └── index.ts
│
├── chat-messages/
│   ├── chat-messages.collection.ts    # Factory functions: createChannelMessagesCollection,
│   │                                  # createDMMessagesCollection, createThreadMessagesCollection
│   └── index.ts
│
├── purchases/
│   ├── purchases.collection.ts        # Read-only collection (payment + invoice data)
│   └── index.ts                       # usePurchases, usePurchaseById, useRefundedPurchases, useActivePurchases
│
└── notifications/
    ├── hooks.ts                       # useUnreadUserNotifications, useReadUserNotifications (React Query, no collection)
    └── index.ts
```

**Note:** The `notifications/` directory uses React Query with polling (30s
interval) rather than a React-DB collection, since notifications are user-scoped
and do not need full offline-first treatment.

**Legacy file:** `apps/web/src/lib/db.collections.ts` still exists with some
duplicate definitions being migrated into the modular structure above.

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

**Currently configured sync configs (8 total):**

| Config                      | Stream Key Prefix       | Max Length |
| --------------------------- | ----------------------- | ---------- |
| `announcementsSyncConfig`   | `sync:announcements`    | 10000      |
| `notificationsSyncConfig`   | `sync:notifications`    | 50000      |
| `supportTicketsSyncConfig`  | `sync:support-tickets`  | 10000      |
| `couponsSyncConfig`         | `sync:coupons`          | 5000       |
| `reviewsSyncConfig`         | `sync:reviews`          | 10000      |
| `coursesSyncConfig`         | `sync:courses`          | 5000       |
| `chatReportsSyncConfig`     | `sync:chat-reports`     | 5000       |
| `searchableUsersSyncConfig` | `sync:searchable-users` | 10000      |

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

Sync hooks are in `src/hooks/useSseSync.ts`.

**Currently implemented sync hooks (7 total):**

| Hook                           | Collection      | Notes               |
| ------------------------------ | --------------- | ------------------- |
| `useSupportTicketsSync()`      | Support Tickets |                     |
| `useCouponsSync()`             | Coupons         |                     |
| `useReviewsSync()`             | Reviews         |                     |
| `useAnnouncementsSync()`       | Announcements   | Offline + real-time |
| `useCoursesSync()`             | Courses         |                     |
| `useChatReportsSync()`         | Chat Reports    |                     |
| `useNotificationsSync(userId)` | Notifications   | User-scoped         |

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

The following endpoints have been audited for authentication:

| Router           | Endpoint               | Status   | Notes                                     |
| ---------------- | ---------------------- | -------- | ----------------------------------------- |
| `announcements`  | `getPublished`         | ⚠️       | Review if should be public                |
| `announcements`  | `getById`              | ✅       | OK for public announcements               |
| `announcements`  | `getUnreadForUser`     | ✅ FIXED | Auth + userId ownership check added       |
| `announcements`  | `getReadForUser`       | ✅ FIXED | Auth + userId ownership check added       |
| `announcements`  | `markAsRead`           | ✅ FIXED | Auth + userId ownership check added       |
| `courses`        | `getAll`               | ✅       | OK - public course listing                |
| `courses`        | `getBySlug`            | ✅       | OK - public course detail                 |
| `courses`        | `getCourseLessons`     | ⚠️       | Check enrollment for non-preview          |
| `courses`        | `getLessonById`        | ⚠️       | Check enrollment for non-preview          |
| `courses`        | `subscribeToUpdates`   | ✅       | OK - public SSE                           |
| `courses`        | `getUpdatesSince`      | ✅       | OK - public sync                          |
| `supportTickets` | `getAll`               | ✅ FIXED | Auth added; admins see all, users see own |
| `supportTickets` | `getSupportTicketById` | ✅ FIXED | Auth + ownership check added              |
| `stats`          | `getStats`             | ⚠️       | Review if aggregate data is OK public     |
| `coupons`        | `redeemCouponByCode`   | 🔴       | Still public — should require auth        |

### Authorization Concerns

| Router           | Endpoint           | Status   | Notes                                  |
| ---------------- | ------------------ | -------- | -------------------------------------- |
| `notifications`  | `getUnreadForUser` | ✅ FIXED | Auth + userId === ctx.user.id verified |
| `notifications`  | `getReadForUser`   | ✅ FIXED | Auth + userId === ctx.user.id verified |
| `notifications`  | `markAsRead`       | ✅ FIXED | Auth + userId ownership check added    |
| `notifications`  | `markAllAsRead`    | ✅ FIXED | Auth + userId ownership check added    |
| `notifications`  | `delete`           | ✅ FIXED | Auth + userId ownership check added    |
| `directMessages` | `getDMRequest`     | ✅ FIXED | Auth + participant/admin check added   |

---

## Migration Checklist

### Phase 1: Security Fixes (Immediate)

- [x] Fix `supportTickets` - add auth and ownership checks
- [x] Fix `announcements` user-scoped endpoints - add auth
- [x] Fix `notifications` authorization - verify userId matches ctx.user.id
- [x] Fix `directMessages` authorization
- [ ] Fix `coupons.redeemCouponByCode` - add auth

### Phase 2: Collection Refactoring

- [x] Create `collections/` directory structure
- [x] Move `SupportTicketsCollection` to `collections/support-tickets/`
- [x] Move `CouponsCollection` to `collections/coupons/`
- [x] Move all other collections to modular directories
- [x] Create `PurchasesCollection` in `collections/purchases/`
- [x] Create `CourseProgressCollection` / `LessonProgressCollection`
- [ ] Remove legacy `apps/web/src/lib/db.collections.ts` after full migration
- [ ] Update remaining imports to use `~/lib/collections`

### Phase 3: New Collections

- [ ] Create `EnrollmentsCollection`
- [ ] Migrate `NotificationsCollection` from React Query hooks to React-DB
      collection
- [ ] Create `DMRequestsCollection` / `DMConversationsCollection`
- [ ] Create remaining collections as needed

### Phase 4: SSE Implementation

- [ ] Add SSE to `CourseProgressCollection` / `LessonProgressCollection`
- [ ] Add SSE to `PurchasesCollection`
- [ ] Add SSE to `SearchableUsersCollection` sync hook (config exists, no
      frontend hook yet)
- [ ] Create sync hooks for all new collections

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
    queryKey: ["courses"],
    queryFn: () => fetch("/api/courses"),
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

## Key Packages

### Frontend (`apps/web`)

| Package                                   | Version | Purpose                       |
| ----------------------------------------- | ------- | ----------------------------- |
| `@tanstack/react-db`                      | 0.1.69  | Live queries, collections     |
| `@tanstack/query-db-collection`           | 1.0.22  | Bridge React Query ↔ React-DB |
| `@tanstack/react-query`                   | 5.90.20 | Data fetching, polling        |
| `@tanstack/react-router`                  | 1.163.3 | File-based routing            |
| `@tanstack/offline-transactions`          | 1.0.15  | Offline transaction queue     |
| `@tanstack/query-async-storage-persister` | 5.90.22 | Query persistence             |
| `@tanstack/react-form`                    | 1.28.3  | Form management               |
| `@tanstack/react-virtual`                 | 3.13.18 | Virtual scrolling             |

### Backend (`apps/server`)

| Package        | Version | Purpose             |
| -------------- | ------- | ------------------- |
| `fastify`      | 5.7.4   | HTTP server         |
| `@trpc/server` | 11.8.1  | Type-safe API layer |
| `drizzle-orm`  | 0.45.1  | Database ORM        |
| `better-auth`  | 1.4.18  | Authentication      |
| `ioredis`      | 5.9.2   | Redis client (SSE)  |
| `zod`          | 4.3.6   | Schema validation   |
| `pino`         | 10.3.1  | Structured logging  |

---

## tRPC Routers

All 18 routers registered in `apps/server/src/routers/index.ts`:

| Router           | SSE | Auth Level                             |
| ---------------- | --- | -------------------------------------- |
| `announcements`  | ✅  | Mixed (public reads, admin mutations)  |
| `audit`          | -   | Admin only                             |
| `chat`           | ✅  | Protected                              |
| `chatReports`    | ✅  | Protected / Admin                      |
| `coupons`        | ✅  | Admin only (except redeemCouponByCode) |
| `courseWishlist` | -   | Public                                 |
| `courses`        | ✅  | Mixed (public reads, admin mutations)  |
| `dataExport`     | -   | Protected (GDPR)                       |
| `directMessages` | ✅  | Protected (fine-grained auth)          |
| `images`         | -   | Protected                              |
| `mentions`       | -   | Protected                              |
| `notifications`  | ✅  | Protected                              |
| `purchases`      | -   | Admin only                             |
| `reviews`        | ✅  | Mixed (public reads, protected writes) |
| `stats`          | -   | Admin only                             |
| `supportStatus`  | -   | Auth required / Admin mutations        |
| `supportTickets` | ✅  | Protected (users see own, admins all)  |
| `syncStatus`     | -   | Protected                              |
| `users`          | -   | Protected                              |

---

## Last Updated

2026-03-01
