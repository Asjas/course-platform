import {
  type AllEarlySignups,
  getAllEarlySignups,
  getEarlySignupById,
} from "./queries.js";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import * as z from "zod";
import config from "~/config.js";
import { db } from "~/db/index.js";
import { courseWishlist } from "~/db/schema/course.js";
import { earlySignup } from "~/db/schema/earlySignup.js";
import mailer from "~/lib/mailer.js";
import { isAdmin, publicProcedure, router } from "~/router.js";

export const earlySignupsRouter = router({
  getAll: publicProcedure
    .use(isAdmin)
    .query(async ({ ctx }): Promise<AllEarlySignups> => {
      const fastify = ctx.reply.server;

      const [err, signups] = await fastify.to(getAllEarlySignups());

      if (err) {
        fastify.log.error(err, "Failed to fetch all early signups");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return signups;
    }),

  sendInvite: publicProcedure
    .input(z.object({ id: z.string() }))
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [findErr, signup] = await fastify.to(
        getEarlySignupById({ id: input.id }),
      );

      if (findErr) {
        fastify.log.error(findErr, "Failed to find early signup");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      if (!signup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Early signup not found",
        });
      }

      if (signup.confirmedAt) {
        return { success: true };
      }

      const origin = config.ORIGIN[0] ?? "https://codewizard.training";
      const signupUrl = new URL("/signup", origin).toString();

      const [mailErr] = await fastify.to(
        mailer.sendMail({
          sender: "Codewizard Training <support@codewizard.training>",
          replyTo: "support@codewizard.training",
          to: signup.email,
          subject: "You're invited to join Codewizard Training!",
          text: [
            `Hi ${signup.name || "there"},`,
            "",
            "You're invited to join Codewizard Training! Click the link below to create your account and get started:",
            "",
            signupUrl,
            "",
            "If you did not sign up for early access, please ignore this email.",
            "",
            "--",
            `© ${new Date().getFullYear()} Codewizard Training. All rights reserved.`,
          ].join("\n"),
        }),
      );

      if (mailErr) {
        fastify.log.error(mailErr, "Failed to send invite email");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send invite email",
        });
      }

      const [updateErr] = await fastify.to(
        signup.sourceTable === "course_wishlist"
          ? db
              .update(courseWishlist)
              .set({ confirmedAt: new Date() })
              .where(eq(courseWishlist.id, input.id))
          : db
              .update(earlySignup)
              .set({ confirmedAt: new Date() })
              .where(eq(earlySignup.id, input.id)),
      );

      if (updateErr) {
        fastify.log.error(
          updateErr,
          "Failed to update early signup confirmedAt",
        );

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return { success: true };
    }),

  cancelInvite: publicProcedure
    .input(z.object({ id: z.string() }))
    .use(isAdmin)
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      const [findErr, signup] = await fastify.to(
        getEarlySignupById({ id: input.id }),
      );

      if (findErr) {
        fastify.log.error(findErr, "Failed to find early signup");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      if (!signup) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Early signup not found",
        });
      }

      if (signup.unsubscribedAt) {
        return { success: true };
      }

      const [updateErr] = await fastify.to(
        signup.sourceTable === "course_wishlist"
          ? db
              .update(courseWishlist)
              .set({ unsubscribedAt: new Date() })
              .where(eq(courseWishlist.id, input.id))
          : db
              .update(earlySignup)
              .set({ unsubscribedAt: new Date() })
              .where(eq(earlySignup.id, input.id)),
      );

      if (updateErr) {
        fastify.log.error(updateErr, "Failed to cancel early signup invite");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }

      return { success: true };
    }),
});
