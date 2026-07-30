// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { MessagingPanel } from "../messaging/MessagingPanel";
import type { Conversation, MessagingUser } from "../../../lib/messaging";

interface MessagingProps {
  currentUser: MessagingUser;
  conversations: Conversation[];
  onConversationsChange: (updater: Conversation[] | ((previous: Conversation[]) => Conversation[])) => void;
  directory: MessagingUser[];
}

export function Messaging({ currentUser, conversations, onConversationsChange, directory }: MessagingProps) {
  return (
    <MessagingPanel
      role="athlete"
      currentUser={currentUser}
      conversations={conversations}
      onConversationsChange={onConversationsChange}
      directory={directory}
    />
  );
}
