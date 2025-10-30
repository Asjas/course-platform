import * as z from "zod";
import { deleteR2Object, generatePresignedUploadUrl } from "~/lib/r2-upload.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

export const imagesRouter = router({
  getPresignedUrl: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        contentType: z.string(),
        key: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { presignedUrl, publicUrl } = await generatePresignedUploadUrl({
        key: input.key,
        contentType: input.contentType,
      });

      return { presignedUrl, publicUrl };
    }),
  deleteImage: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const fastify = ctx.reply.server;

      await deleteR2Object(input.key);

      fastify.log.debug(`Deleted image from R2: ${input.key}`);

      return { success: true };
    }),
});
