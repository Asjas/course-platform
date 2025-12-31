import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "~/db/index.js";
import { directMessageConversation } from "~/db/schema/directMessages.js";

/**
 * Validates that a user has access to a DM conversation
 * Returns the conversation if valid, throws TRPCError otherwise
 */
export async function validateDMConversationAccess(
  conversationId: string,
  userId: string,
  userRole: string,
  allowWriteOnly = false,
) {
  const conversation = await db.query.directMessageConversation.findFirst({
    where: eq(directMessageConversation.id, conversationId),
  });

  if (!conversation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Conversation not found",
    });
  }

  const isParticipant =
    conversation.user1Id === userId || conversation.user2Id === userId;
  const isAdmin = userRole === "admin";

  if (allowWriteOnly) {
    // For write operations (posting messages), only participants allowed
    if (!isParticipant) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Unauthorized: You can only send messages in your own conversations",
      });
    }
  } else {
    // For read operations, both participants and admins allowed
    if (!isParticipant && !isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Unauthorized: You do not have access to this conversation",
      });
    }
  }

  return conversation;
}
