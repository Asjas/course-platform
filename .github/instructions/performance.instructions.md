---
applyTo: "**/*.ts, **/*.tsx"
description: "Performance optimization principles for the course platform"
---

# Performance Optimization

Core principles and project-specific performance guidelines. For the full reference with examples, tooling guides, and framework-specific tips, see [docs/performance-optimization-reference.md](../docs/performance-optimization-reference.md).

## General Principles

- **Measure first, optimize second.** Profile with Chrome DevTools, Lighthouse, or `clinic.js` before changing code.
- **Optimize for the common case.** Focus on hot paths, not rare edge cases.
- **Avoid premature optimization.** Write clear code first; optimize only when measured bottlenecks exist.
- **Set performance budgets.** Define limits for load time, bundle size, API latency. Enforce in CI.

## Frontend (React + Vite + TanStack)

- Use `React.memo`, `useMemo`, and `useCallback` to avoid unnecessary re-renders.
- Split large components with `React.lazy` and `Suspense` for code-splitting.
- Avoid anonymous functions in render — they create new references every render.
- Use `loading="lazy"` for images. Prefer WebP/AVIF formats.
- Debounce/throttle scroll, resize, and input event handlers.
- Clean up event listeners and intervals to prevent memory leaks.
- Preload collections in route loaders to eliminate loading spinners.
- Monitor Core Web Vitals (LCP, FID, CLS).

## Backend (Fastify + Node.js)

- Use async/await exclusively. Never use blocking I/O (`fs.readFileSync`, etc.) in production.
- Use streams for large file or network data processing.
- Use connection pooling for database and Redis connections.
- Use `async-cache-dedupe` for request deduplication.
- Minimize logging in hot paths. Use structured logging with Pino.
- **Always define response schemas** on Fastify routes — Fastify uses `fast-json-stringify` for
  routes that have a `response` schema, which is significantly faster than `JSON.stringify`.
- **Define schemas at route registration time (startup), not dynamically inside handlers.** A
  schema constructed inside a handler is compiled on every request, bypassing Fastify's compiled
  validator cache and negating the performance benefit.
- Use `p-limit` to cap concurrency for bulk async operations and prevent connection pool
  exhaustion.
- Monitor with Prometheus metrics (`prom-client`).

## Database (Drizzle + PostgreSQL)

- Use indexes on frequently queried/filtered/joined columns.
- Select only needed columns — avoid `SELECT *`.
- Use prepared statements (module-scoped, not function-scoped).
- Avoid N+1 queries — use joins or batch queries.
- Paginate large result sets with `LIMIT`/`OFFSET` or cursors.
- Keep transactions short to reduce lock contention.
- Use `EXPLAIN` to analyze and optimize query plans.
- Use Redis for caching frequently accessed query results.

## Code Review Checklist

- [ ] No obvious O(n^2) or worse algorithmic inefficiencies
- [ ] Data structures appropriate for their use case
- [ ] No unnecessary computations or repeated work
- [ ] Caching used where appropriate with proper invalidation
- [ ] Database queries optimized, indexed, and free of N+1 issues
- [ ] Large payloads paginated, streamed, or chunked
- [ ] No memory leaks or unbounded resource usage
- [ ] No blocking operations in hot paths
- [ ] Fastify routes have response schemas (enables fast-json-stringify)
- [ ] Bulk async operations use `p-limit` to cap concurrency
