import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
} from "fastify";
import {
  confirmCourseWishlistEntry,
  markCourseWishlistVerificationTokenUsed,
} from "~/db/mutations/courseWishlist.js";
import {
  getCourseWishlistById,
  getCourseWishlistVerificationTokenByToken,
} from "~/db/queries/courseWishlist.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "routes:course-wishlist:public" });

interface VerifyQuery {
  token?: string;
}

function resolveFrontendOrigin(origins: string[]): string {
  return (
    origins.find(
      (origin) =>
        origin.includes("codewizard.training") && !origin.includes("api."),
    ) ??
    origins[0] ??
    "https://codewizard.training"
  );
}

function verificationRedirectUrl(origin: string, status: string): string {
  const url = new URL("/verify-course-wishlist", origin);
  url.searchParams.set("status", status);

  return url.toString();
}

export default function courseWishlistRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.get(
    "/verify-course-wishlist",
    async (request: FastifyRequest<{ Querystring: VerifyQuery }>, reply) => {
      const token = request.query.token?.trim();
      const frontendOrigin = resolveFrontendOrigin(fastify.config.ORIGIN);

      if (!token) {
        return reply.redirect(
          verificationRedirectUrl(frontendOrigin, "invalid"),
          302,
        );
      }

      try {
        const tokenEntry =
          await getCourseWishlistVerificationTokenByToken(token);

        if (!tokenEntry) {
          return reply.redirect(
            verificationRedirectUrl(frontendOrigin, "invalid"),
            302,
          );
        }

        if (tokenEntry.usedAt) {
          return reply.redirect(
            verificationRedirectUrl(frontendOrigin, "used"),
            302,
          );
        }

        if (tokenEntry.expiresAt.getTime() <= Date.now()) {
          return reply.redirect(
            verificationRedirectUrl(frontendOrigin, "expired"),
            302,
          );
        }

        const wishlistEntry = await getCourseWishlistById(
          tokenEntry.wishlistId,
        );

        if (!wishlistEntry) {
          return reply.redirect(
            verificationRedirectUrl(frontendOrigin, "invalid"),
            302,
          );
        }

        if (!wishlistEntry.confirmedAt) {
          await confirmCourseWishlistEntry(wishlistEntry.id);
        }

        await markCourseWishlistVerificationTokenUsed(tokenEntry.id);

        return reply.redirect(
          verificationRedirectUrl(frontendOrigin, "verified"),
          302,
        );
      } catch (error) {
        log.error({ error, token }, "Course wishlist verification failed");

        return reply.redirect(
          verificationRedirectUrl(frontendOrigin, "error"),
          302,
        );
      }
    },
  );

  done();
}
