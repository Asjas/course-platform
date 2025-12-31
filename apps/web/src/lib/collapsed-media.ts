/**
 * Utility functions for persisting collapsed media state in chat messages.
 *
 * This module provides functionality to remember which media elements
 * (images, videos, GIFs) in chat messages have been collapsed by the user.
 * The collapsed state persists across page refreshes using localStorage.
 *
 * Note: WeakMap was considered but is not suitable here because:
 * 1. Message IDs are strings (primitives), and WeakMap requires object keys
 * 2. WeakMap doesn't persist - state would be lost on page refresh
 *
 * Instead, we use localStorage with an LRU-style limit to prevent unbounded growth.
 */

const COLLAPSED_MEDIA_STORAGE_KEY = "collapsed-media";

/**
 * Maximum number of collapsed message IDs to store.
 * This prevents localStorage from growing unbounded over time.
 * When the limit is exceeded, the oldest entries are removed.
 */
const MAX_COLLAPSED_IDS = 500;

/**
 * Get the array of collapsed message IDs from localStorage.
 * Returns an array to preserve insertion order for LRU eviction.
 */
export function getCollapsedMessageIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(COLLAPSED_MEDIA_STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (
        Array.isArray(parsed) &&
        parsed.every((id) => typeof id === "string")
      ) {
        return parsed as string[];
      }
    }
  } catch {
    // If parsing fails, return empty array
  }

  return [];
}

/**
 * Save the array of collapsed message IDs to localStorage.
 * Enforces the maximum limit by removing oldest entries first.
 */
function saveCollapsedMessageIds(ids: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  // Enforce maximum limit - keep most recent entries
  const trimmedIds =
    ids.length > MAX_COLLAPSED_IDS ? ids.slice(-MAX_COLLAPSED_IDS) : ids;

  try {
    localStorage.setItem(
      COLLAPSED_MEDIA_STORAGE_KEY,
      JSON.stringify(trimmedIds),
    );
  } catch {
    // If quota exceeded, try clearing old entries and saving again
    try {
      const reducedIds = trimmedIds.slice(-Math.floor(MAX_COLLAPSED_IDS / 2));
      localStorage.setItem(
        COLLAPSED_MEDIA_STORAGE_KEY,
        JSON.stringify(reducedIds),
      );
    } catch {
      // If still failing, clear all collapsed state
      try {
        localStorage.removeItem(COLLAPSED_MEDIA_STORAGE_KEY);
      } catch {
        // Ignore if removal also fails
      }
    }
  }
}

/**
 * Check if media for a specific message is collapsed.
 */
export function isMediaCollapsed(messageId: string): boolean {
  return getCollapsedMessageIds().includes(messageId);
}

/**
 * Set the collapsed state for a specific message's media.
 * When collapsing, the message ID is added to the end of the list (most recent).
 * When expanding, the message ID is removed from the list.
 */
export function setMediaCollapsed(messageId: string, collapsed: boolean): void {
  const ids = getCollapsedMessageIds();

  // Remove existing entry if present (to update position for LRU)
  const filteredIds = ids.filter((id) => id !== messageId);

  if (collapsed) {
    // Add to end (most recent)
    filteredIds.push(messageId);
  }

  saveCollapsedMessageIds(filteredIds);
}

/**
 * Clear all collapsed media state from localStorage.
 * Useful for testing or user-initiated reset.
 */
export function clearCollapsedMedia(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(COLLAPSED_MEDIA_STORAGE_KEY);
  } catch {
    // Ignore removal errors
  }
}
