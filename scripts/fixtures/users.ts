/**
 * Hardcoded test users with deterministic IDs
 */
export const testUsers = [
  {
    id: "user:01TESTUSER0000000000001",
    email: "student1@test.com",
    name: "Alice Student",
    emailVerified: true,
    image: "https://i.pravatar.cc/150?img=1",
    role: "member" as const,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  },
  {
    id: "user:01TESTUSER0000000000002",
    email: "student2@test.com",
    name: "Bob Learner",
    emailVerified: true,
    image: "https://i.pravatar.cc/150?img=2",
    role: "member" as const,
    createdAt: new Date("2024-01-02T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  },
  {
    id: "user:01TESTUSER0000000000003",
    email: "instructor@test.com",
    name: "Carol Instructor",
    emailVerified: true,
    image: "https://i.pravatar.cc/150?img=3",
    role: "member" as const,
    createdAt: new Date("2024-01-03T00:00:00Z"),
    updatedAt: new Date("2024-01-03T00:00:00Z"),
  },
  {
    id: "user:01TESTUSER0000000000004",
    email: "admin@test.com",
    name: "David Admin",
    emailVerified: true,
    image: "https://i.pravatar.cc/150?img=4",
    role: "admin" as const,
    createdAt: new Date("2024-01-04T00:00:00Z"),
    updatedAt: new Date("2024-01-04T00:00:00Z"),
  },
  {
    id: "user:01TESTUSER0000000000005",
    email: "reviewer@test.com",
    name: "Eve Reviewer",
    emailVerified: true,
    image: "https://i.pravatar.cc/150?img=5",
    role: "member" as const,
    createdAt: new Date("2024-01-05T00:00:00Z"),
    updatedAt: new Date("2024-01-05T00:00:00Z"),
  },
  // E2E Test Users for Cypress
  {
    id: "user:cypress-admin-test-user",
    email: "admin@codewizard.training",
    name: "Admin User",
    emailVerified: true,
    image: null,
    role: "admin" as const,
    password: "AdminTest123!", // This will be hashed during seeding
    createdAt: new Date("2024-01-06T00:00:00Z"),
    updatedAt: new Date("2024-01-06T00:00:00Z"),
  },
  {
    id: "user:cypress-regular-test-user",
    email: "user@codewizard.training",
    name: "Regular User",
    emailVerified: true,
    image: null,
    role: "member" as const,
    password: "UserTest123!", // This will be hashed during seeding
    createdAt: new Date("2024-01-07T00:00:00Z"),
    updatedAt: new Date("2024-01-07T00:00:00Z"),
  },
];
