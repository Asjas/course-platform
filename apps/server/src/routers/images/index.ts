import * as z from "zod";
import {
  externalServiceCount,
  externalServiceDuration,
  externalServiceErrors,
} from "~/lib/external-metrics.js";
import { deleteR2Object, generatePresignedUploadUrl } from "~/lib/r2-upload.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

export const imagesRouter = router({
  getPresignedUrl: publicProcedure
    .input(
      z.object({
        contentType: z.string(),
        key: z.string(),
      }),
    )
    .use(isAuthenticated)
    .mutation(async ({ input }) => {
      const start = process.hrtime.bigint();

      try {
        const { presignedUrl, publicUrl } = await generatePresignedUploadUrl({
          key: input.key,
          contentType: input.contentType,
        });

        const duration = Number(process.hrtime.bigint() - start) / 1e9;
        externalServiceDuration.observe(
          { service: "r2", operation: "presign" },
          duration,
        );
        externalServiceCount.inc({
          service: "r2",
          operation: "presign",
          status: "success",
        });

        return { presignedUrl, publicUrl };
      } catch (error) {
        externalServiceCount.inc({
          service: "r2",
          operation: "presign",
          status: "error",
        });
        externalServiceErrors.inc({
          service: "r2",
          operation: "presign",
          error_type: error instanceof Error ? error.name : "unknown",
        });
        throw error;
      }
    }),
  deleteImage: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;
      const start = process.hrtime.bigint();

      try {
        await deleteR2Object(input.key);

        const duration = Number(process.hrtime.bigint() - start) / 1e9;
        externalServiceDuration.observe(
          { service: "r2", operation: "delete" },
          duration,
        );
        externalServiceCount.inc({
          service: "r2",
          operation: "delete",
          status: "success",
        });

        fastify.log.debug(`Deleted image from R2: ${input.key}`);

        return { success: true };
      } catch (error) {
        externalServiceCount.inc({
          service: "r2",
          operation: "delete",
          status: "error",
        });
        externalServiceErrors.inc({
          service: "r2",
          operation: "delete",
          error_type: error instanceof Error ? error.name : "unknown",
        });
        throw error;
      }
    }),
});
