import { tracked } from "@trpc/server";
import { ulid } from "ulid";
import * as z from "zod";
import { redis, subscriptionRedis } from "~/lib/redis.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

export interface ChatMessage {
  id: string;
  message: string;
  name: string;
  username: string | undefined;
  timestamp: number;
}

export const chatRouter = router({
  getChannelMessages: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
        lastEventId: z.string().nullish(),
      }),
    )
    .use(isAuthenticated)
    .subscription(async function* ({ input }) {
      const streamKey = `chat:channel:${input.channelId}:messages`;

      // Start from:
      // - lastEventId (resume)
      // - "0" to get *all* existing messages
      // - "$" only on the very first connection
      let lastId =
        input.lastEventId ?? (input.lastEventId === undefined ? "0" : "$");

      console.log("[SSE] Subscribed to", streamKey, "from", lastId);

      while (true) {
        try {
          const result = await subscriptionRedis.xread(
            "COUNT",
            100,
            "BLOCK",
            5000,
            "STREAMS",
            streamKey,
            lastId,
          );

          if (!result?.length) continue;

          const [[, entries]] = result;

          for (const [id, fields] of entries) {
            if (lastId !== "$" && !isIdAfter(id, lastId)) continue;

            const message: ChatMessage = JSON.parse(fields[1]);
            lastId = id;

            console.log("[SSE] →", id);
            yield tracked(id, message);
          }
        } catch (err) {
          console.error("[SSE] Redis error:", err);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }),
  getChannelHistory: publicProcedure
    .input(z.object({ channelId: z.string(), limit: z.number().default(50) }))
    .use(isAuthenticated)
    .query(async ({ input }) => {
      const streamKey = `chat:channel:${input.channelId}:messages`;
      const entries = await redis.xrevrange(
        streamKey,
        "+",
        "-",
        "COUNT",
        input.limit,
      );

      return entries.reverse().map(([id, fields]) => {
        const msg = JSON.parse(fields[1]);
        return { ...msg, id };
      });
    }),
  postMessage: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ channelId: z.string(), message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const id = `msg:${ulid()}`;
      const payload = {
        id,
        name: ctx.user.name,
        username: ctx.user.username,
        message: input.message,
        timestamp: Date.now(),
      };

      await redis.xadd(
        `chat:channel:${input.channelId}:messages`,
        "*",
        "message",
        JSON.stringify(payload),
      );

      ctx.request.log.debug(
        `User ${ctx.user.id} posted ${id} → ${input.channelId}`,
      );

      return payload;
    }),
});

function isIdAfter(current: string, previous: string): boolean {
  if (previous === "$") return true;
  const [cTime, cSeq] = current.split("-").map(Number);
  const [pTime, pSeq] = previous.split("-").map(Number);
  return cTime > pTime || (cTime === pTime && cSeq > pSeq);
}
