import * as z from "zod";
import { generatePresignedUploadUrl } from "~/lib/r2-upload.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

export const profileRouter = router({
  getPresignedUrl: publicProcedure
    .use(isAuthenticated)
    .input(
      z.object({
        filename: z.string().min(1),
        contentType: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const key = `profile_images/${input.filename}`;
      const { presignedUrl, publicUrl } = await generatePresignedUploadUrl({
        key,
        contentType: input.contentType,
      });

      return { presignedUrl, publicUrl };
    }),
});
