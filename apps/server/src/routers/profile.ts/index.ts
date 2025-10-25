import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { generatePresignedUploadUrl } from "~/lib/r2-upload.js";
import { publicProcedure, router } from "~/router.js";

export const profileRouter = router({
  getPresignedUrl: publicProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        contentType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to access this resource",
        });
      }

      const key = `profile_images/${input.filename}`;
      const { presignedUrl, publicUrl } = await generatePresignedUploadUrl({
        key,
        contentType: input.contentType,
      });

      return { presignedUrl, publicUrl };
    }),
});
