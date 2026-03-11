# Package Catalog

> Comprehensive inventory of all dependencies across the monorepo, with
> homepage links, `node_modules` filesystem paths, installed versions, and
> established usage patterns. Use this as the single source of truth when
> selecting APIs, checking versions, or onboarding to a new workspace.

## AI Agent Scanning Guide

When exploring packages for code generation or review, follow this procedure:

1. **Locate the package** in the workspace-specific `node_modules/`:
   - `apps/web/node_modules/<pkg>/` for frontend dependencies.
   - `apps/server/node_modules/<pkg>/` for backend dependencies.
   - `packages/shared-ui/node_modules/<pkg>/` for shared-ui overrides (rare;
     most are hoisted to `apps/web/`).
   - `marketing/learn-fastify/node_modules/<pkg>/` for marketing dependencies.
2. **Read the entry types** to confirm available exports:
   - Check `package.json` `"types"` or `"typings"` field for the `.d.ts` entry.
   - For scoped packages (`@tanstack/*`), read
     `node_modules/@tanstack/<name>/dist/esm/index.d.ts` or the path in
     `"exports"`.
3. **Cross-reference with existing usage** in the codebase:
   - Server patterns: `apps/server/src/` (Fastify plugins, Drizzle schemas,
     tRPC routers).
   - Web patterns: `apps/web/src/` (TanStack Router routes, collections,
     components).
   - Shared UI: `packages/shared-ui/components/` (Radix primitives, CVA
     variants).
4. **Prefer established patterns** over documentation examples. The patterns
   documented below reflect the actual codebase conventions.
5. **Check this catalog first** before adding a new dependency. The package may
   already exist in another workspace.

---

## Monorepo Root

**Package manager**: pnpm 10.30.3 | **Node.js**: >=22.16.0

### Runtime Dependencies

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| argon2 | 0.44.0 | [github.com/ranisalt/node-argon2](https://github.com/ranisalt/node-argon2) | `node_modules/argon2/` |
| pg | 8.18.0 | [node-postgres.com](https://node-postgres.com/) | `node_modules/pg/` |
| ulid | 3.0.2 | [github.com/ulid/javascript](https://github.com/ulid/javascript) | `node_modules/ulid/` |

### Dev Dependencies (Linting & Formatting)

| Package | Version | Homepage |
| ------- | ------- | -------- |
| eslint | 9.39.3 | [eslint.org](https://eslint.org/) |
| @tanstack/eslint-plugin-query | 5.91.4 | [tanstack.com/query](https://tanstack.com/query/latest) |
| @tanstack/eslint-plugin-router | 1.161.4 | [tanstack.com/router](https://tanstack.com/router/latest) |
| @trivago/prettier-plugin-sort-imports | 6.0.2 | [github.com/trivago/prettier-plugin-sort-imports](https://github.com/trivago/prettier-plugin-sort-imports) |
| husky | 9.1.7 | [typicode.github.io/husky](https://typicode.github.io/husky/) |
| lint-staged | 16.3.1 | [github.com/lint-staged/lint-staged](https://github.com/lint-staged/lint-staged) |

---

## apps/web (Frontend)

**Framework**: React 19 + Vite 7 + TanStack Router + TanStack Query + Tailwind
CSS 4

### Core Framework

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| react | 19.2.4 | [react.dev](https://react.dev/) | `apps/web/node_modules/react/` |
| react-dom | 19.2.4 | [react.dev](https://react.dev/) | `apps/web/node_modules/react-dom/` |
| vite | 7.3.1 | [vite.dev](https://vite.dev/) | `apps/web/node_modules/vite/` |
| typescript | 5.9.3 | [typescriptlang.org](https://www.typescriptlang.org/) | `apps/web/node_modules/typescript/` |

**Established patterns**:

- Vite config: `@tailwindcss/vite` plugin, `@vitejs/plugin-react` with
  `babel-plugin-react-compiler`, TanStack Router plugin with
  `autoCodeSplitting: true`, Lightning CSS transformer.
- Manual chunk splitting strategy in `vite.config.ts` for zod, icons, markdown,
  forms, ui-libs, react-aria, trpc, auth, tanstack-router/query/db/core, react.
- Entry point `main.tsx` nests providers: `StrictMode` > `ThemeProvider` >
  `QueryClientProvider` > `AuthProvider` > `RouterProvider`.

### TanStack Ecosystem

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| @tanstack/react-router | 1.163.3 | [tanstack.com/router](https://tanstack.com/router/latest) | `apps/web/node_modules/@tanstack/react-router/` |
| @tanstack/react-query | 5.90.21 | [tanstack.com/query](https://tanstack.com/query/latest) | `apps/web/node_modules/@tanstack/react-query/` |
| @tanstack/react-form | 1.28.3 | [tanstack.com/form](https://tanstack.com/form/latest) | `apps/web/node_modules/@tanstack/react-form/` |
| @tanstack/react-db | 0.1.74 | [tanstack.com/db](https://tanstack.com/db/latest) | `apps/web/node_modules/@tanstack/react-db/` |
| @tanstack/react-virtual | 3.13.19 | [tanstack.com/virtual](https://tanstack.com/virtual/latest) | `apps/web/node_modules/@tanstack/react-virtual/` |
| @tanstack/query-core | 5.90.20 | [tanstack.com/query](https://tanstack.com/query/latest) | `apps/web/node_modules/@tanstack/query-core/` |
| @tanstack/query-async-storage-persister | 5.90.24 | [tanstack.com/query](https://tanstack.com/query/latest) | `apps/web/node_modules/@tanstack/query-async-storage-persister/` |
| @tanstack/query-db-collection | 1.0.27 | [tanstack.com/db](https://tanstack.com/db/latest) | `apps/web/node_modules/@tanstack/query-db-collection/` |
| @tanstack/offline-transactions | 1.0.20 | [tanstack.com/db](https://tanstack.com/db/latest) | `apps/web/node_modules/@tanstack/offline-transactions/` |

**Established patterns**:

- **Router** (`v1`): File-based routing with `createFileRoute()`,
  `createRootRouteWithContext<MyRouterContext>()`. Route config:
  `defaultPreload: "intent"`, `scrollRestoration: true`,
  `defaultStructuralSharing: true`. Layout routes use `beforeLoad` for auth
  guards. Search params validated with Zod via `validateSearch`.
- **Query** (`v5`): `QueryClient` with `retry: 3`, `staleTime: 0`.
  `useSuspenseQuery()` with `trpc.*.queryOptions()`.
  `queryClient.invalidateQueries()` with specific `queryKey`. tRPC integration
  via `createTRPCOptionsProxy<AppRouter>()`.
- **Form** (`v1`): `useForm({ defaultValues, validators: { onBlur: zodSchema,
  onSubmit: zodSchema }, onSubmit })`. `form.Field` render prop with `state`,
  `handleChange`, `handleBlur`. `form.Subscribe` for derived state
  (`isSubmitting`, `isDirty`). Server errors via
  `form.setFieldMeta("field", ...)`.
- **React-DB** (`v0` BETA): `createCollection(queryCollectionOptions<T>({
  queryClient, getKey, queryKey, queryFn }))`. `useLiveQuery(collection)` and
  `useLiveQuery((q) => q.from({...}).where(...).findOne(), [deps])`. Preloading
  in loaders: `Collection.preload()` then `Collection.get(id)`, fallback to
  tRPC + `Collection.utils.writeUpsert()`.
- **CRITICAL**: ALL data fetching MUST use collections from
  `~/lib/db.collections`. Never use tRPC or React Query directly in components.

#### TanStack DevTools (dev only)

| Package | Version | `node_modules` Path |
| ------- | ------- | ------------------- |
| @tanstack/devtools-vite | 0.5.2 | `apps/web/node_modules/@tanstack/devtools-vite/` |
| @tanstack/react-devtools | 0.9.6 | `apps/web/node_modules/@tanstack/react-devtools/` |
| @tanstack/react-form-devtools | 0.2.16 | `apps/web/node_modules/@tanstack/react-form-devtools/` |
| @tanstack/react-query-devtools | 5.91.3 | `apps/web/node_modules/@tanstack/react-query-devtools/` |
| @tanstack/react-router-devtools | 1.163.3 | `apps/web/node_modules/@tanstack/react-router-devtools/` |
| @tanstack/router-plugin | 1.164.0 | `apps/web/node_modules/@tanstack/router-plugin/` |

### tRPC Client

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| @trpc/client | 11.8.1 | [trpc.io](https://trpc.io/docs) | `apps/web/node_modules/@trpc/client/` |
| @trpc/tanstack-react-query | 11.8.1 | [trpc.io](https://trpc.io/docs) | `apps/web/node_modules/@trpc/tanstack-react-query/` |
| superjson | 2.2.6 | [github.com/flightcontrolhq/superjson](https://github.com/flightcontrolhq/superjson) | `apps/web/node_modules/superjson/` |

**Established patterns**:

- `splitLink`: SSE `httpSubscriptionLink` for subscriptions (withCredentials),
  `httpBatchStreamLink` for queries (credentials: "include").
- `createTRPCOptionsProxy<AppRouter>()` with `queryClient`.
- Superjson transformer for Date and other non-JSON types.

### Authentication

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| better-auth | 1.4.18 | [better-auth.com](https://www.better-auth.com/docs) | `apps/web/node_modules/better-auth/` |
| @polar-sh/better-auth | 1.6.4 | [polar.sh](https://polar.sh/) | `apps/web/node_modules/@polar-sh/better-auth/` |

### Styling & CSS

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| tailwindcss | 4.1.18 | [tailwindcss.com](https://tailwindcss.com/docs) | `apps/web/node_modules/tailwindcss/` |
| @tailwindcss/vite | 4.1.18 | [tailwindcss.com](https://tailwindcss.com/docs) | `apps/web/node_modules/@tailwindcss/vite/` |
| @tailwindcss/typography | 0.5.19 | [tailwindcss.com/docs/typography-plugin](https://tailwindcss.com/docs/typography-plugin) | `apps/web/node_modules/@tailwindcss/typography/` |
| tw-animate-css | 1.4.0 | [github.com/Wombosvideo/tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) | `apps/web/node_modules/tw-animate-css/` |
| lightningcss | 1.31.1 | [lightningcss.dev](https://lightningcss.dev/) | `apps/web/node_modules/lightningcss/` |
| class-variance-authority | 0.7.1 | [cva.style](https://cva.style/docs) | `apps/web/node_modules/class-variance-authority/` |
| clsx | 2.1.1 | [github.com/lukeed/clsx](https://github.com/lukeed/clsx) | `apps/web/node_modules/clsx/` |
| tailwind-merge | 3.4.0 | [github.com/dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge) | `apps/web/node_modules/tailwind-merge/` |

**Established patterns**:

- **Tailwind CSS 4** syntax: `@import "tailwindcss"` (not `@tailwind`
  directives), `@theme inline` for design tokens, `@custom-variant dark`,
  `@plugin` for plugins.
- **OKLch color system**: All color tokens use OKLch values in CSS custom
  properties, mapped via `@theme inline` in
  `packages/shared-ui/styles/global.css`.
- **`cn()` utility**: `twMerge(clsx(inputs))` from
  `packages/shared-ui/lib/utils.ts`. Always use for conditional class merging.
- **CVA** (class-variance-authority): Used for component variants in buttons,
  badges, and other styled components.
- **Lightning CSS**: Used as CSS transformer/minifier in Vite build.
- **Every Layout compositions**: CSS files in
  `apps/web/src/styles/compositions/` (sidebar, stack, cluster, cover, icon,
  imposter, box, center, switcher).

### UI Components

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| @radix-ui/react-dialog | 1.1.15 | [radix-ui.com](https://www.radix-ui.com/) | `apps/web/node_modules/@radix-ui/react-dialog/` |
| @radix-ui/react-dropdown-menu | 2.1.16 | [radix-ui.com](https://www.radix-ui.com/) | `apps/web/node_modules/@radix-ui/react-dropdown-menu/` |
| @radix-ui/react-label | 2.1.8 | [radix-ui.com](https://www.radix-ui.com/) | `apps/web/node_modules/@radix-ui/react-label/` |
| @radix-ui/react-slot | 1.2.4 | [radix-ui.com](https://www.radix-ui.com/) | `apps/web/node_modules/@radix-ui/react-slot/` |
| @headlessui/react | 2.2.9 | [headlessui.com](https://headlessui.com/) | `apps/web/node_modules/@headlessui/react/` |
| react-aria-components | 1.14.0 | [react-spectrum.adobe.com](https://react-spectrum.adobe.com/react-aria/) | `apps/web/node_modules/react-aria-components/` |
| lucide-react | 0.562.0 | [lucide.dev](https://lucide.dev/) | `apps/web/node_modules/lucide-react/` |

### Forms & Validation

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| zod | 4.3.6 | [zod.dev](https://zod.dev/) | `apps/web/node_modules/zod/` |
| react-hook-form | 7.70.0 | [react-hook-form.com](https://react-hook-form.com/) | `apps/web/node_modules/react-hook-form/` |
| @hookform/resolvers | 5.2.2 | [github.com/react-hook-form/resolvers](https://github.com/react-hook-form/resolvers) | `apps/web/node_modules/@hookform/resolvers/` |

**Established patterns**:

- **Zod 4**: New import paths. Use `z.string().trim().check(z.email())` instead
  of `z.string().email().trim()` (Zod 4 `z.email()` returns a standalone check,
  not chainable on `.trim()`).
- **TanStack Form + Zod**: Validators passed as `{ onBlur: zodSchema,
  onSubmit: zodSchema }` to `useForm()`.

### Drag & Drop

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| @dnd-kit/core | 6.3.1 | [dndkit.com](https://dndkit.com/) | `apps/web/node_modules/@dnd-kit/core/` |
| @dnd-kit/sortable | 10.0.0 | [dndkit.com](https://dndkit.com/) | `apps/web/node_modules/@dnd-kit/sortable/` |
| @dnd-kit/utilities | 3.2.2 | [dndkit.com](https://dndkit.com/) | `apps/web/node_modules/@dnd-kit/utilities/` |

### Markdown & Content

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| @mdx-js/react | 3.1.1 | [mdxjs.com](https://mdxjs.com/) | `apps/web/node_modules/@mdx-js/react/` |
| @mdx-js/rollup | 3.1.1 | [mdxjs.com](https://mdxjs.com/) | `apps/web/node_modules/@mdx-js/rollup/` |
| @shikijs/rehype | 3.23.0 | [shiki.style](https://shiki.style/) | `apps/web/node_modules/@shikijs/rehype/` |
| remark-gfm | 4.0.1 | [github.com/remarkjs/remark-gfm](https://github.com/remarkjs/remark-gfm) | `apps/web/node_modules/remark-gfm/` |
| remark-parse | 11.0.0 | [github.com/remarkjs/remark](https://github.com/remarkjs/remark) | `apps/web/node_modules/remark-parse/` |
| remark-rehype | 11.1.2 | [github.com/remarkjs/remark-rehype](https://github.com/remarkjs/remark-rehype) | `apps/web/node_modules/remark-rehype/` |
| rehype-autolink-headings | 7.1.0 | [github.com/rehypejs/rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings) | `apps/web/node_modules/rehype-autolink-headings/` |
| rehype-external-links | 3.0.0 | [github.com/rehypejs/rehype-external-links](https://github.com/rehypejs/rehype-external-links) | `apps/web/node_modules/rehype-external-links/` |
| rehype-highlight | 7.0.2 | [github.com/rehypejs/rehype-highlight](https://github.com/rehypejs/rehype-highlight) | `apps/web/node_modules/rehype-highlight/` |
| rehype-slug | 6.0.0 | [github.com/rehypejs/rehype-slug](https://github.com/rehypejs/rehype-slug) | `apps/web/node_modules/rehype-slug/` |
| rehype-stringify | 10.0.1 | [github.com/rehypejs/rehype](https://github.com/rehypejs/rehype) | `apps/web/node_modules/rehype-stringify/` |
| unified | 11.0.5 | [unifiedjs.com](https://unifiedjs.com/) | `apps/web/node_modules/unified/` |
| highlight.js | 11.11.1 | [highlightjs.org](https://highlightjs.org/) | `apps/web/node_modules/highlight.js/` |

### Utilities

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| @epic-web/invariant | 1.0.0 | [github.com/epicweb-dev/invariant](https://github.com/epicweb-dev/invariant) | `apps/web/node_modules/@epic-web/invariant/` |
| date-fns | 4.1.0 | [date-fns.org](https://date-fns.org/) | `apps/web/node_modules/date-fns/` |
| dompurify | 3.3.1 | [github.com/cure53/DOMPurify](https://github.com/cure53/DOMPurify) | `apps/web/node_modules/dompurify/` |
| browserslist | 4.28.1 | [browsersl.ist](https://browsersl.ist/) | `apps/web/node_modules/browserslist/` |
| sonner | 2.0.7 | [sonner.emilkowal.ski](https://sonner.emilkowal.ski/) | `apps/web/node_modules/sonner/` |
| styled-components | 6.3.11 | [styled-components.com](https://styled-components.com/) | `apps/web/node_modules/styled-components/` |
| web-vitals | 5.1.0 | [github.com/GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals) | `apps/web/node_modules/web-vitals/` |

### Media

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| @giphy/js-fetch-api | 5.7.0 | [developers.giphy.com](https://developers.giphy.com/) | `apps/web/node_modules/@giphy/js-fetch-api/` |
| @giphy/react-components | 10.1.1 | [developers.giphy.com](https://developers.giphy.com/) | `apps/web/node_modules/@giphy/react-components/` |
| emoji-picker-react | 4.18.0 | [github.com/ealush/emoji-picker-react](https://github.com/ealush/emoji-picker-react) | `apps/web/node_modules/emoji-picker-react/` |
| react-youtube | 10.1.0 | [github.com/tjallingt/react-youtube](https://github.com/tjallingt/react-youtube) | `apps/web/node_modules/react-youtube/` |

### Testing (dev)

| Package | Version | Homepage |
| ------- | ------- | -------- |
| vitest | 4.0.18 | [vitest.dev](https://vitest.dev/) |
| @testing-library/react | 16.3.2 | [testing-library.com](https://testing-library.com/docs/react-testing-library/intro/) |
| @testing-library/dom | 10.4.1 | [testing-library.com](https://testing-library.com/) |
| @testing-library/jest-dom | 6.9.1 | [testing-library.com](https://testing-library.com/docs/ecosystem-jest-dom/) |
| @testing-library/user-event | 14.6.1 | [testing-library.com](https://testing-library.com/docs/user-event/intro/) |
| @faker-js/faker | 10.3.0 | [fakerjs.dev](https://fakerjs.dev/) |
| cypress | 15.11.0 | [cypress.io](https://www.cypress.io/) |
| jsdom | 27.4.0 | [github.com/jsdom/jsdom](https://github.com/jsdom/jsdom) |

### Tauri (Native Desktop)

| Package | Version | Homepage |
| ------- | ------- | -------- |
| @tauri-apps/cli | 2.9.6 | [v2.tauri.app](https://v2.tauri.app/) |

---

## apps/server (Backend)

**Framework**: Fastify 5 + tRPC 11 + Drizzle ORM + Better Auth

### Core Framework

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| fastify | 5.7.4 | [fastify.dev](https://fastify.dev/docs/latest/) | `apps/server/node_modules/fastify/` |
| typescript | 5.9.3 | [typescriptlang.org](https://www.typescriptlang.org/) | `apps/server/node_modules/typescript/` |
| tsx | 4.21.0 | [tsx.is](https://tsx.is/) | `apps/server/node_modules/tsx/` |

**Established patterns**:

- Fastify instance created with `ZodTypeProvider`, trust proxy, 60s timeout,
  10MB body limit.
- 3-phase autoload: `plugins/external/` > `plugins/app/` > `routes/`.
- Plugin loading order: allow, better-auth, cors, etag, favicons, form-body,
  healthcheck, helmet, multipart, rate-limit, sensible (external), then cache,
  db, mail, metrics, request-logging, timingHeader (app).
- `fastify.to()` Go-like error handling (from `@fastify/sensible`).
- Custom 404 and error handlers registered in `server.ts`.

### Fastify Plugins (Official)

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| @fastify/autoload | 6.3.1 | [github.com/fastify/fastify-autoload](https://github.com/fastify/fastify-autoload) | `apps/server/node_modules/@fastify/autoload/` |
| @fastify/cors | 11.2.0 | [github.com/fastify/fastify-cors](https://github.com/fastify/fastify-cors) | `apps/server/node_modules/@fastify/cors/` |
| @fastify/etag | 6.1.0 | [github.com/fastify/fastify-etag](https://github.com/fastify/fastify-etag) | `apps/server/node_modules/@fastify/etag/` |
| @fastify/formbody | 8.0.2 | [github.com/fastify/fastify-formbody](https://github.com/fastify/fastify-formbody) | `apps/server/node_modules/@fastify/formbody/` |
| @fastify/helmet | 13.0.2 | [github.com/fastify/fastify-helmet](https://github.com/fastify/fastify-helmet) | `apps/server/node_modules/@fastify/helmet/` |
| @fastify/http-proxy | 11.4.1 | [github.com/fastify/fastify-http-proxy](https://github.com/fastify/fastify-http-proxy) | `apps/server/node_modules/@fastify/http-proxy/` |
| @fastify/multipart | 9.4.0 | [github.com/fastify/fastify-multipart](https://github.com/fastify/fastify-multipart) | `apps/server/node_modules/@fastify/multipart/` |
| @fastify/rate-limit | 10.3.0 | [github.com/fastify/fastify-rate-limit](https://github.com/fastify/fastify-rate-limit) | `apps/server/node_modules/@fastify/rate-limit/` |
| @fastify/sensible | 6.0.4 | [github.com/fastify/fastify-sensible](https://github.com/fastify/fastify-sensible) | `apps/server/node_modules/@fastify/sensible/` |

### Fastify Plugins (Community)

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| fastify-allow | 2.1.1 | [github.com/matteo-pichierri/fastify-allow](https://github.com/matteo-pichierri/fastify-allow) | `apps/server/node_modules/fastify-allow/` |
| fastify-better-auth | 1.2.0 | [github.com/nicholascmiller/fastify-better-auth](https://github.com/nicholascmiller/fastify-better-auth) | `apps/server/node_modules/fastify-better-auth/` |
| fastify-favicon | 5.0.0 | [github.com/smartiniOnGitHub/fastify-favicon](https://github.com/smartiniOnGitHub/fastify-favicon) | `apps/server/node_modules/fastify-favicon/` |
| fastify-healthcheck | 5.1.0 | [github.com/smartiniOnGitHub/fastify-healthcheck](https://github.com/smartiniOnGitHub/fastify-healthcheck) | `apps/server/node_modules/fastify-healthcheck/` |
| fastify-print-routes | 5.0.1 | [github.com/ShogunPanda/fastify-print-routes](https://github.com/ShogunPanda/fastify-print-routes) | `apps/server/node_modules/fastify-print-routes/` |
| fastify-type-provider-zod | 6.1.0 | [github.com/turkerdev/fastify-type-provider-zod](https://github.com/turkerdev/fastify-type-provider-zod) | `apps/server/node_modules/fastify-type-provider-zod/` |

### Database (Drizzle ORM + PostgreSQL)

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| drizzle-orm | 0.45.1 | [orm.drizzle.team](https://orm.drizzle.team/docs/overview) | `apps/server/node_modules/drizzle-orm/` |
| drizzle-kit | 0.31.9 | [orm.drizzle.team/docs/kit-overview](https://orm.drizzle.team/docs/kit-overview) | `apps/server/node_modules/drizzle-kit/` |
| pg | 8.18.0 | [node-postgres.com](https://node-postgres.com/) | `apps/server/node_modules/pg/` |

**Established patterns**:

- **Schema namespace**: `mySchema = pgSchema("my_schema")` — all tables created
  via `mySchema.table()`, enums via `mySchema.enum()`.
- **Timestamps helper**: `timestamps` object with `createdAt` (defaultNow,
  notNull) and `updatedAt` (defaultNow, `$onUpdateFn(() => new Date())`,
  notNull). Spread into table definitions.
- **Prepared statements**: MUST be module-scoped (top-level), never inside
  functions. Pattern:
  `const getX = db.query.table.findMany({...}).prepare("getX")`.
- **Type exports**: `type X = Awaited<ReturnType<typeof getX>>` at bottom of
  query files.
- **Schemas**: `apps/server/src/db/schema/` (17 files).
- **Queries**: `apps/server/src/db/queries/` (9 files, read-only).
- **Mutations**: `apps/server/src/db/mutations/` (9 files, write operations
  with `.returning()`).

### tRPC Server

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| @trpc/server | 11.8.1 | [trpc.io](https://trpc.io/docs) | `apps/server/node_modules/@trpc/server/` |
| superjson | 2.2.6 | [github.com/flightcontrolhq/superjson](https://github.com/flightcontrolhq/superjson) | `apps/server/node_modules/superjson/` |

**Established patterns**:

- tRPC adapter registered at `/trpc` with superjson transformer, SSE
  subscriptions, error metrics.
- 20 feature routers combined in `apps/server/src/routers/index.ts`.
- Each router has `index.ts`, `queries.ts`, `mutations.ts` (some have
  `subscriptions.ts`).
- SSE subscriptions use `tracked()` for event streaming.
- `isAdmin` middleware for protected routes.

### Authentication

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| better-auth | 1.4.18 | [better-auth.com](https://www.better-auth.com/docs) | `apps/server/node_modules/better-auth/` |
| @polar-sh/better-auth | 1.6.4 | [polar.sh](https://polar.sh/) | `apps/server/node_modules/@polar-sh/better-auth/` |
| argon2 | 0.44.0 | [github.com/ranisalt/node-argon2](https://github.com/ranisalt/node-argon2) | `apps/server/node_modules/argon2/` |

**Established patterns**:

- Better Auth with Fastify plugin via `fastify-better-auth`.
- Argon2 hashing with pepper for password security.

### Caching, Logging & Monitoring

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| ioredis | 5.9.2 | [github.com/redis/ioredis](https://github.com/redis/ioredis) | `apps/server/node_modules/ioredis/` |
| async-cache-dedupe | 3.4.0 | [github.com/mcollina/async-cache-dedupe](https://github.com/mcollina/async-cache-dedupe) | `apps/server/node_modules/async-cache-dedupe/` |
| pino | 10.3.1 | [getpino.io](https://getpino.io/) | `apps/server/node_modules/pino/` |
| prom-client | 15.1.3 | [github.com/siimon/prom-client](https://github.com/siimon/prom-client) | `apps/server/node_modules/prom-client/` |

### Other Server Dependencies

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| @aws-sdk/client-s3 | 3.981.0 | [docs.aws.amazon.com/AWSJavaScriptSDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) | `apps/server/node_modules/@aws-sdk/client-s3/` |
| @aws-sdk/s3-request-presigner | 3.981.0 | [docs.aws.amazon.com/AWSJavaScriptSDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) | `apps/server/node_modules/@aws-sdk/s3-request-presigner/` |
| @polar-sh/sdk | 0.42.1 | [polar.sh](https://polar.sh/) | `apps/server/node_modules/@polar-sh/sdk/` |
| close-with-grace | 2.4.0 | [github.com/mcollina/close-with-grace](https://github.com/mcollina/close-with-grace) | `apps/server/node_modules/close-with-grace/` |
| isbot | 5.1.35 | [isbot.js.org](https://isbot.js.org/) | `apps/server/node_modules/isbot/` |
| nodemailer | 7.0.13 | [nodemailer.com](https://nodemailer.com/) | `apps/server/node_modules/nodemailer/` |
| undici | 7.22.0 | [undici.nodejs.org](https://undici.nodejs.org/) | `apps/server/node_modules/undici/` |
| zod | 4.3.6 | [zod.dev](https://zod.dev/) | `apps/server/node_modules/zod/` |
| ulid | 3.0.2 | [github.com/ulid/javascript](https://github.com/ulid/javascript) | `apps/server/node_modules/ulid/` |

### Testing (dev)

| Package | Version | Homepage |
| ------- | ------- | -------- |
| vitest | 4.0.18 | [vitest.dev](https://vitest.dev/) |
| @vitest/coverage-v8 | 4.0.18 | [vitest.dev](https://vitest.dev/) |

---

## packages/shared-ui

**Purpose**: Radix UI component library shared across apps.

### Dependencies

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| @hookform/resolvers | 5.2.2 | [github.com/react-hook-form/resolvers](https://github.com/react-hook-form/resolvers) | `packages/shared-ui/node_modules/@hookform/resolvers/` |
| class-variance-authority | 0.7.1 | [cva.style](https://cva.style/docs) | (hoisted) |
| clsx | 2.1.1 | [github.com/lukeed/clsx](https://github.com/lukeed/clsx) | (hoisted) |
| lucide-react | 0.562.0 | [lucide.dev](https://lucide.dev/) | (hoisted) |
| react | 19.2.4 | [react.dev](https://react.dev/) | (hoisted) |
| react-hook-form | 7.70.0 | [react-hook-form.com](https://react-hook-form.com/) | `packages/shared-ui/node_modules/react-hook-form/` |
| sonner | 2.0.7 | [sonner.emilkowal.ski](https://sonner.emilkowal.ski/) | (hoisted) |
| tailwind-merge | 3.4.0 | [github.com/dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge) | (hoisted) |
| tailwindcss | 4.1.18 | [tailwindcss.com](https://tailwindcss.com/docs) | (hoisted) |
| tw-animate-css | 1.4.0 | [github.com/Wombosvideo/tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) | (hoisted) |
| zod | 4.3.6 | [zod.dev](https://zod.dev/) | (hoisted) |

### Radix UI Primitives

| Package | Version | `node_modules` Path |
| ------- | ------- | ------------------- |
| @radix-ui/react-alert-dialog | 1.1.15 | `packages/shared-ui/node_modules/@radix-ui/react-alert-dialog/` |
| @radix-ui/react-avatar | 1.1.11 | `packages/shared-ui/node_modules/@radix-ui/react-avatar/` |
| @radix-ui/react-checkbox | 1.3.3 | `packages/shared-ui/node_modules/@radix-ui/react-checkbox/` |
| @radix-ui/react-dialog | 1.1.15 | `packages/shared-ui/node_modules/@radix-ui/react-dialog/` |
| @radix-ui/react-hover-card | 1.1.15 | `packages/shared-ui/node_modules/@radix-ui/react-hover-card/` |
| @radix-ui/react-label | 2.1.8 | `packages/shared-ui/node_modules/@radix-ui/react-label/` |
| @radix-ui/react-popover | 1.1.15 | `packages/shared-ui/node_modules/@radix-ui/react-popover/` |
| @radix-ui/react-progress | 1.1.8 | `packages/shared-ui/node_modules/@radix-ui/react-progress/` |
| @radix-ui/react-separator | 1.1.8 | `packages/shared-ui/node_modules/@radix-ui/react-separator/` |
| @radix-ui/react-slot | 1.2.4 | `packages/shared-ui/node_modules/@radix-ui/react-slot/` |
| @radix-ui/react-switch | 1.2.6 | `packages/shared-ui/node_modules/@radix-ui/react-switch/` |
| @radix-ui/react-tabs | 1.1.13 | `packages/shared-ui/node_modules/@radix-ui/react-tabs/` |
| @radix-ui/react-toggle | 1.1.10 | `packages/shared-ui/node_modules/@radix-ui/react-toggle/` |
| @radix-ui/react-toggle-group | 1.1.11 | `packages/shared-ui/node_modules/@radix-ui/react-toggle-group/` |
| @radix-ui/react-tooltip | 1.2.8 | `packages/shared-ui/node_modules/@radix-ui/react-tooltip/` |

All Radix primitives: [radix-ui.com](https://www.radix-ui.com/)

**Established patterns**:

- Components in `packages/shared-ui/components/` (27+ components).
- Exports via `"./components/*"` and `"./ui/*"` in `package.json`.
- Uses `cn()` utility from `packages/shared-ui/lib/utils.ts`.
- OKLch design tokens defined in `packages/shared-ui/styles/global.css`.

---

## marketing/learn-fastify

**Framework**: Astro 5 (static site)

### Dependencies

| Package | Version | Homepage | `node_modules` Path |
| ------- | ------- | -------- | ------------------- |
| astro | 5.18.0 | [astro.build](https://astro.build/) | `marketing/learn-fastify/node_modules/astro/` |
| @astrojs/react | 4.3.0 | [docs.astro.build](https://docs.astro.build/en/guides/integrations-guide/react/) | `marketing/learn-fastify/node_modules/@astrojs/react/` |
| @astrojs/tailwind | 6.0.2 | [docs.astro.build](https://docs.astro.build/en/guides/integrations-guide/tailwind/) | `marketing/learn-fastify/node_modules/@astrojs/tailwind/` |
| @tailwindcss/vite | 4.1.18 | [tailwindcss.com](https://tailwindcss.com/docs) | `marketing/learn-fastify/node_modules/@tailwindcss/vite/` |
| @trpc/client | 11.8.1 | [trpc.io](https://trpc.io/docs) | `marketing/learn-fastify/node_modules/@trpc/client/` |
| clsx | 2.1.1 | [github.com/lukeed/clsx](https://github.com/lukeed/clsx) | (hoisted) |
| lucide-react | 0.513.0 | [lucide.dev](https://lucide.dev/) | `marketing/learn-fastify/node_modules/lucide-react/` |
| react | 19.2.4 | [react.dev](https://react.dev/) | (hoisted) |
| react-dom | 19.2.4 | [react.dev](https://react.dev/) | (hoisted) |
| superjson | 2.2.6 | [github.com/flightcontrolhq/superjson](https://github.com/flightcontrolhq/superjson) | (hoisted) |
| tailwind-merge | 3.3.0 | [github.com/dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge) | `marketing/learn-fastify/node_modules/tailwind-merge/` |
| tailwindcss | 4.1.18 | [tailwindcss.com](https://tailwindcss.com/docs) | (hoisted) |
| tw-animate-css | 1.4.0 | [github.com/Wombosvideo/tw-animate-css](https://github.com/Wombosvideo/tw-animate-css) | (hoisted) |
| zod | 4.3.6 | [zod.dev](https://zod.dev/) | `marketing/learn-fastify/node_modules/zod/` |

---

## Cross-Workspace Version Alignment

All packages are now version-aligned across workspaces. Previously flagged
mismatches have been resolved:

| Package | Previous Mismatch | Resolution |
| ------- | ----------------- | ---------- |
| react-hook-form | 7.65.0 (shared-ui) vs 7.70.0 (web) | Updated shared-ui to 7.70.0 |
| zod | 3.25.76 (marketing) vs 4.3.6 (others) | Updated marketing to 4.3.6 |

### Packages Shared Across Multiple Workspaces

| Package | Version | Workspaces |
| ------- | ------- | ---------- |
| react | 19.2.4 | web, shared-ui, marketing |
| zod | 4.3.6 | web, server, shared-ui, marketing |
| tailwindcss | 4.1.18 | web, shared-ui, marketing |
| clsx | 2.1.1 | web, shared-ui, marketing |
| tailwind-merge | 3.4.0 / 3.3.0 | web + shared-ui / marketing |
| lucide-react | 0.562.0 / 0.513.0 | web + shared-ui / marketing |
| superjson | 2.2.6 | web, server, marketing |
| better-auth | 1.4.18 | web, server |
| @trpc/client | 11.8.1 | web, marketing |
| tw-animate-css | 1.4.0 | web, shared-ui, marketing |
| ulid | 3.0.2 | root, server |
| pg | 8.18.0 | root, server |
| argon2 | 0.44.0 | root, server |

### Minor Version Differences to Monitor

These packages have different minor versions across workspaces. Not breaking,
but worth aligning during the next dependency update:

- **tailwind-merge**: 3.4.0 (web, shared-ui) vs 3.3.0 (marketing)
- **lucide-react**: 0.562.0 (web, shared-ui) vs 0.513.0 (marketing)

---

## Quick Reference: Key APIs by Package

### TanStack Router (v1)

```typescript
import { createFileRoute, createRootRouteWithContext, Link, Outlet, useRouter, useNavigate } from "@tanstack/react-router";
```

### TanStack Query (v5)

```typescript
import { useQuery, useSuspenseQuery, useMutation, QueryClient, useQueryClient } from "@tanstack/react-query";
```

### TanStack Form (v1)

```typescript
import { useForm } from "@tanstack/react-form";
```

### TanStack React-DB (v0 BETA)

```typescript
import { createCollection, useLiveQuery, eq } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
```

### Drizzle ORM (v0.45)

```typescript
import { pgSchema, pgTable, relations } from "drizzle-orm/pg-core";
import { eq, and, desc, sql } from "drizzle-orm";
```

### tRPC (v11)

```typescript
// Server
import { initTRPC } from "@trpc/server";
// Client
import { createTRPCClient, splitLink, httpBatchStreamLink, httpSubscriptionLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
```

### Fastify (v5)

```typescript
import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
```

### Zod (v4)

```typescript
import { z } from "zod";
// Email with trim: z.string().trim().check(z.email())
// NOT: z.string().email().trim()
```

### Tailwind CSS (v4)

```css
@import "tailwindcss";
@theme inline { /* design tokens */ }
@custom-variant dark (&:is(.dark *));
```
