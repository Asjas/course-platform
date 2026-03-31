import type {
  ChannelMessages,
  DMMessages,
  ThreadReplies,
} from "@apps/server/src/routers/chat/queries";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { toast } from "sonner";
import { queryClient } from "~/lib/query.client";
import { trpc, trpcClient } from "~/lib/trpc.client";

// Derive single message types from array types
export type ChannelMessage = ChannelMessages[number];
export type DMMessage = DMMessages[number];
export type ThreadMessage = ThreadReplies[number];

// Union type for all chat messages
export type ChatMessage = ChannelMessage | DMMessage;

// Re-export Reaction type from server for frontend use
export type { Reaction, ReactionUpdate } from "@apps/server/src/routers/chat";

// Channel Messages Collection - stores messages for a specific channel
// Uses tRPC queryKey for proper cache integration
export function createChannelMessagesCollection(channelId: string) {
  return createCollection(
    queryCollectionOptions<ChannelMessage>({
      queryClient,
      getKey: (item) => item.id,
      queryKey: trpc.chat.getChannelHistory.queryKey({ channelId, limit: 50 }),
      queryFn: async () => {
        // Fetch from server using tRPC
        return trpcClient.chat.getChannelHistory.query({ channelId });
      },
      onInsert: async ({ transaction }) => {
        try {
          const { modified } = transaction.mutations[0];

          if (!modified.channelId) {
            throw new Error("Channel ID is required for channel messages");
          }

          await trpcClient.chat.postMessage.mutate({
            channelId: modified.channelId,
            message: modified.message,
          });
        } catch (error) {
          console.error("Error posting channel message: ", error);
          toast.error(
            "An error occurred while posting the message. Please try again.",
          );
          throw error;
        }
      },
      onDelete: async ({ transaction }) => {
        try {
          const { original } = transaction.mutations[0];

          await trpcClient.chat.deleteMessage.mutate({
            id: original.id,
          });
        } catch (error) {
          console.error("Error deleting message: ", error);
          toast.error(
            "An error occurred while deleting the message. Please try again.",
          );
          throw error;
        }
      },
      onUpdate: async ({ transaction }) => {
        try {
          const { original, modified } = transaction.mutations[0];

          // Skip editMessage call if only reactions changed (not the message text)
          // Reactions are synced separately via toggleReaction endpoint
          if (original.message === modified.message) {
            return;
          }

          await trpcClient.chat.editMessage.mutate({
            id: modified.id,
            message: modified.message,
          });
        } catch (error) {
          console.error("Error editing message: ", error);
          toast.error(
            "An error occurred while editing the message. Please try again.",
          );
          throw error;
        }
      },
    }),
  );
}

// DM Messages Collection - stores messages for a specific conversation
// Uses tRPC queryKey for proper cache integration
export function createDMMessagesCollection(conversationId: string) {
  return createCollection(
    queryCollectionOptions<DMMessage>({
      queryClient,
      getKey: (item) => item.id,
      queryKey: trpc.chat.getDMHistory.queryKey({ conversationId, limit: 50 }),
      queryFn: async () => {
        // Fetch from server using tRPC
        return trpcClient.chat.getDMHistory.query({ conversationId });
      },
      onInsert: async ({ transaction }) => {
        try {
          const { modified } = transaction.mutations[0];

          if (!modified.conversationId) {
            throw new Error("Conversation ID is required for DM messages");
          }

          await trpcClient.chat.postDMMessage.mutate({
            conversationId: modified.conversationId,
            message: modified.message,
          });
        } catch (error) {
          console.error("Error posting DM message: ", error);
          toast.error(
            "An error occurred while posting the message. Please try again.",
          );
          throw error;
        }
      },
      onDelete: async ({ transaction }) => {
        try {
          const { original } = transaction.mutations[0];

          await trpcClient.chat.deleteMessage.mutate({
            id: original.id,
          });
        } catch (error) {
          console.error("Error deleting message: ", error);
          toast.error(
            "An error occurred while deleting the message. Please try again.",
          );
          throw error;
        }
      },
      onUpdate: async ({ transaction }) => {
        try {
          const { original, modified } = transaction.mutations[0];

          // Skip editMessage call if only reactions changed (not the message text)
          // Reactions are synced separately via toggleReaction endpoint
          if (original.message === modified.message) {
            return;
          }

          await trpcClient.chat.editMessage.mutate({
            id: modified.id,
            message: modified.message,
          });
        } catch (error) {
          console.error("Error editing message: ", error);
          toast.error(
            "An error occurred while editing the message. Please try again.",
          );
          throw error;
        }
      },
    }),
  );
}

// Thread Messages Collection - stores replies for a specific parent message
// Uses tRPC queryKey for proper cache integration
export function createThreadMessagesCollection(
  channelId: string,
  parentMessageId: string,
) {
  return createCollection(
    queryCollectionOptions<ThreadMessage>({
      queryClient,
      getKey: (item) => item.id,
      queryKey: trpc.chat.getThreadReplies.queryKey({
        channelId,
        parentMessageId,
        limit: 50,
      }),
      queryFn: async () => {
        return trpcClient.chat.getThreadReplies.query({
          channelId,
          parentMessageId,
        });
      },
      onInsert: async ({ transaction }) => {
        try {
          const { modified } = transaction.mutations[0];

          if (!modified.channelId) {
            throw new Error("Channel ID is required for thread messages");
          }

          await trpcClient.chat.postMessage.mutate({
            channelId: modified.channelId,
            message: modified.message,
            parentMessageId: modified.parentMessageId,
          });
        } catch (error) {
          console.error("Error posting thread message: ", error);
          toast.error(
            "An error occurred while posting the reply. Please try again.",
          );
          throw error;
        }
      },
      onDelete: async ({ transaction }) => {
        try {
          const { original } = transaction.mutations[0];

          await trpcClient.chat.deleteMessage.mutate({
            id: original.id,
          });
        } catch (error) {
          console.error("Error deleting thread message: ", error);
          toast.error(
            "An error occurred while deleting the reply. Please try again.",
          );
          throw error;
        }
      },
      onUpdate: async ({ transaction }) => {
        try {
          const { original, modified } = transaction.mutations[0];

          if (original.message === modified.message) {
            return;
          }

          await trpcClient.chat.editMessage.mutate({
            id: modified.id,
            message: modified.message,
          });
        } catch (error) {
          console.error("Error editing thread message: ", error);
          toast.error(
            "An error occurred while editing the reply. Please try again.",
          );
          throw error;
        }
      },
    }),
  );
}

/**
 * Toggle a reaction on a message.
 * The reaction update is published via SSE to all subscribers.
 */
export async function toggleMessageReaction({
  messageId,
  emoji,
  channelId,
}: {
  messageId: string;
  emoji: string;
  channelId: string;
}) {
  try {
    // Call the server to toggle the reaction
    // Server will publish update to SSE stream for all subscribers
    const updatedReactions = await trpcClient.chat.toggleReaction.mutate({
      messageId,
      emoji,
      channelId,
    });

    return updatedReactions;
  } catch (error) {
    console.error("Error toggling reaction:", error);
    toast.error("Failed to update reaction. Please try again.");
    throw error;
  }
}
