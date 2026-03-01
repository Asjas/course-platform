---
applyTo: "**"
description: "CRITICAL: Setup and validation steps that MUST be run before EVERY commit"
priority: 1
---

# Setup and Validation - MANDATORY STEPS

## **CRITICAL**: Read ALL instruction files FIRST

Before starting ANY work, you MUST read ALL instruction files in `.github/instructions/`:
- 00-setup-and-validation.instructions.md (this file)
- typescript-react.instructions.md
- typescript-node.instructions.md
- trpc-type-patterns.instructions.md
- a11y.instructions.md
- security-and-owasp.instructions.md
- performance-optimization.instructions.md
- Any other .instructions.md files in the directory

**DO NOT start coding until you have read and understood ALL instruction files.**

## **CRITICAL**: These steps MUST be followed for EVERY code change

You MUST run these validation steps BEFORE committing ANY changes. CI failures due to skipped validation are unacceptable.

## **CRITICAL RULE: NEVER EDIT MIGRATION FILES**

**DO NOT EVER EDIT, MODIFY, OR TOUCH DATABASE MIGRATION FILES (.sql files in drizzle/ directories)**

Migration files are immutable once created. Editing them will cause catastrophic database issues.

If a migration is wrong:
1. Create a NEW migration file to fix it
2. Use `cd apps/server && DATABASE_URL=postgresql://localhost:5432/dummy pnpm dlx tsx node_modules/drizzle-kit/bin.cjs generate --config src/drizzle.config.ts`
3. NEVER edit existing .sql migration files

**Files you must NEVER edit:**
- `apps/server/drizzle/*.sql`
- Any `.sql` files in migration directories

**CRITICAL: Generate migrations with DATABASE_URL set**
Always set `DATABASE_URL=postgresql://localhost:5432/dummy` when generating migrations to ensure they use the correct schema namespace (`"my_schema"`).

## Initial Setup (First Time Only)

### 1. Install pnpm globally
If pnpm is not found, install it immediately:

```bash
npm install -g pnpm@10.26.2
```

**DO NOT SKIP THIS STEP**. If you encounter `pnpm: command not found`, stop and install pnpm first.

### 2. Install dependencies
After pnpm is installed, navigate to the repository root and install:

```bash
pnpm install --frozen-lockfile
```

**NEVER use npm or yarn**. Always use pnpm with `--frozen-lockfile`.

## Validation Steps - REQUIRED Before EVERY Commit

**YOU MUST RUN ALL OF THESE STEPS IN ORDER BEFORE EVERY COMMIT:**

### 1. Format code
```bash
pnpm format
```

This auto-fixes formatting issues. **Must pass with no errors**.

### 2. Lint code
```bash
pnpm lint
```

This checks and auto-fixes linting issues where possible. **Must pass with no errors**.

### 3. Type check
```bash
pnpm typecheck
```

This runs TypeScript compilation in strict mode. **Must pass with no errors**.

### 4. Build
```bash
pnpm build
```

This builds all apps and packages. **Must pass with no errors**.

## When Commands Fail

### If pnpm is not found:
```bash
npm install -g pnpm@10.26.2
```

### If packages are not installed:
```bash
pnpm install --frozen-lockfile
```

### If any validation step fails:
1. **DO NOT COMMIT**
2. **FIX THE ERRORS FIRST**
3. Run the validation steps again
4. Only commit when ALL steps pass

## Running All Validation Steps Together

You can run all validation steps in sequence:

```bash
pnpm format && pnpm lint && pnpm typecheck && pnpm build
```

**All must pass before you commit**.

## Common Mistakes to AVOID

❌ **NEVER** skip validation steps
❌ **NEVER** commit when validation fails
❌ **NEVER** manually fix formatting - use `pnpm format`
❌ **NEVER** ignore "command not found" errors - install the tool first
❌ **NEVER** use npm or yarn - always use pnpm
❌ **NEVER** add new dependencies without updating package.json first
❌ **NEVER** use `mySchema` without importing from `~/db/my-schema.js`
❌ **NEVER** generate migrations without setting DATABASE_URL

✅ **ALWAYS** run validation before committing
✅ **ALWAYS** install pnpm if it's not found
✅ **ALWAYS** install dependencies if packages are missing
✅ **ALWAYS** fix errors before committing
✅ **ALWAYS** use pnpm with --frozen-lockfile
✅ **ALWAYS** add dependencies to package.json AND run `pnpm install` before committing
✅ **ALWAYS** use `mySchema.table()` and `mySchema.enum()` in schema definitions
✅ **ALWAYS** generate migrations with `DATABASE_URL=postgresql://localhost:5432/dummy`

## Integration with report_progress

Before calling `report_progress`:
1. Run all validation steps
2. Ensure all pass
3. Only then commit your changes

**NO EXCEPTIONS**.

## Why This Matters

- CI failures waste time and resources
- Formatting/linting errors should be caught locally, not in CI
- Type errors indicate bugs that need fixing
- Build failures mean the code doesn't work
- Following these steps prevents embarrassing and avoidable CI failures

## Workflow Example

```bash
# 1. Make code changes
# 2. Run validation (from repository root)
pnpm format && pnpm lint && pnpm typecheck && pnpm build

# 3. If ALL pass, commit
# Use report_progress tool

# 4. If ANY fail, fix errors and repeat step 2
```

## Remember

**CI failures due to skipped validation are UNACCEPTABLE.**

Every commit must pass:
- ✅ Formatting
- ✅ Linting
- ✅ Type checking
- ✅ Building

No excuses. No exceptions.
