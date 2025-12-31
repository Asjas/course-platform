import { and, desc, eq, isNull, not, or } from "drizzle-orm";
import { db } from "~/db/index.js";
import {
  directMessageConversation,
  directMessageRequest,
} from "~/db/schema/directMessages.js";
import { user } from "~/db/schema/user.js";

/**
 * Get pending DM requests for a user
 */
export async function getPendingDMRequests(userId: string) {
  return db.query.directMessageRequest.findMany({
    where: and(
      eq(directMessageRequest.recipientId, userId),
      eq(directMessageRequest.status, "pending"),
    ),
    with: {
      requester: {
        columns: {
          id: true,
          name: true,
          username: true,
          displayUsername: true,
          color: true,
          image: true,
        },
      },
    },
    orderBy: [desc(directMessageRequest.createdAt)],
  });
}

export type PendingDMRequests = Awaited<
  ReturnType<typeof getPendingDMRequests>
>;

/**
 * Get a specific DM request by ID
 */
export async function getDMRequestById(requestId: string) {
  return db.query.directMessageRequest.findFirst({
    where: eq(directMessageRequest.id, requestId),
    with: {
      requester: {
        columns: {
          id: true,
          name: true,
          username: true,
          displayUsername: true,
          color: true,
          image: true,
        },
      },
      recipient: {
        columns: {
          id: true,
          name: true,
          username: true,
          displayUsername: true,
          color: true,
          image: true,
          role: true,
        },
      },
    },
  });
}

export type DMRequestById = Awaited<ReturnType<typeof getDMRequestById>>;

/**
 * Get active DM conversations for a user (not closed by them)
 */
export async function getActiveConversationsForUser(userId: string) {
  // Fetch all conversations where user is involved and hasn't closed them
  const conversations = await db.query.directMessageConversation.findMany({
    where: and(
      or(
        eq(directMessageConversation.user1Id, userId),
        eq(directMessageConversation.user2Id, userId),
      ),
      or(
        and(
          eq(directMessageConversation.user1Id, userId),
          eq(directMessageConversation.user1Closed, false),
        ),
        and(
          eq(directMessageConversation.user2Id, userId),
          eq(directMessageConversation.user2Closed, false),
        ),
      ),
    ),
    with: {
      user1: {
        columns: {
          id: true,
          name: true,
          username: true,
          displayUsername: true,
          color: true,
          image: true,
        },
      },
      user2: {
        columns: {
          id: true,
          name: true,
          username: true,
          displayUsername: true,
          color: true,
          image: true,
        },
      },
    },
    orderBy: [desc(directMessageConversation.updatedAt)],
  });

  // Transform to include the other user's info
  return conversations.map((conv) => {
    const isUser1 = conv.user1Id === userId;
    const otherUser = isUser1 ? conv.user2 : conv.user1;

    return {
      id: conv.id,
      user1Id: conv.user1Id,
      user2Id: conv.user2Id,
      user1Closed: conv.user1Closed,
      user2Closed: conv.user2Closed,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      otherUserId: otherUser.id,
      otherUserName: otherUser.name,
      otherUserUsername: otherUser.username,
      otherUserDisplayUsername: otherUser.displayUsername,
      otherUserColor: otherUser.color,
      otherUserImage: otherUser.image,
    };
  });
}

export type ActiveConversations = Awaited<
  ReturnType<typeof getActiveConversationsForUser>
>;

/**
 * Get a DM conversation by ID
 */
export async function getConversationById(conversationId: string) {
  return db.query.directMessageConversation.findFirst({
    where: eq(directMessageConversation.id, conversationId),
    with: {
      user1: {
        columns: {
          id: true,
          name: true,
          username: true,
          displayUsername: true,
          color: true,
          image: true,
        },
      },
      user2: {
        columns: {
          id: true,
          name: true,
          username: true,
          displayUsername: true,
          color: true,
          image: true,
        },
      },
    },
  });
}

export type ConversationById = Awaited<ReturnType<typeof getConversationById>>;

/**
 * Check if a conversation exists between two users
 */
export async function findConversationBetweenUsers(
  userId1: string,
  userId2: string,
) {
  return db.query.directMessageConversation.findFirst({
    where: or(
      and(
        eq(directMessageConversation.user1Id, userId1),
        eq(directMessageConversation.user2Id, userId2),
      ),
      and(
        eq(directMessageConversation.user1Id, userId2),
        eq(directMessageConversation.user2Id, userId1),
      ),
    ),
  });
}

/**
 * Check if there's a pending or approved DM request between two users
 */
export async function findDMRequestBetweenUsers(
  requesterId: string,
  recipientId: string,
) {
  return db.query.directMessageRequest.findFirst({
    where: and(
      eq(directMessageRequest.requesterId, requesterId),
      eq(directMessageRequest.recipientId, recipientId),
      not(eq(directMessageRequest.status, "denied")),
    ),
  });
}

/**
 * Search users by username
 */
export async function searchUsersByUsername(searchTerm: string, limit = 20) {
  // Search by username or name containing the term
  const users = await db.query.user.findMany({
    where: and(not(isNull(user.username))),
    columns: {
      id: true,
      name: true,
      username: true,
      displayUsername: true,
      color: true,
      image: true,
    },
    limit: limit * 3, // Get more to filter on the application side
  });

  // Filter by search term in JavaScript (case-insensitive)
  const searchLower = searchTerm.toLowerCase();
  return users
    .filter(
      (u) =>
        (u.username && u.username.toLowerCase().includes(searchLower)) ||
        u.name.toLowerCase().includes(searchLower),
    )
    .slice(0, limit);
}

export type SearchedUsers = Awaited<ReturnType<typeof searchUsersByUsername>>;
