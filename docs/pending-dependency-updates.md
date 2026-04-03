# Pending Dependency Updates

Packages that could not be updated as part of the last dependency update cycle,
along with the reason they are blocked and what needs to happen before the
update can proceed.

## Blocked Updates

### `eslint` + `@eslint/js`

| Package      | Current  | Latest   | Location               |
| ------------ | -------- | -------- | ---------------------- |
| `eslint`     | `9.39.3` | `10.0.3` | root `devDependencies` |
| `@eslint/js` | `9.39.3` | `10.0.1` | root `devDependencies` |

**Reason blocked:** `@tanstack/eslint-plugin-query@5.91.4` declares
`eslint: "^8.57.0 || ^9.0.0"` — it does not support ESLint 10. Upgrading causes
a runtime crash:

```
TypeError: Class extends value undefined is not a constructor or null
    at @typescript-eslint/utils/dist/ts-eslint/eslint/FlatESLint.js
```

**What needs to happen:** The TanStack team needs to release a version of
`@tanstack/eslint-plugin-query` that adds `^10.0.0` to its `eslint` peer
dependency range. Once that is published, both `eslint` and `@eslint/js` can be
bumped together in a single update.

**Tracking:** <https://github.com/TanStack/query/issues>
