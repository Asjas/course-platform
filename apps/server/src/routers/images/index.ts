import * as z from "zod";
import { generatePresignedUploadUrl } from "~/lib/r2-upload.js";
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
});
