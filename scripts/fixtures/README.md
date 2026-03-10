# Test Fixtures

This directory contains hardcoded, deterministic test data for the course
platform. Using fixtures instead of randomly generated data provides several
advantages:

## Benefits

1. **Deterministic** - Same data every test run, making failures reproducible
2. **Faster** - No generation overhead, just load and insert
3. **Simpler** - No complex generation logic or constraint handling
4. **Easier to debug** - Inspect exact data being used
5. **No FK issues** - Pre-validated relationships with guaranteed referential
   integrity
6. **Maintainable** - Easy to add/modify test scenarios

## Data Structure

### Users (`users.ts`)

- 5 test users with deterministic IDs
- IDs format: `user:01TESTUSER0000000000001` through
  `user:01TESTUSER0000000000005`
- Includes students, instructor, admin, and reviewer roles

### Courses (`courses.ts`)

- 2 courses:
  - **Learn Fastify** (ID: `course:01TESTCOURSE00000000001`)
    - 3 modules, 15 lessons
    - Intermediate level
    - On sale: $49 → $29
  - **TypeScript Advanced Patterns** (ID: `course:01TESTCOURSE00000000002`)
    - 4 modules, 20 lessons
    - Advanced level
    - Regular price: $79

### Modules (`modules.ts`)

- 7 modules total across both courses
- IDs format: `mod:01TESTMODULE000000000001` through
  `mod:01TESTMODULE000000000007`
- Properly linked to courses via `courseId`
- First module of each course is marked as free

### Lessons (`lessons.ts`)

- 35 lessons total (15 for Fastify, 20 for TypeScript)
- IDs format: `lesson:01TESTLESSON0000000001` through
  `lesson:01TESTLESSON0000000035`
- Each lesson properly references both `moduleId` and `courseId`
- Includes content, video URLs, durations, and ordering

### Enrollments (`enrollments.ts`)

- 4 test enrollments
- Mix of active and completed statuses
- Various progress percentages (20%, 45%, 60%, 100%)
- IDs format: `enrollment:01TESTENROLL00001` through
  `enrollment:01TESTENROLL00004`

### Reviews (`reviews.ts`)

- 4 course reviews
- Ratings from 3 to 5 stars
- Mix of approved and pending reviews (to test review moderation)
- IDs format: `review:01TESTREVIEW000001` through `review:01TESTREVIEW000004`

### Support Tickets (`support-tickets.ts`)

- 4 support tickets with various statuses:
  - Open (unassigned)
  - In Progress (assigned)
  - Resolved (completed but not closed)
  - Closed (fully resolved and closed)
- References to specific courses, modules, and lessons
- IDs format: `suptick:01TESTSUPPORT0001` through `suptick:01TESTSUPPORT0004`

## ID Format Convention

All IDs follow a consistent pattern:

- Prefix identifying the entity type
- Colon separator
- Base ID starting with `01TEST` followed by entity-specific padding
- Sequential numbering

Examples:

- Users: `user:01TESTUSER0000000000001`
- Courses: `course:01TESTCOURSE00000000001`
- Modules: `mod:01TESTMODULE000000000001`
- Lessons: `lesson:01TESTLESSON0000000001`

This ensures:

- Easy identification in logs/debugging
- No conflicts with production data
- Predictable sorting order
- Clear test data markers

## Ghost User

The seed script automatically creates a "ghost" user (`id: 'ghost'`) before
inserting test data. This user is required by foreign key constraints in tables
like `support_ticket` that have default values pointing to the ghost user.

## Usage

The seed script (`seed-test-data.ts`) automatically loads all fixtures and
inserts them in the correct order to respect foreign key constraints:

1. Ghost user (system user)
2. Users
3. Courses
4. Modules
5. Lessons
6. Enrollments
7. Reviews
8. Support Tickets

## Adding New Test Data

To add new test data:

1. Edit the appropriate fixture file (e.g., `lessons.ts`)
2. Follow the ID naming convention
3. Ensure all foreign key references are valid
4. Use proper TypeScript types for enum fields (status, level, etc.)
5. Set appropriate dates for `createdAt` and `updatedAt`

## Validation

All fixture data respects database constraints:

- Foreign key relationships are pre-validated
- Check constraints are satisfied (e.g., `salePrice <= price`)
- Required fields are populated
- Enum values match schema definitions
- Timestamp fields use valid dates

No need for complex validation logic - the data is correct by design!
