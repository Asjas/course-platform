/**
 * SSE Sync Hooks
 *
 * This module provides React hooks for subscribing to real-time SSE updates
 * from the server. These hooks use TanStack Query for data fetching and
 * invalidation instead of directly updating collections.
 *
 * Usage:
 * ```tsx
 * // In a component or route
 * const status = useSupportTicketsSync(); // Subscribes to support ticket updates
 * const status = useAnnouncementsSync(); // Subscribes to announcement updates
 * ```
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { type EntitySyncUpdate, syncUtils } from "~/lib/db.collections";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

/**
 * Sync status for a collection
 */
export interface SyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  pendingUpdates: number;
  error: Error | null;
}

/**
 * Internal helper to get last sync timestamp
 */
function getLastSync(collectionName: string): number {
  return syncUtils.getLastSyncTimestamp(collectionName) || 0;
}

/**
 * Hook to subscribe to support ticket updates via SSE.
 * Call this in a component that displays support tickets.
 */
export function useSupportTicketsSync(): SyncStatus {
  const collectionName = "support-tickets";
  const [status, setStatus] = useState<SyncStatus>({
    isConnected: false,
    isSyncing: false,
    lastSyncedAt: getLastSync(collectionName) || null,
    pendingUpdates: 0,
    error: null,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastEventIdRef = useRef<string | null>(null);

  const connect = useCallback(async () => {
    // Clean up existing subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      // First, sync any offline updates
      const lastSync = getLastSync(collectionName);
      if (lastSync > 0) {
        setStatus((prev) => ({ ...prev, isSyncing: true }));
        try {
          const updates = await trpcClient.supportTickets.getUpdatesSince.query(
            { since: lastSync },
          );
          if (updates.length > 0) {
            await queryClient.invalidateQueries({
              queryKey: trpc.supportTickets.getAll.queryKey(),
            });
            toast.info(`Synced ${updates.length} support ticket updates`);
          }
        } catch {
          // Ignore sync errors, continue with subscription
        }
        setStatus((prev) => ({ ...prev, isSyncing: false }));
      }

      setStatus((prev) => ({ ...prev, isConnected: true, error: null }));

      // Subscribe to real-time updates
      const { unsubscribe } =
        trpcClient.supportTickets.subscribeToUpdates.subscribe(
          { lastEventId: lastEventIdRef.current },
          {
            onData(event) {
              lastEventIdRef.current = event.id;
              const data = event.data as EntitySyncUpdate<unknown>;

              // Invalidate queries to refetch
              void queryClient.invalidateQueries({
                queryKey: trpc.supportTickets.getAll.queryKey(),
              });

              syncUtils.setLastSyncTimestamp(collectionName, data.timestamp);
              setStatus((prev) => ({
                ...prev,
                lastSyncedAt: data.timestamp,
              }));
            },
            onError(err) {
              setStatus((prev) => ({
                ...prev,
                isConnected: false,
                error: err instanceof Error ? err : new Error("Unknown error"),
              }));

              // Schedule reconnection
              if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
              }
              reconnectTimeoutRef.current = setTimeout(() => {
                void connect();
              }, 5000);
            },
            onComplete() {
              setStatus((prev) => ({
                ...prev,
                isConnected: false,
              }));
            },
          },
        );

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error : new Error("Connection failed"),
      }));

      // Schedule reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        void connect();
      }, 5000);
    }
  }, []);

  useEffect(() => {
    void connect();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return status;
}

/**
 * Hook to subscribe to coupon updates via SSE.
 * Admin-only: Call this in admin components that manage coupons.
 */
export function useCouponsSync(): SyncStatus {
  const collectionName = "coupons";
  const [status, setStatus] = useState<SyncStatus>({
    isConnected: false,
    isSyncing: false,
    lastSyncedAt: getLastSync(collectionName) || null,
    pendingUpdates: 0,
    error: null,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastEventIdRef = useRef<string | null>(null);

  const connect = useCallback(async () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      const lastSync = getLastSync(collectionName);
      if (lastSync > 0) {
        setStatus((prev) => ({ ...prev, isSyncing: true }));
        try {
          const updates = await trpcClient.coupons.getUpdatesSince.query({
            since: lastSync,
          });
          if (updates.length > 0) {
            await queryClient.invalidateQueries({
              queryKey: trpc.coupons.getAll.queryKey(),
            });
            toast.info(`Synced ${updates.length} coupon updates`);
          }
        } catch {
          // Ignore sync errors
        }
        setStatus((prev) => ({ ...prev, isSyncing: false }));
      }

      setStatus((prev) => ({ ...prev, isConnected: true, error: null }));

      const { unsubscribe } = trpcClient.coupons.subscribeToUpdates.subscribe(
        { lastEventId: lastEventIdRef.current },
        {
          onData(event) {
            lastEventIdRef.current = event.id;
            const data = event.data as EntitySyncUpdate<unknown>;

            void queryClient.invalidateQueries({
              queryKey: trpc.coupons.getAll.queryKey(),
            });

            syncUtils.setLastSyncTimestamp(collectionName, data.timestamp);
            setStatus((prev) => ({
              ...prev,
              lastSyncedAt: data.timestamp,
            }));
          },
          onError(err) {
            setStatus((prev) => ({
              ...prev,
              isConnected: false,
              error: err instanceof Error ? err : new Error("Unknown error"),
            }));

            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
              void connect();
            }, 5000);
          },
          onComplete() {
            setStatus((prev) => ({
              ...prev,
              isConnected: false,
            }));
          },
        },
      );

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error : new Error("Connection failed"),
      }));

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        void connect();
      }, 5000);
    }
  }, []);

  useEffect(() => {
    void connect();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return status;
}

/**
 * Hook to subscribe to review updates via SSE.
 * Call this in components that display reviews.
 */
export function useReviewsSync(): SyncStatus {
  const collectionName = "reviews";
  const [status, setStatus] = useState<SyncStatus>({
    isConnected: false,
    isSyncing: false,
    lastSyncedAt: getLastSync(collectionName) || null,
    pendingUpdates: 0,
    error: null,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastEventIdRef = useRef<string | null>(null);

  const connect = useCallback(async () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      const lastSync = getLastSync(collectionName);
      if (lastSync > 0) {
        setStatus((prev) => ({ ...prev, isSyncing: true }));
        try {
          const updates = await trpcClient.reviews.getUpdatesSince.query({
            since: lastSync,
          });
          if (updates.length > 0) {
            await queryClient.invalidateQueries({
              queryKey: trpc.reviews.getAll.queryKey(),
            });
            toast.info(`Synced ${updates.length} review updates`);
          }
        } catch {
          // Ignore sync errors
        }
        setStatus((prev) => ({ ...prev, isSyncing: false }));
      }

      setStatus((prev) => ({ ...prev, isConnected: true, error: null }));

      const { unsubscribe } = trpcClient.reviews.subscribeToUpdates.subscribe(
        { lastEventId: lastEventIdRef.current },
        {
          onData(event) {
            lastEventIdRef.current = event.id;
            const data = event.data as EntitySyncUpdate<unknown>;

            void queryClient.invalidateQueries({
              queryKey: trpc.reviews.getAll.queryKey(),
            });

            syncUtils.setLastSyncTimestamp(collectionName, data.timestamp);
            setStatus((prev) => ({
              ...prev,
              lastSyncedAt: data.timestamp,
            }));
          },
          onError(err) {
            setStatus((prev) => ({
              ...prev,
              isConnected: false,
              error: err instanceof Error ? err : new Error("Unknown error"),
            }));

            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
              void connect();
            }, 5000);
          },
          onComplete() {
            setStatus((prev) => ({
              ...prev,
              isConnected: false,
            }));
          },
        },
      );

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error : new Error("Connection failed"),
      }));

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        void connect();
      }, 5000);
    }
  }, []);

  useEffect(() => {
    void connect();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return status;
}

/**
 * Hook to subscribe to announcement updates via SSE.
 * Call this in components that display announcements.
 */
export function useAnnouncementsSync(): SyncStatus {
  const collectionName = "announcements";
  const [status, setStatus] = useState<SyncStatus>({
    isConnected: false,
    isSyncing: false,
    lastSyncedAt: getLastSync(collectionName) || null,
    pendingUpdates: 0,
    error: null,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastEventIdRef = useRef<string | null>(null);

  const connect = useCallback(async () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      const lastSync = getLastSync(collectionName);
      if (lastSync > 0) {
        setStatus((prev) => ({ ...prev, isSyncing: true }));
        try {
          const updates = await trpcClient.announcements.getUpdatesSince.query({
            since: lastSync,
          });
          if (updates.length > 0) {
            await queryClient.invalidateQueries({
              queryKey: trpc.announcements.getAll.queryKey(),
            });
            toast.info(`Synced ${updates.length} announcement updates`);
          }
        } catch {
          // Ignore sync errors
        }
        setStatus((prev) => ({ ...prev, isSyncing: false }));
      }

      setStatus((prev) => ({ ...prev, isConnected: true, error: null }));

      const { unsubscribe } =
        trpcClient.announcements.subscribeToUpdates.subscribe(
          { lastEventId: lastEventIdRef.current },
          {
            onData(event) {
              lastEventIdRef.current = event.id;
              const data = event.data as EntitySyncUpdate<unknown>;

              void queryClient.invalidateQueries({
                queryKey: trpc.announcements.getAll.queryKey(),
              });

              syncUtils.setLastSyncTimestamp(collectionName, data.timestamp);
              setStatus((prev) => ({
                ...prev,
                lastSyncedAt: data.timestamp,
              }));
            },
            onError(err) {
              setStatus((prev) => ({
                ...prev,
                isConnected: false,
                error: err instanceof Error ? err : new Error("Unknown error"),
              }));

              if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
              }
              reconnectTimeoutRef.current = setTimeout(() => {
                void connect();
              }, 5000);
            },
            onComplete() {
              setStatus((prev) => ({
                ...prev,
                isConnected: false,
              }));
            },
          },
        );

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error : new Error("Connection failed"),
      }));

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        void connect();
      }, 5000);
    }
  }, []);

  useEffect(() => {
    void connect();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return status;
}

/**
 * Hook to subscribe to course updates via SSE.
 * Call this in components that display courses.
 */
export function useCoursesSync(): SyncStatus {
  const collectionName = "courses";
  const [status, setStatus] = useState<SyncStatus>({
    isConnected: false,
    isSyncing: false,
    lastSyncedAt: getLastSync(collectionName) || null,
    pendingUpdates: 0,
    error: null,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastEventIdRef = useRef<string | null>(null);

  const connect = useCallback(async () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      const lastSync = getLastSync(collectionName);
      if (lastSync > 0) {
        setStatus((prev) => ({ ...prev, isSyncing: true }));
        try {
          const updates = await trpcClient.courses.getUpdatesSince.query({
            since: lastSync,
          });
          if (updates.length > 0) {
            await queryClient.invalidateQueries({
              queryKey: trpc.courses.getAll.queryKey(),
            });
            toast.info(`Synced ${updates.length} course updates`);
          }
        } catch {
          // Ignore sync errors
        }
        setStatus((prev) => ({ ...prev, isSyncing: false }));
      }

      setStatus((prev) => ({ ...prev, isConnected: true, error: null }));

      const { unsubscribe } = trpcClient.courses.subscribeToUpdates.subscribe(
        { lastEventId: lastEventIdRef.current },
        {
          onData(event) {
            lastEventIdRef.current = event.id;
            const data = event.data as EntitySyncUpdate<unknown>;

            void queryClient.invalidateQueries({
              queryKey: trpc.courses.getAll.queryKey(),
            });

            syncUtils.setLastSyncTimestamp(collectionName, data.timestamp);
            setStatus((prev) => ({
              ...prev,
              lastSyncedAt: data.timestamp,
            }));
          },
          onError(err) {
            setStatus((prev) => ({
              ...prev,
              isConnected: false,
              error: err instanceof Error ? err : new Error("Unknown error"),
            }));

            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
              void connect();
            }, 5000);
          },
          onComplete() {
            setStatus((prev) => ({
              ...prev,
              isConnected: false,
            }));
          },
        },
      );

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error : new Error("Connection failed"),
      }));

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        void connect();
      }, 5000);
    }
  }, []);

  useEffect(() => {
    void connect();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return status;
}

/**
 * Hook to subscribe to chat report updates via SSE.
 * Admin-only: Call this in admin components that manage chat reports.
 */
export function useChatReportsSync(): SyncStatus {
  const collectionName = "chat-reports";
  const [status, setStatus] = useState<SyncStatus>({
    isConnected: false,
    isSyncing: false,
    lastSyncedAt: getLastSync(collectionName) || null,
    pendingUpdates: 0,
    error: null,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastEventIdRef = useRef<string | null>(null);

  const connect = useCallback(async () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      const lastSync = getLastSync(collectionName);
      if (lastSync > 0) {
        setStatus((prev) => ({ ...prev, isSyncing: true }));
        try {
          const updates = await trpcClient.chatReports.getUpdatesSince.query({
            since: lastSync,
          });
          if (updates.length > 0) {
            await queryClient.invalidateQueries({
              queryKey: trpc.chatReports.getAll.queryKey(),
            });
            toast.info(`Synced ${updates.length} chat report updates`);
          }
        } catch {
          // Ignore sync errors
        }
        setStatus((prev) => ({ ...prev, isSyncing: false }));
      }

      setStatus((prev) => ({ ...prev, isConnected: true, error: null }));

      const { unsubscribe } =
        trpcClient.chatReports.subscribeToUpdates.subscribe(
          { lastEventId: lastEventIdRef.current },
          {
            onData(event) {
              lastEventIdRef.current = event.id;
              const data = event.data as EntitySyncUpdate<unknown>;

              void queryClient.invalidateQueries({
                queryKey: trpc.chatReports.getAll.queryKey(),
              });

              syncUtils.setLastSyncTimestamp(collectionName, data.timestamp);
              setStatus((prev) => ({
                ...prev,
                lastSyncedAt: data.timestamp,
              }));
            },
            onError(err) {
              setStatus((prev) => ({
                ...prev,
                isConnected: false,
                error: err instanceof Error ? err : new Error("Unknown error"),
              }));

              if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
              }
              reconnectTimeoutRef.current = setTimeout(() => {
                void connect();
              }, 5000);
            },
            onComplete() {
              setStatus((prev) => ({
                ...prev,
                isConnected: false,
              }));
            },
          },
        );

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error : new Error("Connection failed"),
      }));

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        void connect();
      }, 5000);
    }
  }, []);

  useEffect(() => {
    void connect();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return status;
}

/**
 * Hook to subscribe to notification updates via SSE.
 * User-scoped: Receives only notifications for the current user.
 */
export function useNotificationsSync(userId: string): SyncStatus {
  const collectionName = `notifications:${userId}`;
  const [status, setStatus] = useState<SyncStatus>({
    isConnected: false,
    isSyncing: false,
    lastSyncedAt: getLastSync(collectionName) || null,
    pendingUpdates: 0,
    error: null,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lastEventIdRef = useRef<string | null>(null);

  const connect = useCallback(async () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      const lastSync = getLastSync(collectionName);
      if (lastSync > 0) {
        setStatus((prev) => ({ ...prev, isSyncing: true }));
        try {
          const updates = await trpcClient.notifications.getUpdatesSince.query({
            userId,
            since: lastSync,
          });
          if (updates.length > 0) {
            await queryClient.invalidateQueries({
              queryKey: trpc.notifications.getUnreadForUser.queryKey(userId),
            });
            await queryClient.invalidateQueries({
              queryKey: trpc.notifications.getReadForUser.queryKey(userId),
            });
            toast.info(`${updates.length} new notifications`);
          }
        } catch {
          // Ignore sync errors
        }
        setStatus((prev) => ({ ...prev, isSyncing: false }));
      }

      setStatus((prev) => ({ ...prev, isConnected: true, error: null }));

      const { unsubscribe } =
        trpcClient.notifications.subscribeToUpdates.subscribe(
          { userId, lastEventId: lastEventIdRef.current },
          {
            onData(event) {
              lastEventIdRef.current = event.id;
              const data = event.data as EntitySyncUpdate<{
                title?: string;
              }>;

              void queryClient.invalidateQueries({
                queryKey: trpc.notifications.getUnreadForUser.queryKey(userId),
              });

              syncUtils.setLastSyncTimestamp(collectionName, data.timestamp);
              setStatus((prev) => ({
                ...prev,
                lastSyncedAt: data.timestamp,
              }));

              // Show toast for new notifications
              if (data.type === "created" && data.data?.title) {
                toast.info(data.data.title);
              }
            },
            onError(err) {
              setStatus((prev) => ({
                ...prev,
                isConnected: false,
                error: err instanceof Error ? err : new Error("Unknown error"),
              }));

              if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
              }
              reconnectTimeoutRef.current = setTimeout(() => {
                void connect();
              }, 5000);
            },
            onComplete() {
              setStatus((prev) => ({
                ...prev,
                isConnected: false,
              }));
            },
          },
        );

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        error: error instanceof Error ? error : new Error("Connection failed"),
      }));

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        void connect();
      }, 5000);
    }
  }, [collectionName, userId]);

  useEffect(() => {
    if (userId) {
      void connect();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect, userId]);

  return status;
}
