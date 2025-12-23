/**
 * Hardcoded test reviews with deterministic IDs
 */
export const testReviews = [
  {
    id: "review:01TESTREVIEW000001",
    userId: "user:01TESTUSER0000000000005",
    courseId: "course:01TESTCOURSE00000000002",
    rating: 5,
    title: "Excellent TypeScript Course",
    comment:
      "This course really helped me understand advanced TypeScript concepts. The instructor explains everything clearly and provides great examples.",
    approved: true,
    reviewedAt: new Date("2024-12-01T10:00:00Z"),
    createdAt: new Date("2024-11-30T18:00:00Z"),
    updatedAt: new Date("2024-12-01T10:00:00Z"),
  },
  {
    id: "review:01TESTREVIEW000002",
    userId: "user:01TESTUSER0000000000001",
    courseId: "course:01TESTCOURSE00000000001",
    rating: 5,
    title: "Great Fastify Introduction",
    comment:
      "Perfect for learning Fastify from scratch. Well-structured modules and practical examples.",
    approved: true,
    reviewedAt: new Date("2024-12-05T14:30:00Z"),
    createdAt: new Date("2024-12-05T12:00:00Z"),
    updatedAt: new Date("2024-12-05T14:30:00Z"),
  },
  {
    id: "review:01TESTREVIEW000003",
    userId: "user:01TESTUSER0000000000002",
    courseId: "course:01TESTCOURSE00000000001",
    rating: 4,
    title: "Good but needs more examples",
    comment:
      "Overall a good course. I would have liked to see more real-world examples in the advanced section.",
    approved: true,
    reviewedAt: new Date("2024-12-10T09:15:00Z"),
    createdAt: new Date("2024-12-09T16:00:00Z"),
    updatedAt: new Date("2024-12-10T09:15:00Z"),
  },
  {
    id: "review:01TESTREVIEW000004",
    userId: "user:01TESTUSER0000000000004",
    courseId: "course:01TESTCOURSE00000000002",
    rating: 3,
    title: "Pending review",
    comment: "This is a test review that hasn't been approved yet.",
    approved: false,
    reviewedAt: null,
    createdAt: new Date("2024-12-15T11:00:00Z"),
    updatedAt: new Date("2024-12-15T11:00:00Z"),
  },
];
