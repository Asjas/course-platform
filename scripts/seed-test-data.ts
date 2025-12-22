/**
 * Database Seeding Script for Test Data
 *
 * This script generates realistic test data for the course platform,
 * including users, courses, modules, lessons, enrollments, reviews, and support tickets.
 *
 * Usage:
 *   tsx scripts/seed-test-data.ts [schema_name]
 *
 * The schema_name defaults to "public" but can be set to any schema (e.g., "test_pr_123")
 * to support concurrent test runs in CI.
 */
import { faker } from "@faker-js/faker";
import pg from "pg";
import { ulid } from "ulid";

const { Pool } = pg;

// Get schema name from command line or use public
const schemaName = process.argv[2] || "public";
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://localhost:5432/course_platform";

console.log(`🌱 Seeding database schema: ${schemaName}`);

// Create database connection with search_path set to the target schema
// This ensures all queries use the correct schema
let connectionString = databaseUrl;
if (schemaName !== "public") {
  // Append search_path option to connection string
  const separator = databaseUrl.includes("?") ? "&" : "?";
  connectionString = `${databaseUrl}${separator}options=-c%20search_path%3D${schemaName}`;
}

const pool = new Pool({
  connectionString,
});

// Helper to generate IDs
function generateId(prefix: string): string {
  return `${prefix}:${ulid()}`;
}

// Generate fake course data
function generateFakeCourse(authorId: string) {
  const topics = [
    "Web Development",
    "Cloud Computing",
    "Data Science",
    "DevOps",
    "Security",
  ];
  const topic = faker.helpers.arrayElement(topics);

  return {
    id: generateId("course"),
    slug: faker.helpers
      .slugify(`${topic}-${faker.word.adjective()}`)
      .toLowerCase(),
    name: `Learn ${topic} - ${faker.word.adjective()} Edition`,
    description: faker.lorem.paragraph(3),
    level: faker.helpers.arrayElement([
      "All levels",
      "Beginner",
      "Intermediate",
      "Advanced",
    ] as const),
    thumbnailUrl: faker.image.urlLoremFlickr({
      category: "technology",
      width: 640,
      height: 480,
    }),
    published: true,
    isFree: faker.datatype.boolean(0.3),
    price: faker.number.int({ min: 19, max: 199 }),
    priceCurrency: "USD",
    isSaleActive: faker.datatype.boolean(0.2),
    salePrice: faker.number.int({ min: 9, max: 99 }),
    saleStartAt: faker.date.recent({ days: 30 }),
    saleExpiresAt: faker.date.future({ years: 0.5 }),
    totalEnrollments: faker.number.int({ min: 10, max: 1000 }),
    averageRating: faker.number
      .float({ min: 3.5, max: 5.0, fractionDigits: 1 })
      .toString(),
    totalReviews: faker.number.int({ min: 5, max: 200 }),
    totalModules: 0, // Will be updated after modules are created
    totalLessons: 0, // Will be updated after lessons are created
    totalDuration: 0, // Will be updated after lessons are created
    trialModuleLimit: 0,
    authorId,
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: new Date(),
  };
}

function generateFakeModule(courseId: string, order: number) {
  return {
    id: generateId("mod"),
    title: `Module ${order + 1}: ${faker.hacker.verb()} ${faker.hacker.noun()}`,
    slug: faker.helpers
      .slugify(`module-${order + 1}-${faker.word.noun()}`)
      .toLowerCase(),
    description: faker.lorem.paragraph(),
    order,
    isPreview: order === 0, // First module is preview
    courseId,
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: new Date(),
  };
}

function generateFakeLesson(courseId: string, moduleId: string, order: number) {
  // YouTube video IDs (using Rick Astley as a safe default)
  const videoIds = [
    "dQw4w9WgXcQ", // Rick Astley - Never Gonna Give You Up
    "9bZkp7q19f0", // Gangnam Style
    "kJQP7kiw5Fk", // Luis Fonsi - Despacito
  ];

  return {
    id: generateId("lesson"),
    title: `Lesson ${order + 1}: ${faker.hacker.verb()} ${faker.hacker.adjective()} ${faker.hacker.noun()}`,
    slug: faker.helpers
      .slugify(`lesson-${order + 1}-${faker.word.noun()}`)
      .toLowerCase(),
    videoUrl: faker.helpers.arrayElement(videoIds),
    videoProvider: "youtube" as const,
    content: { text: faker.lorem.paragraphs(3) },
    transcription: { text: faker.lorem.paragraphs(5) },
    duration: faker.number.int({ min: 180, max: 1800 }), // 3-30 minutes
    order,
    isPreview: order < 2, // First 2 lessons are preview
    courseId,
    moduleId,
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: new Date(),
  };
}

function generateFakeUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = faker.internet
    .username({ firstName, lastName })
    .toLowerCase();

  return {
    id: generateId("user"),
    name: `${firstName} ${lastName}`,
    username,
    displayUsername: username,
    color: faker.color.rgb(),
    email: faker.internet.email().toLowerCase(),
    emailVerified: true,
    image: faker.image.avatar(),
    role: faker.helpers.arrayElement(["member", "admin"] as const),
    banned: false,
    banReason: null,
    banExpires: null,
    metadata: null,
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: new Date(),
  };
}

function generateFakeEnrollment(userId: string, courseId: string) {
  return {
    id: generateId("enroll"),
    enrollmentType: "individual" as const,
    enrollmentSource: "direct" as const,
    status: faker.helpers.arrayElement(["active", "completed"] as const),
    giftedByUserId: null,
    userId,
    courseId,
    paymentId: null,
    invoiceId: null,
    teamLicenseId: null,
    teamInviteId: null,
    giftedAt: null,
    enrolledAt: faker.date.past({ years: 1 }),
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: new Date(),
  };
}

function generateFakeReview(userId: string, courseId: string) {
  return {
    id: generateId("review"),
    userId,
    courseId,
    rating: faker.number.int({ min: 3, max: 5 }),
    title: faker.lorem.sentence(),
    comment: faker.lorem.paragraph(),
    approved: faker.datatype.boolean(0.8), // 80% approved
    reviewedAt: faker.datatype.boolean(0.8)
      ? faker.date.past({ days: 30 })
      : null,
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: new Date(),
  };
}

function generateFakeSupportTicket(
  userId: string,
  courseId: string,
  lessonId: string,
) {
  return {
    id: generateId("suptick"),
    title: `Issue with ${faker.hacker.noun()}: ${faker.lorem.sentence()}`,
    description: faker.lorem.paragraphs(2),
    repo: faker.helpers.arrayElement([
      "learn-fastify/course-content",
      "fastify/fastify",
    ]),
    priority: faker.helpers.arrayElement(["low", "medium", "high"] as const),
    status: faker.helpers.arrayElement([
      "open",
      "in-progress",
      "resolved",
      "closed",
    ] as const),
    userId,
    assignedToId: null,
    moduleId: null,
    lessonId,
    createdAt: faker.date.past({ days: 90 }),
    updatedAt: new Date(),
  };
}

async function seedDatabase() {
  try {
    // Note: Schema creation and structure is handled by Drizzle migrations
    // which run with search_path set to the test schema in CI
    if (schemaName !== "public") {
      console.log(
        `🔧 Using test schema "${schemaName}" (created by migrations)...`,
      );
      // search_path is already set via connection string options
    }

    // Generate Learn Fastify course data
    console.log("👥 Creating users...");
    const users: ReturnType<typeof generateFakeUser>[] = [];
    for (let i = 0; i < 20; i++) {
      users.push(generateFakeUser());
    }

    // Insert users (search_path is already set to the correct schema)
    for (const user of users) {
      await pool.query(
        `INSERT INTO "user" (id, name, username, display_username, color, email, email_verified, image, role, banned, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          user.id,
          user.name,
          user.username,
          user.displayUsername,
          user.color,
          user.email,
          user.emailVerified,
          user.image,
          user.role,
          user.banned,
          user.createdAt,
          user.updatedAt,
        ],
      );
    }
    console.log(`✅ Created ${users.length} users`);

    // Create courses
    console.log("📚 Creating courses...");
    const authorId = users[0].id;
    const courses: ReturnType<typeof generateFakeCourse>[] = [];
    for (let i = 0; i < 5; i++) {
      courses.push(generateFakeCourse(authorId));
    }

    // Focus on Learn Fastify course
    courses[0].name = "Learn Fastify - Complete Web Framework Course";
    courses[0].slug = "learn-fastify";
    courses[0].description =
      "Master Fastify, the fast and low overhead web framework for Node.js. Build high-performance APIs and web applications.";
    courses[0].level = "Intermediate";
    courses[0].published = true;

    for (const course of courses) {
      await pool.query(
        `INSERT INTO course (id, slug, name, description, level, thumbnail_url, published, is_free, price, price_currency, is_sale_active, sale_price, total_enrollments, average_rating, total_reviews, total_modules, total_lessons, total_duration, trial_module_limit, author_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [
          course.id,
          course.slug,
          course.name,
          course.description,
          course.level,
          course.thumbnailUrl,
          course.published,
          course.isFree,
          course.price,
          course.priceCurrency,
          course.isSaleActive,
          course.salePrice,
          course.totalEnrollments,
          course.averageRating,
          course.totalReviews,
          course.totalModules,
          course.totalLessons,
          course.totalDuration,
          course.trialModuleLimit,
          course.authorId,
          course.createdAt,
          course.updatedAt,
        ],
      );
    }
    console.log(`✅ Created ${courses.length} courses`);

    // Create modules and lessons for each course
    console.log("📖 Creating modules and lessons...");
    const allLessons: ReturnType<typeof generateFakeLesson>[] = [];

    for (const course of courses) {
      const moduleCount = faker.number.int({ min: 3, max: 6 });
      let totalDuration = 0;
      let totalLessons = 0;

      for (let m = 0; m < moduleCount; m++) {
        const module = generateFakeModule(course.id, m);

        await pool.query(
          `INSERT INTO course_module (id, title, slug, description, "order", is_preview, course_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            module.id,
            module.title,
            module.slug,
            module.description,
            module.order,
            module.isPreview,
            module.courseId,
            module.createdAt,
            module.updatedAt,
          ],
        );

        const lessonCount = faker.number.int({ min: 3, max: 8 });
        for (let l = 0; l < lessonCount; l++) {
          const lesson = generateFakeLesson(course.id, module.id, l);
          allLessons.push(lesson);
          totalDuration += lesson.duration;
          totalLessons++;

          await pool.query(
            `INSERT INTO course_lesson (id, title, slug, video_url, video_provider, content, transcription, duration, "order", is_preview, course_id, module_id, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
              lesson.id,
              lesson.title,
              lesson.slug,
              lesson.videoUrl,
              lesson.videoProvider,
              JSON.stringify(lesson.content),
              JSON.stringify(lesson.transcription),
              lesson.duration,
              lesson.order,
              lesson.isPreview,
              lesson.courseId,
              lesson.moduleId,
              lesson.createdAt,
              lesson.updatedAt,
            ],
          );
        }
      }

      // Update course totals
      await pool.query(
        `UPDATE "${schemaName}".course SET total_modules = $1, total_lessons = $2, total_duration = $3 WHERE id = $4`,
        [moduleCount, totalLessons, totalDuration, course.id],
      );
    }
    console.log(`✅ Created modules and ${allLessons.length} lessons`);

    // Create enrollments
    console.log("🎓 Creating enrollments...");
    const enrollments: ReturnType<typeof generateFakeEnrollment>[] = [];
    // Enroll 10 users in the first course (Learn Fastify)
    for (let i = 0; i < 10; i++) {
      const enrollment = generateFakeEnrollment(users[i].id, courses[0].id);
      enrollments.push(enrollment);

      await pool.query(
        `INSERT INTO enrollment (id, enrollment_type, enrollment_source, status, user_id, course_id, enrolled_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          enrollment.id,
          enrollment.enrollmentType,
          enrollment.enrollmentSource,
          enrollment.status,
          enrollment.userId,
          enrollment.courseId,
          enrollment.enrolledAt,
          enrollment.createdAt,
          enrollment.updatedAt,
        ],
      );
    }
    console.log(`✅ Created ${enrollments.length} enrollments`);

    // Create reviews
    console.log("⭐ Creating reviews...");
    for (let i = 0; i < 8; i++) {
      const review = generateFakeReview(users[i].id, courses[0].id);

      await pool.query(
        `INSERT INTO course_review (id, user_id, course_id, rating, title, comment, approved, reviewed_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          review.id,
          review.userId,
          review.courseId,
          review.rating,
          review.title,
          review.comment,
          review.approved,
          review.reviewedAt,
          review.createdAt,
          review.updatedAt,
        ],
      );
    }
    console.log("✅ Created reviews");

    // Create support tickets for lessons
    console.log("🎫 Creating support tickets...");
    const learnFastifyLessons = allLessons.filter(
      (l) => l.courseId === courses[0].id,
    );
    for (let i = 0; i < 5; i++) {
      const lesson = faker.helpers.arrayElement(learnFastifyLessons);
      const ticket = generateFakeSupportTicket(
        users[i].id,
        courses[0].id,
        lesson.id,
      );

      await pool.query(
        `INSERT INTO support_ticket (id, title, description, repo, priority, status, user_id, lesson_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          ticket.id,
          ticket.title,
          ticket.description,
          ticket.repo,
          ticket.priority,
          ticket.status,
          ticket.userId,
          ticket.lessonId,
          ticket.createdAt,
          ticket.updatedAt,
        ],
      );
    }
    console.log("✅ Created support tickets");

    console.log(`\n🎉 Database seeding complete for schema: ${schemaName}`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${courses.length} courses`);
    console.log(`   - ${allLessons.length} lessons`);
    console.log(`   - ${enrollments.length} enrollments`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seeding
seedDatabase().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
