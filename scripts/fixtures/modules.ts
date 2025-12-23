/**
 * Hardcoded test modules with deterministic IDs
 * 
 * Note: course_module schema only has: id, title, slug, description, order, isPreview, courseId, createdAt, updatedAt
 */
export const testModules = [
  // Fastify Course Modules
  {
    id: "mod:01TESTMODULE000000000001",
    courseId: "course:01TESTCOURSE00000000001",
    title: "Getting Started with Fastify",
    slug: "getting-started-with-fastify",
    description: "Introduction to Fastify framework and core concepts",
    order: 1,
    isPreview: true,
    createdAt: new Date("2024-06-01T00:00:00Z"),
    updatedAt: new Date("2024-06-01T00:00:00Z"),
  },
  {
    id: "mod:01TESTMODULE000000000002",
    courseId: "course:01TESTCOURSE00000000001",
    title: "Building REST APIs",
    slug: "building-rest-apis",
    description: "Learn to build production-ready REST APIs with Fastify",
    order: 2,
    isPreview: false,
    createdAt: new Date("2024-06-02T00:00:00Z"),
    updatedAt: new Date("2024-06-02T00:00:00Z"),
  },
  {
    id: "mod:01TESTMODULE000000000003",
    courseId: "course:01TESTCOURSE00000000001",
    title: "Advanced Fastify Features",
    slug: "advanced-fastify-features",
    description: "Explore plugins, hooks, and advanced patterns",
    order: 3,
    isPreview: false,
    createdAt: new Date("2024-06-03T00:00:00Z"),
    updatedAt: new Date("2024-06-03T00:00:00Z"),
  },

  // TypeScript Course Modules
  {
    id: "mod:01TESTMODULE000000000004",
    courseId: "course:01TESTCOURSE00000000002",
    title: "Type System Fundamentals",
    slug: "type-system-fundamentals",
    description: "Deep understanding of TypeScript's type system",
    order: 1,
    isPreview: true,
    createdAt: new Date("2024-07-01T00:00:00Z"),
    updatedAt: new Date("2024-07-01T00:00:00Z"),
  },
  {
    id: "mod:01TESTMODULE000000000005",
    courseId: "course:01TESTCOURSE00000000002",
    title: "Advanced Generics",
    slug: "advanced-generics",
    description: "Master generic types and constraints",
    order: 2,
    isPreview: false,
    createdAt: new Date("2024-07-02T00:00:00Z"),
    updatedAt: new Date("2024-07-02T00:00:00Z"),
  },
  {
    id: "mod:01TESTMODULE000000000006",
    courseId: "course:01TESTCOURSE00000000002",
    title: "Conditional Types",
    slug: "conditional-types",
    description: "Working with conditional and mapped types",
    order: 3,
    isPreview: false,
    createdAt: new Date("2024-07-03T00:00:00Z"),
    updatedAt: new Date("2024-07-03T00:00:00Z"),
  },
  {
    id: "mod:01TESTMODULE000000000007",
    courseId: "course:01TESTCOURSE00000000002",
    title: "Utility Types & Patterns",
    slug: "utility-types-and-patterns",
    description: "Build reusable utility types and patterns",
    order: 4,
    isPreview: false,
    createdAt: new Date("2024-07-04T00:00:00Z"),
    updatedAt: new Date("2024-07-04T00:00:00Z"),
  },
];
