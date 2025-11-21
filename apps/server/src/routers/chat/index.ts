import { tracked } from "@trpc/server";
import { ulid } from "ulid";
import * as z from "zod";
import { redis, subscriptionRedis } from "~/lib/redis.js";
import { isAuthenticated, publicProcedure, router } from "~/router.js";

export interface ChatMessage {
  id: string;
  message: string;
  name: string;
  username: string | null;
  timestamp: number;
  createdAt: number;
  editedAt?: number;
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

      let lastId =
        input.lastEventId ?? (input.lastEventId === undefined ? "0" : "$");

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

            const payload: ChatMessage = JSON.parse(fields[1]) as ChatMessage;
            const messageId = payload.id; // ULID

            // Update lastId to Redis stream ID
            lastId = streamId;

            yield tracked(messageId, payload); // tRPC tracks by ULID
          }
        } catch (err) {
          if (
            err instanceof Error &&
            err.message.includes("Invalid stream ID")
          ) {
            lastId = "$"; // fallback
            continue;
          }
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

      const messages = entries.map(
        ([, fields]) => JSON.parse(fields[1]) as ChatMessage,
      );

      // Sort by creation time (ULID or createdAt field)
      return messages.sort((a, b) => {
        if ("createdAt" in a && "createdAt" in b) {
          return (a.createdAt ?? 0) - (b.createdAt ?? 0);
        }
        return a.id.localeCompare(b.id);
      });
    }),
  postMessage: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ channelId: z.string(), message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ulidVal = ulid();
      const id = `msg:${ulidVal}`;

      const payload: ChatMessage = {
        id,
        name: ctx.user.name,
        username: ctx.user.username,
        message: input.message,
        timestamp: Date.now(),
        createdAt: Date.now(),
      };

      const streamId = await redis.xadd(
        `chat:channel:${input.channelId}:messages`,
        "*",
        "message",
        JSON.stringify(payload),
      );

      return { ...payload, streamId };
    }),
  editMessage: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ id: z.string(), message: z.string() }))
    .mutation(async ({ input }) => {
      const pattern = `chat:channel:*:messages`;
      const keys = await redis.keys(pattern);

      for (const streamKey of keys) {
        const entries = await redis.xrange(streamKey, "-", "+");

        for (const [streamId, fields] of entries) {
          const payload: ChatMessage = JSON.parse(fields[1]) as ChatMessage;

          if (payload.id === input.id) {
            await redis.xdel(streamKey, streamId);

            const updated: ChatMessage = {
              ...payload,
              message: input.message,
              editedAt: Date.now(),
            };

            await redis.xadd(
              streamKey,
              "*",
              "message",
              JSON.stringify(updated),
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

      for (const key of streamKeys) {
        const entries = await redis.xrange(key, "-", "+");

        for (const [streamId, fields] of entries) {
          const messageJson = fields[1];
          const message: ChatMessage = JSON.parse(messageJson) as ChatMessage;

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
