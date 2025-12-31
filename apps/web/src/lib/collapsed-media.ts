/**
 * Utility functions for persisting collapsed media state in chat messages.
 *
 * This module provides functionality to remember which media elements
 * (images, videos, GIFs) in chat messages have been collapsed by the user.
 * The collapsed state persists across page refreshes using localStorage.
 */

const COLLAPSED_MEDIA_STORAGE_KEY = "collapsed-media";

/**
 * Get the set of collapsed message IDs from localStorage.
 */
function getCollapsedMessageIds(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const stored = localStorage.getItem(COLLAPSED_MEDIA_STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (
        Array.isArray(parsed) &&
        parsed.every((id) => typeof id === "string")
      ) {
        return new Set(parsed as string[]);
      }
    }
  } catch {
    // If parsing fails, return empty set
  }

  return new Set();
}

/**
 * Save the set of collapsed message IDs to localStorage.
 */
function saveCollapsedMessageIds(ids: Set<string>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(COLLAPSED_MEDIA_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

/**
 * Check if media for a specific message is collapsed.
 */
export function isMediaCollapsed(messageId: string): boolean {
  return getCollapsedMessageIds().has(messageId);
}

/**
 * Set the collapsed state for a specific message's media.
 */
export function setMediaCollapsed(messageId: string, collapsed: boolean): void {
  const ids = getCollapsedMessageIds();

  if (collapsed) {
    ids.add(messageId);
  } else {
    ids.delete(messageId);
  }

  saveCollapsedMessageIds(ids);
}

/**
 * Toggle the collapsed state for a specific message's media.
 * Returns the new collapsed state.
 */
export function toggleMediaCollapsed(messageId: string): boolean {
  const isCollapsed = isMediaCollapsed(messageId);
  setMediaCollapsed(messageId, !isCollapsed);
  return !isCollapsed;
}
