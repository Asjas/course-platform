/**
 * Markdown Editor Components
 *
 * This folder contains components for markdown-based text editing:
 * - GitHubMessageEditor: Full-featured markdown editor with preview (for support tickets, DMs)
 *
 * The editor is organized into:
 * - types.ts: Shared TypeScript interfaces
 * - formatting/: Text formatting utilities and handlers
 * - hooks/: Custom hooks for preview, mentions, file upload
 * - components/: UI sub-components (toolbar, tabs, footer)
 */

export { default as GitHubMessageEditor } from "./github-message-editor";
