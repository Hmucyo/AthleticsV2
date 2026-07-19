// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useState } from "react";
import { Send, Search, Users, Lock, Unlock, UserPlus, Check, X, Hash, ShieldCheck } from "lucide-react";

type ConvoType = "dm" | "group";

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  mine?: boolean;
}

interface Conversation {
  id: string;
  type: ConvoType;
  name: string;
  avatar: string;
  role?: string;
  lastMessage: string;
  time: string;
  unread: number;
  status?: "pending" | "accepted";
  messages: Message[];
  locked?: boolean;
  members?: number;
  groupType?: "Program" | "Global" | "Internal";
}

interface AdminMessagingProps {
  coaches: Array<{ id: string; name: string; email: string }>;
  athletes: Array<{ id: string; name: string; email: string; sport: string }>;
}

const seedConversations: Conversation[] = [
  {
    id: "marcus",
    type: "dm",
    name: "Marcus Webb",
    avatar: "MW",
    role: "Coach",
    lastMessage: "Custom request CR-041 is ready for your review.",
    time: "11:20 AM",
    unread: 1,
    status: "accepted",
    messages: [
      { id: 1, sender: "Marcus Webb", text: "Jordan Cole hit all session targets this week.", time: "10:05 AM" },
      { id: 2, sender: "Admin", text: "Thanks — keep me posted on compliance dips.", time: "10:18 AM", mine: true },
      { id: 3, sender: "Marcus Webb", text: "Custom request CR-041 is ready for your review.", time: "11:20 AM" },
    ],
  },
  {
    id: "jordan",
    type: "dm",
    name: "Jordan Cole",
    avatar: "JC",
    role: "Athlete",
    lastMessage: "Can I switch to a hybrid enrollment next month?",
    time: "Yesterday",
    unread: 0,
    status: "accepted",
    messages: [
      { id: 1, sender: "Jordan Cole", text: "Can I switch to a hybrid enrollment next month?", time: "Yesterday 6:40 PM" },
      { id: 2, sender: "Admin", text: "Yes — I'll send updated contract terms shortly.", time: "Yesterday 7:02 PM", mine: true },
    ],
  },
  {
    id: "rosa-request",
    type: "dm",
    name: "Rosa Mendez",
    avatar: "RM",
    role: "Athlete",
    lastMessage: "Hi, I just enrolled and wanted to connect.",
    time: "Today",
    unread: 1,
    status: "pending",
    messages: [
      { id: 1, sender: "Rosa Mendez", text: "Hi, I just enrolled and wanted to connect.", time: "Today 8:15 AM" },
    ],
  },
  {
    id: "global",
    type: "group",
    name: "AFSP Community",
    avatar: "AF",
    lastMessage: "Welcome new members this week!",
    time: "Mon",
    unread: 0,
    locked: false,
    groupType: "Global",
    members: 148,
    messages: [
      { id: 1, sender: "Admin", text: "Welcome to all the new members joining this week!", time: "Mon 9:00 AM", mine: true },
      { id: 2, sender: "Devon Brooks", text: "Great to have everyone here. Big things coming this quarter.", time: "Mon 9:15 AM" },
    ],
  },
  {
    id: "coaches-channel",
    type: "group",
    name: "Coaches Channel",
    avatar: "CC",
    lastMessage: "Q3 programming guidelines posted.",
    time: "Fri",
    unread: 2,
    locked: true,
    groupType: "Internal",
    members: 6,
    messages: [
      { id: 1, sender: "Admin", text: "Q3 programming guidelines posted in the shared folder.", time: "Fri 2:00 PM", mine: true },
      { id: 2, sender: "Aisha Kim", text: "Received. Updating Sprint Mechanics templates.", time: "Fri 2:18 PM" },
    ],
  },
  {
    id: "elite-group",
    type: "group",
    name: "Elite Strength · Group",
    avatar: "ES",
    lastMessage: "Session moved to 7am tomorrow",
    time: "Yesterday",
    unread: 0,
    locked: false,
    groupType: "Program",
    members: 12,
    messages: [
      { id: 1, sender: "Marcus Webb", text: "Session moved to 7am tomorrow — platform 2.", time: "Yesterday 4:15 PM" },
      { id: 2, sender: "Tyler Ramos", text: "Got it, thanks coach!", time: "Yesterday 4:22 PM" },
    ],
  },
];

export function AdminMessaging({ coaches, athletes }: AdminMessagingProps) {
  const [activeConvo, setActiveConvo] = useState("marcus");
  const [message, setMessage] = useState("");
  const [convos, setConvos] = useState(seedConversations);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "dms" | "groups" | "requests">("all");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const current = convos.find((convo) => convo.id === activeConvo);
  const pendingCount = convos.filter((convo) => convo.status === "pending").length;

  const searchableUsers = [
    ...coaches.map((coach) => ({ id: coach.id, name: coach.name, role: "Coach", avatar: coach.name.split(" ").map((part) => part[0]).join("").slice(0, 2) })),
    ...athletes.map((athlete) => ({ id: athlete.id, name: athlete.name, role: "Athlete", avatar: athlete.name.split(" ").map((part) => part[0]).join("").slice(0, 2) })),
  ].filter((user) => user.name.toLowerCase().includes(userSearch.toLowerCase()));

  const send = () => {
    if (!message.trim() || !current || current.status === "pending") return;
    const newMsg: Message = {
      id: Date.now(),
      sender: "Admin",
      text: message.trim(),
      time: "Now",
      mine: true,
    };
    setConvos((previous) =>
      previous.map((convo) =>
        convo.id === activeConvo
          ? { ...convo, messages: [...convo.messages, newMsg], lastMessage: message.trim(), unread: 0 }
          : convo
      )
    );
    setMessage("");
  };

  const acceptRequest = (id: string) => {
    setConvos((previous) =>
      previous.map((convo) => (convo.id === id ? { ...convo, status: "accepted", unread: 0 } : convo))
    );
  };

  const declineRequest = (id: string) => {
    setConvos((previous) => previous.filter((convo) => convo.id !== id));
    if (activeConvo === id) setActiveConvo("marcus");
  };

  const toggleGroupLock = (id: string) => {
    setConvos((previous) =>
      previous.map((convo) => (convo.id === id ? { ...convo, locked: !convo.locked } : convo))
    );
  };

  const startConversation = (user: { id: string; name: string; role: string; avatar: string }) => {
    const existing = convos.find((convo) => convo.type === "dm" && convo.name === user.name);
    if (existing) {
      setActiveConvo(existing.id);
      setShowNewMessage(false);
      setUserSearch("");
      return;
    }

    const newConvo: Conversation = {
      id: `dm-${user.id}`,
      type: "dm",
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      lastMessage: "Conversation started.",
      time: "Now",
      unread: 0,
      status: "accepted",
      messages: [
        {
          id: Date.now(),
          sender: "Admin",
          text: `Hi ${user.name.split(" ")[0]}, reaching out from admin.`,
          time: "Now",
          mine: true,
        },
      ],
    };

    setConvos((previous) => [newConvo, ...previous]);
    setActiveConvo(newConvo.id);
    setShowNewMessage(false);
    setUserSearch("");
  };

  const filtered = convos.filter((convo) => {
    const matchSearch = convo.name.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      tab === "all" ||
      (tab === "dms" && convo.type === "dm") ||
      (tab === "groups" && convo.type === "group") ||
      (tab === "requests" && convo.status === "pending");
    return matchSearch && matchTab;
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em" }}>
            Admin Messaging
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
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                ["all", "All"],
                ["dms", "Direct"],
                ["groups", "Groups"],
                ["requests", `Requests${pendingCount ? ` (${pendingCount})` : ""}`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`py-1.5 cursor-pointer border transition-all ${
                  tab === value ? "border-[#a78bfa] text-[#a78bfa]" : "border-border text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontFamily: "var(--font-display)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((convo) => (
            <button
              key={convo.id}
              onClick={() => {
                setActiveConvo(convo.id);
                setConvos((previous) => previous.map((item) => (item.id === convo.id ? { ...item, unread: 0 } : item)));
              }}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-border cursor-pointer transition-all ${
                activeConvo === convo.id ? "bg-secondary" : "hover:bg-muted"
              }`}
            >
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center border border-border bg-secondary">
                {convo.type === "group" ? (
                  <Hash size={14} className="text-[#a78bfa]" />
                ) : (
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.7rem", color: "#a78bfa" }}>
                    {convo.avatar}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className="text-foreground uppercase truncate"
                    style={{ fontFamily: "var(--font-display)", fontWeight: convo.unread ? 700 : 600, fontSize: "0.82rem", letterSpacing: "0.03em" }}
                  >
                    {convo.name}
                  </span>
                  <span className="text-muted-foreground flex-shrink-0 ml-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem" }}>
                    {convo.time}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {convo.status === "pending" && (
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
                      className="ml-auto flex-shrink-0 w-4 h-4 bg-[#a78bfa] flex items-center justify-center"
                      style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "white" }}
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
            onClick={() => setShowNewMessage((previous) => !previous)}
            className="w-full flex items-center justify-center gap-2 py-2 border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/10 transition-all cursor-pointer"
            style={{ fontFamily: "var(--font-display)", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}
          >
            <UserPlus size={14} /> New Message
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
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
                placeholder="Find coach or athlete..."
                className="w-full bg-secondary border border-border pl-8 pr-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
                style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}
              />
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1">
              {searchableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => startConversation(user)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-border hover:bg-muted transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.7rem", color: "#a78bfa" }}>
                      {user.avatar}
                    </span>
                    <span className="text-foreground" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem" }}>
                      {user.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground uppercase" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.08em" }}>
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

        {current ? (
          <>
            <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-card">
              <div className="w-8 h-8 flex items-center justify-center bg-secondary border border-border">
                {current.type === "group" ? (
                  <Users size={14} className="text-[#a78bfa]" />
                ) : (
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.65rem", color: "#a78bfa" }}>
                    {current.avatar}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-foreground uppercase truncate" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.04em" }}>
                  {current.name}
                </div>
                {current.role && (
                  <div className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                    {current.role}
                  </div>
                )}
                {current.members && (
                  <div className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                    {current.members} members · {current.groupType}
                  </div>
                )}
                {current.status === "accepted" && (
                  <div className="text-[#4ade80]" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                    ● CONNECTED
                  </div>
                )}
                {current.status === "pending" && (
                  <div className="text-[#ff8c42]" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>
                    ● PENDING ACCEPTANCE
                  </div>
                )}
              </div>
              {current.type === "group" && (
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
                  {current.locked ? "Unlock Group" : "Lock Group"}
                </button>
              )}
            </div>

            {current.status === "pending" && (
              <div className="mx-4 mt-4 p-4 border border-[#ff8c42]/30 bg-[#ff8c42]/5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-foreground uppercase mb-0.5" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.04em" }}>
                    Message Request
                  </div>
                  <div className="text-muted-foreground" style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem" }}>
                    {current.name} wants to connect. Accept to enable two-way messaging.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => acceptRequest(current.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/20 transition-all cursor-pointer"
                    style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}
                  >
                    <Check size={13} /> Accept
                  </button>
                  <button
                    onClick={() => declineRequest(current.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-all cursor-pointer"
                    style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}
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
                  This group is locked. Only admins can post until it is unlocked.
                </span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {current.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] ${msg.mine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    {!msg.mine && (
                      <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.06em" }}>
                        {msg.sender}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2.5 ${
                        msg.mine ? "bg-[#a78bfa] text-white" : "bg-card border border-border text-foreground"
                      }`}
                    >
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", lineHeight: 1.5 }}>{msg.text}</p>
                    </div>
                    <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem" }}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && send()}
                  placeholder={
                    current.status === "pending"
                      ? "Accept request to reply..."
                      : current.locked
                        ? "Group locked for members — post as admin..."
                        : "Type a message..."
                  }
                  disabled={current.status === "pending"}
                  className="flex-1 bg-secondary border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#a78bfa]/50 disabled:opacity-40"
                  style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem" }}
                />
                <button
                  onClick={send}
                  disabled={current.status === "pending" || !message.trim()}
                  className="px-4 py-2.5 bg-[#a78bfa] text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Select a conversation
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
