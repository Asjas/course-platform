import { eq } from "drizzle-orm";
import { ulid } from "ulid";
import { db } from "~/db/index.js";
import {
  directMessageConversation,
  directMessageRequest,
} from "~/db/schema/directMessages.js";
import { userNotification } from "~/db/schema/userNotifications.js";

/**
 * Create a new DM request
 */
export async function createDMRequest(params: {
  requesterId: string;
  recipientId: string;
  message: string;
  autoApprove?: boolean;
}) {
  const { requesterId, recipientId, message, autoApprove = false } = params;

  const requestId = ulid();
  const status = autoApprove ? "approved" : "pending";
  const respondedAt = autoApprove ? new Date() : null;

  // Create the DM request
  await db.insert(directMessageRequest).values({
    id: requestId,
    requesterId,
    recipientId,
    message,
    status,
    respondedAt,
  });

  // If auto-approved, create the conversation immediately
  if (autoApprove) {
    const conversationId = ulid();
    await db.insert(directMessageConversation).values({
      id: conversationId,
      user1Id: requesterId,
      user2Id: recipientId,
      requestId,
    });

    return { requestId, conversationId, autoApproved: true };
  }

  return { requestId, autoApproved: false };
}

/**
 * Approve a DM request and create conversation
 */
export async function approveDMRequest(params: {
  requestId: string;
  userId: string;
}) {
  const { requestId, userId } = params;

  // Update the request status
  await db
    .update(directMessageRequest)
    .set({
      status: "approved",
      respondedAt: new Date(),
    })
    .where(eq(directMessageRequest.id, requestId));

  // Get the request to create conversation
  const request = await db.query.directMessageRequest.findFirst({
    where: eq(directMessageRequest.id, requestId),
  });

  if (!request) {
    throw new Error("DM request not found");
  }

  // Check if user is the recipient
  if (request.recipientId !== userId) {
    throw new Error("Unauthorized to approve this request");
  }

  // Create the conversation
  const conversationId = ulid();
  await db.insert(directMessageConversation).values({
    id: conversationId,
    user1Id: request.requesterId,
    user2Id: request.recipientId,
    requestId,
  });

  return { conversationId };
}

/**
 * Deny a DM request
 */
export async function denyDMRequest(params: {
  requestId: string;
  userId: string;
}) {
  const { requestId, userId } = params;

  // Get the request first to verify user is recipient
  const request = await db.query.directMessageRequest.findFirst({
    where: eq(directMessageRequest.id, requestId),
  });

  if (!request) {
    throw new Error("DM request not found");
  }

  // Check if user is the recipient
  if (request.recipientId !== userId) {
    throw new Error("Unauthorized to deny this request");
  }

  // Update the request status
  await db
    .update(directMessageRequest)
    .set({
      status: "denied",
      respondedAt: new Date(),
    })
    .where(eq(directMessageRequest.id, requestId));

  return { success: true };
}

/**
 * Close a conversation for a user
 */
export async function closeConversation(params: {
  conversationId: string;
  userId: string;
}) {
  const { conversationId, userId } = params;

  // Get the conversation
  const conversation = await db.query.directMessageConversation.findFirst({
    where: eq(directMessageConversation.id, conversationId),
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Determine which user is closing and update accordingly
  if (conversation.user1Id === userId) {
    await db
      .update(directMessageConversation)
      .set({ user1Closed: true })
      .where(eq(directMessageConversation.id, conversationId));
  } else if (conversation.user2Id === userId) {
    await db
      .update(directMessageConversation)
      .set({ user2Closed: true })
      .where(eq(directMessageConversation.id, conversationId));
  } else {
    throw new Error("Unauthorized to close this conversation");
  }

  return { success: true };
}

/**
 * Reopen a conversation for a user
 */
export async function reopenConversation(params: {
  conversationId: string;
  userId: string;
}) {
  const { conversationId, userId } = params;

  // Get the conversation
  const conversation = await db.query.directMessageConversation.findFirst({
    where: eq(directMessageConversation.id, conversationId),
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  // Determine which user is reopening and update accordingly
  if (conversation.user1Id === userId) {
    await db
      .update(directMessageConversation)
      .set({ user1Closed: false })
      .where(eq(directMessageConversation.id, conversationId));
  } else if (conversation.user2Id === userId) {
    await db
      .update(directMessageConversation)
      .set({ user2Closed: false })
      .where(eq(directMessageConversation.id, conversationId));
  } else {
    throw new Error("Unauthorized to reopen this conversation");
  }

  return { success: true };
}

/**
 * Create DM request notification
 */
export async function createDMRequestNotification(params: {
  requestId: string;
  requesterId: string;
  recipientId: string;
  requesterName: string;
}) {
  const { requestId, requesterId, recipientId, requesterName } = params;

  const notificationId = ulid();
  await db.insert(userNotification).values({
    id: notificationId,
    userId: recipientId,
    type: "dm_request_received",
    title: "New Direct Message Request",
    message: `${requesterName} wants to send you a direct message.`,
    link: `/dm-requests/${requestId}`,
    actorId: requesterId,
    dmRequestId: requestId,
  });

  return { notificationId };
}

/**
 * Create DM request approved notification
 */
export async function createDMApprovedNotification(params: {
  requesterId: string;
  recipientId: string;
  recipientName: string;
  conversationId: string;
}) {
  const { requesterId, recipientId, recipientName, conversationId } = params;

  const notificationId = ulid();
  await db.insert(userNotification).values({
    id: notificationId,
    userId: requesterId,
    type: "dm_request_approved",
    title: "Direct Message Request Approved",
    message: `${recipientName} accepted your direct message request.`,
    link: `/chat/dm/${conversationId}`,
    actorId: recipientId,
  });

  return { notificationId };
}

/**
 * Create DM request denied notification
 */
export async function createDMDeniedNotification(params: {
  requesterId: string;
  recipientId: string;
  recipientName: string;
}) {
  const { requesterId, recipientId, recipientName } = params;

  const notificationId = ulid();
  await db.insert(userNotification).values({
    id: notificationId,
    userId: requesterId,
    type: "dm_request_denied",
    title: "Direct Message Request Declined",
    message: `${recipientName} declined your direct message request.`,
    actorId: recipientId,
  });

  return { notificationId };
}
