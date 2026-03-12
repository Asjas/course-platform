import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import * as z from "zod";
import { db } from "~/db/index.js";
import {
  createCourseWishlistEntry,
  unsubscribeCourseWishlistEntry,
} from "~/db/mutations/courseWishlist.js";
import {
  getCourseWishlistByEmailAndCourse,
  getCourseWishlistById,
  getCourseWishlistCount,
} from "~/db/queries/courseWishlist.js";
import { course } from "~/db/schema/course.js";
import mailer from "~/lib/mailer.js";
import { publicProcedure, router } from "~/router.js";

const signupInputSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
  courseSlug: z.string().min(1),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export const courseWishlistRouter = router({
  signup: publicProcedure
    .input(signupInputSchema)
    .mutation(async ({ input }) => {
      // Look up course by slug
      const courseResult = await db.query.course.findFirst({
        where: eq(course.slug, input.courseSlug),
      });

      if (!courseResult) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      // Check if already signed up
      const existing = await getCourseWishlistByEmailAndCourse(
        input.email,
        courseResult.id,
      );

      if (existing) {
        // Already signed up - return success without error
        return {
          success: true,
          message: "You're already on the wishlist!",
          alreadySignedUp: true,
        };
      }

      // Create new wishlist entry
      const entry = await createCourseWishlistEntry({
        email: input.email,
        name: input.name,
        courseId: courseResult.id,
        referrer: input.referrer,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
      });

      // Send welcome email
      try {
        await mailer.sendMail({
          sender: "Codewizard Training <support@codewizard.training>",
          replyTo: "support@codewizard.training",
          to: input.email,
          subject: `You're on the ${courseResult.name} waitlist!`,
          html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin: 0;">🎉 You're In!</h1>
            </div>

            <p>Hey${input.name ? ` ${input.name}` : ""}!</p>

            <p>Thanks for joining the <strong>${courseResult.name}</strong> waitlist. You'll be the first to know when we launch!</p>

            <p>Here's what you can expect:</p>
            <ul style="padding-left: 20px;">
              <li>Early access pricing (save up to 40%)</li>
              <li>Exclusive bonus content for early supporters</li>
              <li>Launch updates and sneak peeks</li>
            </ul>

            <p style="margin-top: 30px;">In the meantime, feel free to reply to this email if you have any questions!</p>

            <p style="color: #666; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              If you didn't sign up for this, you can safely ignore this email.
            </p>
          </body>
          </html>
        `,
        });
      } catch (error) {
        // Log but don't fail the signup if email fails
        console.error("Failed to send welcome email:", error);
      }

      return {
        success: true,
        message: "Welcome to the waitlist!",
        id: entry?.id,
        alreadySignedUp: false,
      };
    }),

  getCount: publicProcedure
    .input(z.object({ courseSlug: z.string().min(1) }))
    .query(async ({ input }) => {
      // Look up course by slug
      const courseResult = await db.query.course.findFirst({
        where: eq(course.slug, input.courseSlug),
      });

      if (!courseResult) {
        return { count: 0 };
      }

      const count = await getCourseWishlistCount(courseResult.id);
      return { count };
    }),

  unsubscribe: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const entry = await getCourseWishlistById(input.id);

      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Entry not found",
        });
      }

      await unsubscribeCourseWishlistEntry(input.id);

      return {
        success: true,
        message: "You have been unsubscribed",
      };
    }),
});
