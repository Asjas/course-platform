---
applyTo: "**"
description: "General coding guidelines for the course website project, including project overview and high-level practices"
---

# Project Overview

This project is a course website that allows users to purchase courses, view the course videos using a video player, ask for help using a support help-desk system and use a chat system for real-time communication

## Folder Structure

- /apps/web/: Contains the source code for the frontend
- /apps/server/: Contains the source code for the backend
- /apps/web/src/tauri: Contains the source code for the native apps

## Libraries and Frameworks

- Major libraries used in the frontend: React.js, Better Auth, TanStack Router, TanStack Query, TanStack DB, TanStack Form and TypeScript
- Major libraries used in the backend: Fastify, Better Auth, Drizzle ORM, and TypeScript
- The project uses Node.js and pnpm as the package manager
- Key files: vite.config.ts, tailwind.css, tsconfig.json, auth.server.ts, auth.client.ts, package.json, .prettierrc

## Coding Guidelines

- Use a consistent project structure for components, hooks, services, types, utilities, and styling.
- Enable strict type-checking in tsconfig.json.
- For TypeScript and React specifics, see `typescript-react.instructions.md`.
- For Node.js and Fastify specifics, see `typescript-node.instructions.md`.
- Optimize images, use Tailwind CSS and lucide-react icons.
- Use SEO, PWA, and mdx plugins as configured.
- Use semicolons at the end of each statement.
- Use try/catch blocks for async operations.
- Always log errors with contextual information.

## UI Guidelines

- Application should have a modern and clean design.

## TypeScript Types
Always reuse existing types. Before creating a new type:
- Serach for existing types that match your needs
- Only create a new type if no suitable type exists
- Never duplicate or recreate types that already exists
