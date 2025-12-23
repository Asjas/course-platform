/**
 * Database Seeding Script with Hardcoded Fixtures
 *
 * This script loads deterministic test data from fixture files,
 * ensuring consistent and reliable test data across all runs.
 *
 * Usage:
 *   tsx scripts/seed-test-data.ts [schema_name]
 *
 * The schema_name defaults to "public" but can be set to any schema (e.g., "test_pr_123")
 * to support concurrent test runs in CI.
 */
import {
  testCourses,
  testEnrollments,
  testLessons,
  testModules,
  testReviews,
  testSupportTickets,
  testUsers,
} from "./fixtures/index.js";
import pg from "pg";

const { Pool } = pg;

// Get schema name from command line or use public
const schemaName = process.argv[2] || "public";
const databaseUrl =
  process.env.DATABASE_URL || "postgresql://localhost:5432/course_platform";

console.log(`🌱 Seeding database schema: ${schemaName}`);

// Create database connection with search_path set to the target schema
let connectionString = databaseUrl;
if (schemaName !== "public") {
  const separator = databaseUrl.includes("?") ? "&" : "?";
  const encodedSchemaName = encodeURIComponent(schemaName);
  connectionString = `${databaseUrl}${separator}options=-c%20search_path%3D${encodedSchemaName}`;
}

const pool = new Pool({
  connectionString,
});

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log(
      `🔧 Using test schema "${schemaName}" (created by migrations)...`,
    );

    // Create ghost user first (required for foreign keys)
    console.log("👻 Creating default ghost user...");
    await client.query(`
      INSERT INTO "user" (id, email, name, email_verified, image, created_at, updated_at)
      VALUES ('ghost', 'ghost@system.local', 'System Ghost User', true, null, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert users
    console.log("👥 Creating users...");
    for (const user of testUsers) {
      await client.query(
        `
        INSERT INTO "user" (id, email, name, email_verified, image, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING;
      `,
        [
          user.id,
          user.email,
          user.name,
          user.emailVerified,
          user.image,
          user.createdAt,
          user.updatedAt,
        ],
      );
    }
    console.log(`✅ Created ${testUsers.length} users`);

    // Insert courses
    console.log("📚 Creating courses...");
    for (const course of testCourses) {
      await client.query(
        `
        INSERT INTO course (
          id, slug, name, description, level, thumbnail_url, published,
          is_free, price, price_currency, is_sale_active, sale_price,
          sale_start_at, sale_expires_at, total_enrollments, average_rating,
          total_reviews, total_modules, total_lessons, total_duration,
          trial_module_limit, author_id, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
        )
        ON CONFLICT (id) DO NOTHING;
      `,
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
          course.saleStartAt,
          course.saleExpiresAt,
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
    console.log(`✅ Created ${testCourses.length} courses`);

    // Insert modules
    console.log("📖 Creating modules...");
    for (const module of testModules) {
      await client.query(
        `
        INSERT INTO course_module (
          id, course_id, title, slug, description, "order", is_preview,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING;
      `,
        [
          module.id,
          module.courseId,
          module.title,
          module.slug,
          module.description,
          module.order,
          module.isPreview,
          module.createdAt,
          module.updatedAt,
        ],
      );
    }
    console.log(`✅ Created ${testModules.length} modules`);

    // Insert lessons
    console.log("📝 Creating lessons...");
    for (const lesson of testLessons) {
      await client.query(
        `
        INSERT INTO course_lesson (
          id, module_id, course_id, title, description, content,
          video_url, duration, "order", is_free, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING;
      `,
        [
          lesson.id,
          lesson.moduleId,
          lesson.courseId,
          lesson.title,
          lesson.description,
          lesson.content,
          lesson.videoUrl,
          lesson.duration,
          lesson.order,
          lesson.isFree,
          lesson.createdAt,
          lesson.updatedAt,
        ],
      );
    }
    console.log(`✅ Created ${testLessons.length} lessons`);

    // Insert enrollments
    console.log("🎓 Creating enrollments...");
    for (const enrollment of testEnrollments) {
      await client.query(
        `
        INSERT INTO enrollment (
          id, user_id, course_id, status, progress_percentage,
          last_accessed_at, completed_at, gifted_by_user_id,
          enrolled_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING;
      `,
        [
          enrollment.id,
          enrollment.userId,
          enrollment.courseId,
          enrollment.status,
          enrollment.progressPercentage,
          enrollment.lastAccessedAt,
          enrollment.completedAt,
          enrollment.giftedByUserId,
          enrollment.enrolledAt,
          enrollment.createdAt,
          enrollment.updatedAt,
        ],
      );
    }
    console.log(`✅ Created ${testEnrollments.length} enrollments`);

    // Insert reviews
    console.log("⭐ Creating reviews...");
    for (const review of testReviews) {
      await client.query(
        `
        INSERT INTO course_review (
          id, user_id, course_id, rating, title, comment,
          approved, reviewed_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING;
      `,
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
    console.log(`✅ Created ${testReviews.length} reviews`);

    // Insert support tickets
    console.log("🎫 Creating support tickets...");
    for (const ticket of testSupportTickets) {
      await client.query(
        `
        INSERT INTO support_ticket (
          id, title, description, category, status, priority,
          course_id, module_id, lesson_id, user_id, assigned_to_user_id,
          resolved_at, closed_at, assigned_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO NOTHING;
      `,
        [
          ticket.id,
          ticket.title,
          ticket.description,
          ticket.category,
          ticket.status,
          ticket.priority,
          ticket.courseId,
          ticket.moduleId,
          ticket.lessonId,
          ticket.userId,
          ticket.assignedToUserId,
          ticket.resolvedAt,
          ticket.closedAt,
          ticket.assignedAt,
          ticket.createdAt,
          ticket.updatedAt,
        ],
      );
    }
    console.log(`✅ Created ${testSupportTickets.length} support tickets`);

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log("🎉 Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
