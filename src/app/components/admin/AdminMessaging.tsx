// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { MessagingPanel } from "../messaging/MessagingPanel";
import type { Conversation, MessagingUser } from "../../../lib/messaging";
import type { ProgramItem } from "../../../lib/training";

interface AdminMessagingProps {
  currentUser: MessagingUser;
  conversations: Conversation[];
  onConversationsChange: (updater: Conversation[] | ((previous: Conversation[]) => Conversation[])) => void;
  directory: MessagingUser[];
  programs: ProgramItem[];
}

export function AdminMessaging({
  currentUser,
  conversations,
  onConversationsChange,
  directory,
  programs,
}: AdminMessagingProps) {
  return (
    <MessagingPanel
      role="admin"
      currentUser={currentUser}
      conversations={conversations}
      onConversationsChange={onConversationsChange}
      directory={directory}
      programs={programs}
    />
  );
}
