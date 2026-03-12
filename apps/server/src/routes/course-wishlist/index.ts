import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
} from "fastify";
import { confirmCourseWishlistEntry } from "~/db/mutations/courseWishlist.js";
import { getCourseWishlistByIdAndEmail } from "~/db/queries/courseWishlist.js";
import { pinoLogger } from "~/lib/logging.js";

const log = pinoLogger.child({ module: "routes:course-wishlist:public" });

interface VerifyQuery {
  email?: string;
  code?: string;
}

function renderMessagePage(title: string, message: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; }
      .card { max-width: 560px; margin: 40px auto; padding: 24px; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
      h1 { margin: 0 0 12px; font-size: 24px; line-height: 1.2; }
      p { margin: 0; line-height: 1.6; }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>${title}</h1>
      <p>${message}</p>
    </main>
  </body>
</html>`;
}

export default function courseWishlistRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes,
) {
  fastify.get(
    "/verify-course-wishlist",
    async (request: FastifyRequest<{ Querystring: VerifyQuery }>, reply) => {
      const email = request.query.email?.trim().toLowerCase();
      const code = request.query.code?.trim();

      if (!email || !code) {
        return reply
          .type("text/html")
          .send(
            renderMessagePage(
              "Invalid verification link",
              "The verification link is missing required information. Please use the latest email we sent you.",
            ),
          );
      }

      try {
        const entry = await getCourseWishlistByIdAndEmail(code, email);

        if (!entry) {
          return reply
            .type("text/html")
            .send(
              renderMessagePage(
                "Verification failed",
                "We could not verify this signup. Please check that you opened the exact link from your email.",
              ),
            );
        }

        if (!entry.confirmedAt) {
          await confirmCourseWishlistEntry(entry.id);
        }

        return reply
          .type("text/html")
          .send(
            renderMessagePage(
              "Email verified",
              "Your early signup has been verified. Thanks for confirming your email.",
            ),
          );
      } catch (error) {
        log.error(
          { error, email, code },
          "Course wishlist verification failed",
        );

        return reply
          .status(500)
          .type("text/html")
          .send(
            renderMessagePage(
              "Something went wrong",
              "We could not verify your signup right now. Please try again in a moment.",
            ),
          );
      }
    },
  );

  done();
}
