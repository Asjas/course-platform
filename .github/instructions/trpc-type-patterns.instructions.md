---
applyTo: "apps/server/src/routers/**/*.ts, apps/server/src/db/queries/**/*.ts, apps/web/src/lib/db.collections.ts"
description: "tRPC endpoint patterns, type exports, and frontend collection integration"
---

# tRPC Type Patterns and Frontend Integration

This guide establishes consistent patterns for tRPC endpoints, type exports, and frontend TanStack Query collections.

## 1. Database Query Type Exports

All database query functions must have corresponding type exports using the `Awaited<ReturnType<>>` pattern.

### Location
Types are exported from the same file as the query functions:
- `apps/server/src/routers/<feature>/queries.ts`
- `apps/server/src/db/queries/<feature>.ts`

### Pattern
```typescript
// queries.ts
import { db } from "~/db/index.js";

export async function getAllItems(userId: string) {
  return db.query.items.findMany({
    where: (items, { eq }) => eq(items.userId, userId),
    with: { category: true },
  });
}

export async function getItemById(itemId: string) {
  return db.query.items.findFirst({
    where: (items, { eq }) => eq(items.id, itemId),
  });
}

// Type exports - always at the bottom of the file
export type AllItems = Awaited<ReturnType<typeof getAllItems>>;
export type ItemById = Awaited<ReturnType<typeof getItemById>>;
```

### Naming Convention
- Function: `getAllItems`, `getItemById`, `getUnreadNotifications`
- Type: `AllItems`, `ItemById`, `UnreadNotifications` (matches function name without "get" prefix)

---

## 2. tRPC Router Explicit Return Types

All tRPC query endpoints must specify explicit return types using the imported types from queries.

### Pattern
```typescript
// routers/<feature>/index.ts
import { publicProcedure, router } from "~/router.js";
import { isAuthenticated } from "~/routers/middleware.js";
import {
  getAllItems,
  getItemById,
  type AllItems,
  type ItemById,
} from "./queries.js";

export const itemsRouter = router({
  getAll: publicProcedure
    .use(isAuthenticated)
    .query(async ({ ctx }): Promise<AllItems> => {
      return getAllItems(ctx.user.id);
    }),

  getById: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }): Promise<ItemById> => {
      return getItemById(input.itemId);
    }),
});
```

### Key Points
- Import both the function AND the type from queries
- Use `Promise<TypeName>` as the explicit return type annotation
- Place the return type after the arrow function parameters: `async ({ ctx }): Promise<TypeName> =>`
- This ensures proper type inference flows to the frontend tRPC client

---

## 3. Frontend db.collections.ts Integration

The frontend uses TanStack Query with SignalDB for reactive local collections.

### Location
`apps/web/src/lib/db.collections.ts`

### Pattern
```typescript
import { reactiveCollection } from "./db.reactive";
// Import types from server
import type { PublishedAnnouncements } from "@apps/server/src/db/queries/platformAnnouncements.js";

// Derive singular type from array type
export type Announcement = PublishedAnnouncements[number];

// Create reactive collection
export const AnnouncementsCollection = reactiveCollection<Announcement>("id");
```

### Guidelines
1. **Import types from server** - Never manually define interfaces that duplicate server types
2. **Use array element types** - For array returns, use `[number]` to get single item type
3. **Collection naming** - Use PascalCase with "Collection" suffix (e.g., `ReviewsCollection`)
4. **Primary key** - Specify the primary key field (usually `"id"`)

---

## 4. Component Usage

Components should use collections without manual type casting.

### Pattern
```tsx
import { ReviewsCollection } from "~/lib/db.collections";

function ReviewsList() {
  // Collection items are properly typed from server
  const reviews = ReviewsCollection.find().fetch();

  return (
    <ul>
      {reviews.map((review) => (
        // review.title, review.rating, etc. are all typed
        <li key={review.id}>{review.title}</li>
      ))}
    </ul>
  );
}
```

### Anti-patterns to Avoid
```typescript
// ❌ BAD: Manual type casting
const reviews = ReviewsCollection.find().fetch() as Review[];

// ❌ BAD: Manual interface definition duplicating server types
interface Review {
  id: string;
  title: string;
  // ... duplicates server type
}

// ❌ BAD: Missing return type on tRPC endpoint
getAll: publicProcedure.query(async ({ ctx }) => {
  return getAllItems(ctx.user.id);
})

// ✅ GOOD: Explicit return type
getAll: publicProcedure.query(async ({ ctx }): Promise<AllItems> => {
  return getAllItems(ctx.user.id);
})
```

---

## 5. Complete Flow Example

### Step 1: Database Query (Server)
```typescript
// apps/server/src/routers/reviews/queries.ts
export async function getAllReviews() {
  return db.query.reviews.findMany({
    with: { user: true, course: true },
  });
}

export type AllReviews = Awaited<ReturnType<typeof getAllReviews>>;
```

### Step 2: tRPC Router (Server)
```typescript
// apps/server/src/routers/reviews/index.ts
import { getAllReviews, type AllReviews } from "./queries.js";

export const reviewsRouter = router({
  getAllReviews: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<AllReviews> => {
      return getAllReviews();
    }),
});
```

### Step 3: Collection (Frontend)
```typescript
// apps/web/src/lib/db.collections.ts
import type { AllReviews } from "@apps/server/src/routers/reviews/queries.js";

export type Review = AllReviews[number];
export const ReviewsCollection = reactiveCollection<Review>("id");
```

### Step 4: Component (Frontend)
```tsx
// apps/web/src/routes/_authenticated/admin/reviews.tsx
import { ReviewsCollection } from "~/lib/db.collections";

function AdminReviews() {
  const reviews = ReviewsCollection.find().fetch();
  // reviews is properly typed as Review[]
}
```

---

## 6. Checklist for New Endpoints

When creating a new tRPC endpoint:

- [ ] Create query function in `queries.ts` (or `db/queries/<feature>.ts`)
- [ ] Export type using `Awaited<ReturnType<typeof functionName>>`
- [ ] Import both function and type in router file
- [ ] Add explicit `Promise<TypeName>` return type to endpoint
- [ ] Add collection type import to `db.collections.ts` (if needed on frontend)
- [ ] Derive singular type from array type using `[number]`
- [ ] Create reactive collection with primary key
- [ ] Use collection in components without type casting
- [ ] **Preload collection in route loader** (see Section 7)
- [ ] Run `pnpm typecheck` to verify type flow

---

## 7. Collection Preloading in Route Loaders

**CRITICAL**: All routes that use collections MUST preload the collection in their route loader. This ensures data is fetched during navigation, eliminating loading spinners.

### Pattern for Static Collections

For collections that don't require route parameters:

```typescript
// apps/web/src/routes/_authenticated/admin/reviews.tsx
import { ReviewsCollection, useReviews } from "~/lib/db.collections";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  loader: async () => {
    await ReviewsCollection.preload();
  },
  component: AdminReviewsPage,
});

function AdminReviewsPage() {
  // Data is prefetched - no loading spinner needed
  const { data: reviews, isLoading } = useReviews();
  // ...
}
```

### Pattern for Multiple Collections

When a route uses multiple collections, preload them in parallel:

```typescript
export const Route = createFileRoute("/_authenticated/courses/$courseId/lessons/$lessonId")({
  loader: async ({ params }) => {
    await Promise.all([
      CoursesCollection.preload(),
      SupportTicketsCollection.preload(),
    ]);
    // Additional loading logic...
  },
  component: LessonPage,
});
```

### Pattern for Dynamic/Parameterized Collections

For collections created dynamically (e.g., per channel/conversation), use trpcClient directly in the loader since the collection is created per-render:

```typescript
// apps/web/src/routes/_authenticated/chat.$channelId.tsx
import { createChannelMessagesCollection } from "~/lib/db.collections";
import { trpcClient } from "~/lib/trpc.client";

export const Route = createFileRoute("/_authenticated/chat/$channelId")({
  loader: async ({ params }) => {
    // Pre-load messages into tRPC cache
    // The dynamically-created collection will hydrate from this cache
    await trpcClient.chat.getChannelHistory.query({
      channelId: params.channelId,
    });
  },
  component: ChatChannelPage,
});

function ChatChannelPage() {
  const { channelId } = useParams({ from: "/_authenticated/chat/$channelId" });

  // Create channel-specific collection - recreates when channelId changes
  const channelCollection = useMemo(
    () => createChannelMessagesCollection(channelId),
    [channelId],
  );

  const { data: messages } = useLiveQuery(channelCollection);
  // ...
}
```

### Anti-patterns to Avoid

```typescript
// ❌ BAD: No preloading - causes loading spinner on every navigation
export const Route = createFileRoute("/_authenticated/admin/audit")({
  component: AdminAuditPage,
});

function AdminAuditPage() {
  const { data, isLoading } = useGdprAuditLogs();
  if (isLoading) return <Loading />; // User sees spinner every time
}

// ❌ BAD: Using trpcClient directly instead of Collection.preload()
export const Route = createFileRoute("/_authenticated/admin/reviews")({
  loader: async () => {
    await trpcClient.reviews.getAllReviews.query();
  },
});

// ✅ GOOD: Use Collection.preload() for static collections
export const Route = createFileRoute("/_authenticated/admin/reviews")({
  loader: async () => {
    await ReviewsCollection.preload();
  },
});
```

### Checklist for Routes Using Collections

- [ ] Route has a `loader` function
- [ ] All static collections used in component are preloaded via `Collection.preload()`
- [ ] Multiple collections are preloaded in parallel with `Promise.all()`
- [ ] Dynamic collections use `trpcClient` directly in loader
- [ ] Component handles `isLoading` gracefully (but it should rarely be true due to preloading)

---

## 8. SSE Sync Infrastructure

The platform uses Server-Sent Events (SSE) via Redis Streams for real-time synchronization between backend and frontend. This enables:
- Real-time updates when entities are created/updated/deleted
- Offline sync for devices that have been disconnected for days/weeks
- Automatic reconnection with proper event ordering

### Server-Side SSE Infrastructure

Location: `apps/server/src/lib/sse-sync.ts`

#### Entity Sync Update Type

```typescript
// Standardized payload for all entity updates
interface EntitySyncUpdate<T> {
  id: string;                    // Unique ID for deduplication
  type: "created" | "updated" | "deleted";
  data: T | null;               // Entity data (null for deletions)
  entityId: string;             // Entity ID for deletions
  timestamp: number;            // When the change occurred
  actorId?: string;             // User who made the change
}
```

#### Pre-configured Sync Configs

Each entity type has a sync config in `sse-sync.ts`:

```typescript
export const announcementsSyncConfig: EntitySyncConfig = {
  streamKeyPrefix: "sync:announcements",
  maxStreamLength: 10000,
};

export const notificationsSyncConfig: EntitySyncConfig = {
  streamKeyPrefix: "sync:notifications",
  maxStreamLength: 50000, // Higher for per-user streams
};

// ... supportTicketsSyncConfig, couponsSyncConfig, reviewsSyncConfig,
//     coursesSyncConfig, chatReportsSyncConfig
```

### Adding SSE to a New Entity Type

#### Step 1: Add Sync Config

```typescript
// In apps/server/src/lib/sse-sync.ts
export const widgetsSyncConfig: EntitySyncConfig = {
  streamKeyPrefix: "sync:widgets",
  maxStreamLength: 10000,
};
```

#### Step 2: Import Utilities in Router

```typescript
// In apps/server/src/routers/widgets/index.ts
import {
  type EntitySyncUpdate,
  widgetsSyncConfig,
  createSyncUpdate,
  getEntityUpdatesSince,
  publishEntityChange,
  streamEntityUpdates,
} from "~/lib/sse-sync.js";
import type { Widget } from "~/db/schema/widgets.js";

export type WidgetSyncUpdate = EntitySyncUpdate<Widget>;
```

#### Step 3: Publish Changes in Mutations

```typescript
// In createWidget mutation, after the insert:
await publishEntityChange(
  widgetsSyncConfig,
  createSyncUpdate("created", widget.id, widget, ctx.user.id),
);

// In updateWidget mutation:
await publishEntityChange(
  widgetsSyncConfig,
  createSyncUpdate("updated", widget.id, widget, ctx.user.id),
);

// In deleteWidget mutation:
await publishEntityChange(
  widgetsSyncConfig,
  createSyncUpdate("deleted", widget.id, null, ctx.user.id),
);
```

#### Step 4: Add Subscription Endpoint

```typescript
// In the router:
subscribeToUpdates: publicProcedure
  .input(
    z.object({
      lastEventId: z.string().nullish(),
    }),
  )
  .use(isAuthenticated)
  .subscription(async function* ({ input }) {
    yield* streamEntityUpdates<Widget>(
      widgetsSyncConfig,
      input.lastEventId,
    );
  }),
```

#### Step 5: Add Offline Sync Query

```typescript
getUpdatesSince: publicProcedure
  .input(
    z.object({
      since: z.number(), // Timestamp in ms
    }),
  )
  .use(isAuthenticated)
  .query(async ({ input }) => {
    try {
      const updates = await getEntityUpdatesSince<Widget>(
        widgetsSyncConfig,
        input.since,
      );
      return updates;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch widget updates",
      });
    }
  }),
```

### User-Scoped SSE Streams

For entities that are user-specific (like notifications), use a scoped stream:

```typescript
// In subscription endpoint:
subscribeToUpdates: publicProcedure
  .input(
    z.object({
      userId: z.string(),
      lastEventId: z.string().nullish(),
    }),
  )
  .use(isAuthenticated)
  .subscription(async function* ({ input, ctx }) {
    // Security check
    if (ctx.user.id !== input.userId && ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Cannot subscribe to other users' data",
      });
    }

    yield* streamEntityUpdates<Notification>(
      notificationsSyncConfig,
      input.lastEventId,
      input.userId, // User-scoped stream
    );
  }),
```

### Frontend SSE Sync Hooks

Location: `apps/web/src/hooks/useSseSync.ts`

#### Using Pre-built Sync Hooks

```typescript
import { useSupportTicketsSync, useCoursesSync } from "~/hooks/useSseSync";

function SupportDashboard() {
  // Subscribes to real-time updates and syncs offline changes
  const syncStatus = useSupportTicketsSync();

  return (
    <div>
      {syncStatus.isConnected ? "Connected" : "Offline"}
      {syncStatus.isSyncing && "Syncing..."}
    </div>
  );
}
```

#### Available Sync Hooks

```typescript
// Generic collections
useSupportTicketsSync()   // Support ticket updates
useCouponsSync()          // Coupon updates (admin)
useReviewsSync()          // Review updates
useAnnouncementsSync()    // Announcement updates
useCoursesSync()          // Course updates
useChatReportsSync()      // Chat report updates (admin)

// User-scoped
useNotificationsSync(userId)  // User's notifications
```

### Sync Status UI Component

Location: `apps/web/src/components/SyncStatusIndicator.tsx`

```tsx
import { SyncStatusIndicator } from "~/components/SyncStatusIndicator";
import { useSupportTicketsSync, useCoursesSync } from "~/hooks/useSseSync";

function Header() {
  const ticketsSync = useSupportTicketsSync();
  const coursesSync = useCoursesSync();

  return (
    <header>
      <SyncStatusIndicator
        collections={[
          { ...ticketsSync, name: "support-tickets", displayName: "Support Tickets" },
          { ...coursesSync, name: "courses", displayName: "Courses" },
        ]}
      />
    </header>
  );
}
```

### Offline Sync Pattern

The sync system handles offline reconnection automatically:

1. **On connect**: Fetches updates since last sync timestamp via `getUpdatesSince`
2. **Real-time**: Receives updates via SSE subscription
3. **On disconnect**: Stores last event ID for reconnection
4. **On reconnect**: Continues from last event ID, syncs any missed updates

```typescript
// Timestamps stored in localStorage
const SYNC_STORAGE_KEY_PREFIX = "sync:lastTimestamp:";

// syncUtils available from db.collections.ts
import { syncUtils } from "~/lib/db.collections";

// Get last sync time
const lastSync = syncUtils.getLastSyncTimestamp("support-tickets");

// Sync offline updates
const count = await syncUtils.syncOfflineUpdates(
  "support-tickets",
  SupportTicketsCollection,
  (since) => trpcClient.supportTickets.getUpdatesSince.query({ since }),
);
```

### SSE Checklist for New Entities

- [ ] Add sync config to `sse-sync.ts`
- [ ] Export `EntitySyncUpdate<T>` type alias in router
- [ ] Import sync utilities in router file
- [ ] Add `publishEntityChange` calls to all mutations
- [ ] Add `subscribeToUpdates` subscription endpoint
- [ ] Add `getUpdatesSince` query for offline sync
- [ ] Create frontend sync hook in `useSseSync.ts`
- [ ] Test real-time updates with multiple browser tabs
- [ ] Test offline sync by disconnecting and reconnecting
