---
applyTo: ".github/workflows/*.yml"
description: "CI/CD patterns specific to this course platform monorepo"
---

# GitHub Actions — Project CI/CD Patterns

Rules and patterns for the CI workflows in this repository.

## Workflow Structure

This project has three workflows:

| File | Purpose |
|------|---------|
| `ci.yml` | Main CI — lint, typecheck, build, server tests, web tests, E2E tests |
| `codeql-analysis.yml` | CodeQL security scanning |
| `gh-actions-cache-cleanup.yml` | Automatic cache cleanup on PR close |

## Project-Specific CI Rules

### Node.js Versions

CI tests on Node.js **22, 24, and 25**. The project requires `>=22.16.0`.

### Matrix Strategy

Server-tests and E2E-tests jobs use **include-only matrix format** to guarantee
every job has both `node-version` and `redis-db` values:
- Server tests use `redis-db` 1–3
- E2E tests use `redis-db` 4–6

```yaml
strategy:
  matrix:
    include:
      - node-version: 22.x
        redis-db: 1
      - node-version: 24.x
        redis-db: 2
      - node-version: 25.x
        redis-db: 3
```

### Database Schema Isolation

Each CI job uses a unique `DATABASE_SCHEMA` (e.g., `ci_server_22_<run_id>`) so
jobs can run in parallel against a shared PostgreSQL instance. The migration
script `ci-migrate.ts` replaces all `"my_schema"` references in SQL files.

### Turbo Remote Cache

Turbo uses team `codewizard` with `TURBO_TOKEN` for remote caching.

### pnpm Setup

Always use `pnpm/action-setup@v4` with `run_install: false`, then
`pnpm install --frozen-lockfile` as a separate step. Cache pnpm store via
`actions/cache` with key based on `pnpm-lock.yaml` hash.

## General Best Practices

- Pin actions to major version tags (e.g., `@v4`, `@v6`).
- Set `permissions: contents: read` at workflow level.
- Use `concurrency` with `cancel-in-progress: true` for PR workflows.
- Use `paths-ignore` to skip CI for documentation-only changes.
- Store secrets in GitHub Secrets; use `vars.*` for non-sensitive config.
- Set `timeout-minutes` on long-running jobs to prevent hung workflows.

## Conclusion

GitHub Actions is a powerful and flexible platform for automating your software development lifecycle. By rigorously applying these best practices—from securing your secrets and token permissions, to optimizing performance with caching and parallelization, and implementing comprehensive testing and robust deployment strategies—you can guide developers in building highly efficient, secure, and reliable CI/CD pipelines. Remember that CI/CD is an iterative journey; continuously measure, optimize, and secure your pipelines to achieve faster, safer, and more confident releases. Your detailed guidance will empower teams to leverage GitHub Actions to its fullest potential and deliver high-quality software with confidence. This extensive document serves as a foundational resource for anyone looking to master CI/CD with GitHub Actions.
