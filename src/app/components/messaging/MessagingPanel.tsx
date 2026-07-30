// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useMemo, useState } from "react";
import {
  Send,
  Search,
  Users,
  Lock,
  Unlock,
  UserPlus,
  Check,
  X,
  Hash,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { useIsMobile } from "../ui/use-mobile";
import type { ProgramItem } from "../../../lib/training";
import {
  appendMessage,
  avatarForConversation,
  canSendMessage,
  conversationVisibleTo,
  displayNameForConversation,
  formatMessageTime,
  isPendingForViewer,
  startDirectMessage,
  type Conversation,
  type MessagingRole,
  type MessagingUser,
} from "../../../lib/messaging";

interface MessagingPanelProps {
  role: MessagingRole;
  currentUser: MessagingUser;
  conversations: Conversation[];
  onConversationsChange: (updater: Conversation[] | ((previous: Conversation[]) => Conversation[])) => void;
  directory: MessagingUser[];
  programs?: ProgramItem[];
}

const accents: Record<MessagingRole, string> = {
  athlete: "#ff5500",
  coach: "#60a5fa",
  admin: "#a78bfa",
};

export function MessagingPanel({
  role,
  currentUser,
  conversations,
  onConversationsChange,
  directory,
}: MessagingPanelProps) {
  const isMobile = useIsMobile();
  const accent = accents[role];
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "dms" | "groups" | "requests">("all");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const viewerEmail = currentUser.email.toLowerCase();

  const visibleConvos = useMemo(() => {
    return conversations.filter((convo) => conversationVisibleTo(convo, viewerEmail, role));
  }, [conversations, role, viewerEmail]);

  const pendingCount = visibleConvos.filter((convo) => isPendingForViewer(convo, viewerEmail)).length;

  const searchableUsers = useMemo(() => {
    return directory
      .filter((user) => user.email.toLowerCase() !== viewerEmail)
      .filter((user) => {
        if (role === "athlete") return user.role === "coach" || user.role === "admin";
        if (role === "coach") return user.role === "athlete" || user.role === "admin" || user.role === "coach";
        return true;
      })
      .filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(userSearch.toLowerCase()));
  }, [directory, role, userSearch, viewerEmail]);

  const filteredSafe = visibleConvos
    .map((convo) => ({
      ...convo,
      label: displayNameForConversation(convo, viewerEmail, directory),
      avatarLabel: avatarForConversation(convo, viewerEmail, directory),
      lastMessage: convo.messages[convo.messages.length - 1]?.text ?? "No messages yet",
      time: convo.messages[convo.messages.length - 1]
        ? formatMessageTime(convo.messages[convo.messages.length - 1].createdAt)
        : "",
      unread: convo.unreadByEmail[viewerEmail] ?? 0,
      pendingForMe: isPendingForViewer(convo, viewerEmail),
    }))
    .filter((convo) => {
      const matchSearch =
        convo.label.toLowerCase().includes(search.toLowerCase()) ||
        convo.lastMessage.toLowerCase().includes(search.toLowerCase());
      const matchTab =
        tab === "all" ||
        (tab === "dms" && convo.type === "dm") ||
        (tab === "groups" && convo.type === "group") ||
        (tab === "requests" && convo.pendingForMe);
      return matchSearch && matchTab;
    });

  const current = visibleConvos.find((convo) => convo.id === activeConvo) ?? null;
  const currentMeta = current
    ? {
        label: displayNameForConversation(current, viewerEmail, directory),
        avatarLabel: avatarForConversation(current, viewerEmail, directory),
        canSend: canSendMessage(current, viewerEmail, role),
        pendingForMe: isPendingForViewer(current, viewerEmail),
        waitingOnThem:
          current.type === "dm" &&
          current.status === "pending" &&
          (current.initiatedByEmail ?? "").toLowerCase() === viewerEmail,
      }
    : null;

  const openConversation = (id: string) => {
    setActiveConvo(id);
    setShowNewMessage(false);
    setMobileShowChat(true);
    onConversationsChange((previous) =>
      previous.map((convo) =>
        convo.id === id
          ? {
              ...convo,
              participantEmails:
                convo.type === "group"
                  ? Array.from(new Set([...convo.participantEmails.map((e) => e.toLowerCase()), viewerEmail]))
                  : convo.participantEmails,
              unreadByEmail: { ...convo.unreadByEmail, [viewerEmail]: 0 },
            }
          : convo
      )
    );
  };

  const send = () => {
    if (!current || !currentMeta?.canSend || !message.trim()) return;
    const notifyEmails = directory.map((user) => user.email.toLowerCase());
    onConversationsChange((previous) =>
      appendMessage({
        conversations: previous,
        conversationId: current.id,
        sender: currentUser,
        text: message,
        notifyEmails,
      })
    );
    setMessage("");
  };

  const acceptRequest = (id: string) => {
    onConversationsChange((previous) =>
      previous.map((convo) =>
        convo.id === id
          ? { ...convo, status: "accepted", unreadByEmail: { ...convo.unreadByEmail, [viewerEmail]: 0 } }
          : convo
      )
    );
  };

  const declineRequest = (id: string) => {
    onConversationsChange((previous) => previous.filter((convo) => convo.id !== id));
    if (activeConvo === id) {
      setActiveConvo(null);
      setMobileShowChat(false);
    }
  };

  const toggleGroupLock = (id: string) => {
    if (role !== "admin") return;
    onConversationsChange((previous) =>
      previous.map((convo) => (convo.id === id ? { ...convo, locked: !convo.locked } : convo))
    );
  };

  const startConversation = (user: MessagingUser) => {
    onConversationsChange((previous) => {
      const result = startDirectMessage({
        conversations: previous,
        from: currentUser,
        to: user,
      });
      setActiveConvo(result.conversationId);
      setShowNewMessage(false);
      setMobileShowChat(true);
      setUserSearch("");
      return result.conversations.map((convo) =>
        convo.id === result.conversationId
          ? { ...convo, unreadByEmail: { ...convo.unreadByEmail, [viewerEmail]: 0 } }
          : convo
      );
    });
  };

  const showList = !isMobile || !mobileShowChat;
  const showChat = !isMobile || mobileShowChat;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b px-4 py-2" style={{ borderColor: `${accent}66`, background: `${accent}1a`, color: accent, fontFamily: "var(--font-body)", fontSize: "0.78rem" }}>
        Messaging is shared across roles and saved in this browser. First DMs require acceptance. Backend sync comes next.
      </div>
      <div className="flex-1 flex overflow-hidden">
        {showList && (
          <div className={`${isMobile ? "w-full" : "w-72 flex-shrink-0"} border-r border-border flex flex-col bg-card`}>
            <div className="p-4 border-b border-border">
              <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em" }}>
                {role === "admin" ? "Admin Messaging" : role === "coach" ? "Coach Messaging" : "Athlete Messaging"}
              </div>
              <h2 className="text-foreground uppercase mb-3" style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.06em" }}>
                Messages
              </h2>
              <div className="relative mb-3">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversations..."
                  className="w-full bg-secondary border border-border pl-8 pr-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem" }}
                />
              </div>
              <div className={`grid gap-1.5 ${role === "admin" || pendingCount > 0 ? "grid-cols-2" : "grid-cols-3"}`}>
                {(
                  [
                    ["all", "All"],
                    ["dms", "Direct"],
                    ["groups", "Groups"],
                    ...(role === "admin" || pendingCount > 0
                      ? ([["requests", `Requests${pendingCount ? ` (${pendingCount})` : ""}`]] as const)
                      : []),
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setTab(value)}
                    className={`py-1.5 cursor-pointer border transition-all ${
                      tab === value ? "" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      borderColor: tab === value ? `${accent}99` : undefined,
                      color: tab === value ? accent : undefined,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredSafe.length === 0 && (
                <div className="px-4 py-6 text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem" }}>
                  No conversations yet. Start one with New Message.
                </div>
              )}
              {filteredSafe.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => openConversation(convo.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-border cursor-pointer transition-all ${
                    activeConvo === convo.id ? "bg-secondary" : "hover:bg-muted"
                  }`}
                >
                  <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center border border-border bg-secondary">
                    {convo.type === "group" ? (
                      <Hash size={14} style={{ color: accent }} />
                    ) : (
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.7rem", color: accent }}>
                        {convo.avatarLabel}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className="text-foreground uppercase truncate"
                        style={{ fontFamily: "var(--font-display)", fontWeight: convo.unread ? 700 : 600, fontSize: "0.82rem", letterSpacing: "0.03em" }}
                      >
                        {convo.label}
                      </span>
                      <span className="text-muted-foreground flex-shrink-0 ml-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem" }}>
                        {convo.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {convo.pendingForMe && (
                        <span className="text-[#ff8c42]" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}>
                          PENDING
                        </span>
                      )}
                      {convo.locked && <Lock size={10} className="text-destructive" />}
                      <span className="text-muted-foreground truncate" style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem" }}>
                        {convo.lastMessage}
                      </span>
                      {convo.unread > 0 && (
                        <span
                          className="ml-auto flex-shrink-0 w-4 h-4 flex items-center justify-center"
                          style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "white", background: accent }}
                        >
                          {convo.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-border">
              <button
                onClick={() => {
                  setShowNewMessage((previous) => !previous);
                  if (isMobile) setMobileShowChat(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 border transition-all cursor-pointer"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  borderColor: `${accent}55`,
                  color: accent,
                }}
              >
                <UserPlus size={14} /> New Message
              </button>
            </div>
          </div>
        )}

        {showChat && (
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {isMobile && (
              <button
                type="button"
                onClick={() => {
                  setMobileShowChat(false);
                  setShowNewMessage(false);
                }}
                className="flex items-center gap-2 px-4 py-2 border-b border-border text-muted-foreground hover:text-foreground cursor-pointer"
                style={{ fontFamily: "var(--font-display)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}
              >
                <ArrowLeft size={14} /> Conversations
              </button>
            )}

            {showNewMessage && (
              <div className="border-b border-border bg-card p-4">
                <div className="text-foreground uppercase mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.04em" }}>
                  Search Users
                </div>
                <div className="relative mb-3">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Find a person to message..."
                    className="w-full bg-secondary border border-border pl-8 pr-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
                    style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}
                  />
                </div>
                <div className="max-h-44 overflow-y-auto space-y-1">
                  {searchableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startConversation(user)}
                      className="w-full flex items-center justify-between px-3 py-2 border border-border hover:bg-muted transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.7rem", color: accent }}>
                          {user.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <span className="text-foreground truncate" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}>
                          {user.name}
                        </span>
                      </div>
                      <span className="text-muted-foreground uppercase flex-shrink-0" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.08em" }}>
                        {user.role}
                      </span>
                    </button>
                  ))}
                  {searchableUsers.length === 0 && (
                    <div className="text-muted-foreground px-3 py-2" style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem" }}>
                      No users found.
                    </div>
                  )}
                </div>
              </div>
            )}

            {current && currentMeta ? (
              <>
                <div className="px-4 sm:px-5 py-3 border-b border-border flex items-center gap-3 bg-card">
                  <div className="w-8 h-8 flex items-center justify-center bg-secondary border border-border flex-shrink-0">
                    {current.type === "group" ? (
                      <Users size={14} style={{ color: accent }} />
                    ) : (
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.65rem", color: accent }}>
                        {currentMeta.avatarLabel}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground uppercase truncate" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.04em" }}>
                      {currentMeta.label}
                    </div>
                    {current.roleLabel && current.type === "dm" && (
                      <div className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                        {current.roleLabel}
                      </div>
                    )}
                    {current.type === "group" && (
                      <div className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                        {current.participantEmails.length} members · {current.groupType}
                      </div>
                    )}
                    {current.status === "accepted" && current.type === "dm" && (
                      <div className="text-[#4ade80]" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                        ● CONNECTED
                      </div>
                    )}
                    {currentMeta.pendingForMe && (
                      <div className="text-[#ff8c42]" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                        ● PENDING ACCEPTANCE
                      </div>
                    )}
                    {currentMeta.waitingOnThem && (
                      <div className="text-[#ff8c42]" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                        ● WAITING FOR ACCEPTANCE
                      </div>
                    )}
                  </div>
                  {current.type === "group" && role === "admin" && (
                    <button
                      onClick={() => toggleGroupLock(current.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all cursor-pointer uppercase ${
                        current.locked
                          ? "border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/10 hover:bg-[#4ade80]/20"
                          : "border-[#ff8c42]/30 text-[#ff8c42] bg-[#ff8c42]/10 hover:bg-[#ff8c42]/20"
                      }`}
                      style={{ fontFamily: "var(--font-display)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.06em" }}
                    >
                      {current.locked ? <Unlock size={12} /> : <Lock size={12} />}
                      {current.locked ? "Unlock" : "Lock"}
                    </button>
                  )}
                </div>

                {currentMeta.pendingForMe && (
                  <div className="mx-4 mt-4 p-4 border border-[#ff8c42]/30 bg-[#ff8c42]/5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-foreground uppercase mb-0.5" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.04em" }}>
                        Message Request
                      </div>
                      <div className="text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem" }}>
                        {currentMeta.label} wants to connect. Accept to enable two-way messaging.
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => acceptRequest(current.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/20 transition-all cursor-pointer uppercase"
                        style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em" }}
                      >
                        <Check size={13} /> Accept
                      </button>
                      <button
                        onClick={() => declineRequest(current.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-all cursor-pointer uppercase"
                        style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em" }}
                      >
                        <X size={13} /> Decline
                      </button>
                    </div>
                  </div>
                )}

                {current.locked && current.type === "group" && (
                  <div className="mx-4 mt-4 p-3 border border-destructive/30 bg-destructive/5 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-destructive" />
                    <span className="text-destructive" style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem" }}>
                      {role === "admin"
                        ? "Group is locked for members. You can still post as admin."
                        : "This group is locked. Only admins can post until it is unlocked."}
                    </span>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {current.messages.map((msg) => {
                    const mine = msg.senderEmail.toLowerCase() === viewerEmail;
                    return (
                      <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] sm:max-w-[70%] ${mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                          {!mine && (
                            <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.06em" }}>
                              {msg.senderName}
                            </span>
                          )}
                          <div className={`px-4 py-2.5 ${mine ? "text-white" : "bg-card border border-border text-foreground"}`} style={mine ? { background: accent } : undefined}>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", lineHeight: 1.5 }}>{msg.text}</p>
                          </div>
                          <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem" }}>
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={(event) => event.key === "Enter" && send()}
                      placeholder={
                        currentMeta.pendingForMe
                          ? "Accept request to reply..."
                          : currentMeta.waitingOnThem
                            ? "Waiting for them to accept..."
                            : current.locked && role !== "admin"
                              ? "Group is locked..."
                              : "Type a message..."
                      }
                      disabled={!currentMeta.canSend}
                      className="flex-1 bg-secondary border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-40"
                      style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem" }}
                    />
                    <button
                      onClick={send}
                      disabled={!currentMeta.canSend || !message.trim()}
                      className="px-4 py-2.5 text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: accent }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              !showNewMessage && (
                <div className="flex-1 flex items-center justify-center text-muted-foreground p-6">
                  <div className="text-center">
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Select a conversation
                    </div>
                    <div className="mt-2" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}>
                      Or start a new message to search coaches, athletes, or admins.
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
