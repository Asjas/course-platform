---
applyTo: "**/*.ts, **/*.tsx"
description: "Secure coding rules for the course platform, based on OWASP Top 10"
---

# Secure Coding Guidelines

Project-specific security rules based on OWASP Top 10.

## Access Control (A01)

- **Deny by default**: All access control must follow a "deny by default" pattern.
- **Enforce least privilege**: Explicitly check user rights for each resource.
- **Validate URLs for SSRF**: Treat user-provided URLs as untrusted; use allow-lists.
- **Prevent path traversal**: Sanitize file paths from user input.

## Cryptographic Failures (A02)

- **Password hashing**: This project uses Argon2 via Better Auth. Never use MD5/SHA-1.
- **HTTPS only**: All network requests must default to HTTPS.
- **Never hardcode secrets**: Read from `process.env` or a secrets manager.

## Injection (A03)

- **Parameterized queries only**: Use Drizzle ORM prepared statements; never concatenate user input into SQL.
- **Prevent XSS**: Use `.textContent` over `.innerHTML`. When HTML rendering is needed, sanitize with DOMPurify (already installed).
- **Sanitize command input**: Use argument escaping for any OS command execution.

## Security Headers (A05)

- This project uses `@fastify/helmet` for security headers (CSP, HSTS, X-Content-Type-Options).
- Disable verbose error messages in production.

## Authentication (A07)

- **Session management**: Better Auth handles session cookies with `HttpOnly`, `Secure`, `SameSite=Strict`.
- **Rate limiting**: `@fastify/rate-limit` is configured on the server.

## Dependency Security (A06)

- Run `pnpm audit` periodically to check for known vulnerabilities.
- Keep dependencies up to date via Renovate (configured in `renovate.json`).

## Data Integrity (A08)

- Validate all external data with Zod schemas before processing.
- Never deserialize untrusted data without validation.
