import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import * as z from "zod";
import config from "~/config.js";
import { db } from "~/db/index.js";
import {
  createCourseWishlistEntry,
  createCourseWishlistVerificationToken,
  unsubscribeCourseWishlistEntry,
} from "~/db/mutations/courseWishlist.js";
import {
  getCourseWishlistByEmailAndCourse,
  getCourseWishlistById,
  getCourseWishlistCount,
} from "~/db/queries/courseWishlist.js";
import { course, courseWishlist } from "~/db/schema/course.js";
import mailer from "~/lib/mailer.js";
import { publicProcedure, router } from "~/router.js";

function firstForwardedHeaderValue(value: string | string[] | undefined) {
  if (!value) {
    return undefined;
  }

  const rawValue = Array.isArray(value) ? value[0] : value;
  const firstValue = rawValue.split(",")[0]?.trim();

  return firstValue ? firstValue : undefined;
}

function resolveVerificationApiOrigin(
  request:
    | {
        headers: Record<string, string | string[] | undefined>;
        protocol?: string;
      }
    | undefined,
) {
  const forwardedHost = firstForwardedHeaderValue(
    request?.headers["x-forwarded-host"],
  );
  const host =
    forwardedHost ?? firstForwardedHeaderValue(request?.headers.host);
  const forwardedProto = firstForwardedHeaderValue(
    request?.headers["x-forwarded-proto"],
  );
  const protocol = forwardedProto ?? request?.protocol;

  if (host && protocol) {
    return `${protocol}://${host}`;
  }

  return (
    config.ORIGIN.find((url) => url.includes("api.")) ??
    "https://api.codewizard.training"
  );
}

const signupInputSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
  courseSlug: z.string().min(1),
  resend: z.boolean().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export const courseWishlistRouter = router({
  signup: publicProcedure
    .input(signupInputSchema)
    .mutation(async ({ input, ctx }) => {
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
        if (!input.resend) {
          return {
            success: true,
            status: "email_already_sent" as const,
            message: "Email has already been sent, check spam/junk folders.",
            alreadySignedUp: true,
            canResend: true,
          };
        }

        // If a previously canceled signup asks for resend, reactivate it.
        if (existing.unsubscribedAt) {
          await db
            .update(courseWishlist)
            .set({ unsubscribedAt: null })
            .where(eq(courseWishlist.id, existing.id));
        }

        const verificationToken = await createCourseWishlistVerificationToken(
          existing.id,
        );
        const origin = resolveVerificationApiOrigin(
          ctx.request as
            | {
                headers: Record<string, string | string[] | undefined>;
                protocol?: string;
              }
            | undefined,
        );
        const verifyUrl = new URL("/verify-course-wishlist", origin);
        verifyUrl.searchParams.set("token", verificationToken.token);

        await mailer.sendMail({
          sender: "Codewizard Training <contact@codewizard.training>",
          replyTo: "contact@codewizard.training",
          to: input.email,
          subject: `Your ${courseResult.name} verification email`,
          html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">Verification email resent</h1>
            <p>Hey${input.name ? ` ${input.name}` : ""}!</p>
            <p>As requested, we sent a fresh verification link for <strong>${courseResult.name}</strong>.</p>
            <p>
              <a href="${verifyUrl.toString()}" style="display: inline-block; background: #10b981; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Verify my email
              </a>
            </p>
            <p style="word-break: break-word; font-size: 13px; color: #666;">${verifyUrl.toString()}</p>
          </body>
          </html>
        `,
        });

        return {
          success: true,
          status: "email_resent" as const,
          message: "Verification email has been resent.",
          alreadySignedUp: true,
          canResend: true,
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
        const verificationToken = await createCourseWishlistVerificationToken(
          entry.id,
        );
        const origin = resolveVerificationApiOrigin(
          ctx.request as
            | {
                headers: Record<string, string | string[] | undefined>;
                protocol?: string;
              }
            | undefined,
        );
        const verifyUrl = new URL("/verify-course-wishlist", origin);
        verifyUrl.searchParams.set("token", verificationToken.token);

        await mailer.sendMail({
          sender: "Codewizard Training <contact@codewizard.training>",
          replyTo: "contact@codewizard.training",
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
              <li>Early access pricing (save up to 30%)</li>
              <li>Launch updates and sneak peeks</li>
            </ul>

            <p style="margin-top: 24px;">Please verify your email to confirm you're a real person and complete your waitlist signup:</p>
            <p>
              <a href="${verifyUrl.toString()}" style="display: inline-block; background: #10b981; color: #ffffff; padding: 12px 18px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Verify my email
              </a>
            </p>
            <p style="color: #666; font-size: 13px;">If the button does not work, copy and paste this URL into your browser:</p>
            <p style="word-break: break-word; font-size: 13px; color: #666;">${verifyUrl.toString()}</p>

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
        status: "signup_accepted" as const,
        message: "That signup has been accepted.",
        id: entry.id,
        alreadySignedUp: false,
        canResend: false,
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
