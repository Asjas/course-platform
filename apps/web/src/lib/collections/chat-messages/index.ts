/**
 * Chat Messages Collection
 *
 * Re-exports collection factories and utilities for chat messages.
 */

export {
  createChannelMessagesCollection,
  createDMMessagesCollection,
  toggleMessageReaction,
  type ChannelMessage,
  type DMMessage,
  type ChatMessage,
  type Reaction,
  type ReactionUpdate,
} from "./chat-messages.collection";
