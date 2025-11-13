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
        lastEventId: z.string().nullish(), // this is the Redis stream ID
      }),
    )
    .use(isAuthenticated)
    .subscription(async function* ({ input }) {
      const streamKey = `chat:channel:${input.channelId}:messages`;

      // Start from Redis stream ID: lastEventId, "0", or "$"
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

          for (const [streamId, fields] of entries) {
            // Skip if not newer
            if (lastId !== "$" && !isIdAfter(streamId, lastId)) continue;

            const payload: ChatMessage = JSON.parse(fields[1]);
            const messageId = payload.id; // ULID

            // Update lastId to Redis stream ID
            lastId = streamId;

            console.log("[SSE] →", messageId, `(stream: ${streamId})`);
            yield tracked(messageId, payload); // tRPC tracks by ULID
          }
        } catch (err) {
          if (
            err instanceof Error &&
            err.message.includes("Invalid stream ID")
          ) {
            console.warn("[SSE] Invalid lastEventId, resetting to $");
            lastId = "$"; // fallback
            continue;
          }
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

      return entries.reverse().map(([, fields]) => {
        const payload = JSON.parse(fields[1]);
        return { ...payload, id: payload.id };
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
  editMessage: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string(), message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const streamKey = `chat:channel:*:messages`;
      const streams = await redis.keys(streamKey);

      console.log("Editing message", input.id);

      for (const key of streams) {
        const entries = await redis.xrange(key, "-", "+");
        for (const [, fields] of entries) {
          const payload: ChatMessage = JSON.parse(fields[1]);

          if (payload.id === input.id) {
            const updated = { ...payload, message: input.message };
            await redis.xadd(key, "*", "message", JSON.stringify(updated));

            ctx.request.log.debug(
              `User ${ctx.user.id} edited ${input.id} in ${key}`,
            );
            return updated;
          }
        }
      }

      throw new Error("Message not found");
    }),
  deleteMessage: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const streamKeyPattern = `chat:channel:*:messages`;
      const streamKeys = await redis.keys(streamKeyPattern);

      console.log("Deleting message", input.id);

      for (const key of streamKeys) {
        const entries = await redis.xrange(key, "-", "+");

        for (const [streamId, fields] of entries) {
          const messageJson = fields[1];
          const message: ChatMessage = JSON.parse(messageJson);

          if (message.id === input.id) {
            await redis.xdel(key, streamId);

            ctx.request.log.debug(
              `User ${ctx.user.id} deleted ${input.id} from ${key}`,
            );
            return { success: true };
          }
        }
      }

      throw new Error("Message not found");
    }),
});

function isIdAfter(current: string, previous: string): boolean {
  if (previous === "$") return true;
  if (previous === "0") return true;

  const [cTime, cSeq] = current.split("-").map(Number);
  const [pTime, pSeq] = previous.split("-").map(Number);

  return cTime > pTime || (cTime === pTime && cSeq > pSeq);
}
