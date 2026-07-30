export type ConvoType = "dm" | "group";
export type ConvoStatus = "pending" | "accepted";
export type GroupType = "Program" | "Global" | "Internal";
export type MessagingRole = "athlete" | "coach" | "admin";

export interface ChatMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: ConvoType;
  name: string;
  avatar: string;
  participantEmails: string[];
  status: ConvoStatus;
  initiatedByEmail?: string;
  messages: ChatMessage[];
  unreadByEmail: Record<string, number>;
  locked?: boolean;
  groupType?: GroupType;
  programId?: string;
  roleLabel?: string;
}

export interface MessagingUser {
  id: string;
  name: string;
  email: string;
  role: MessagingRole;
}

export interface MessagingState {
  conversations: Conversation[];
}

const STORAGE_KEY = "afsp-messaging-v1";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function nowIso(): string {
  return new Date().toISOString();
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const defaultConversations: Conversation[] = [
  {
    id: "dm-marcus-jordan",
    type: "dm",
    name: "Marcus Webb",
    avatar: "MW",
    participantEmails: ["marcus@afsp.com", "jordan@afsp.com"],
    status: "accepted",
    initiatedByEmail: "marcus@afsp.com",
    roleLabel: "Coach",
    unreadByEmail: { "jordan@afsp.com": 1, "marcus@afsp.com": 0 },
    messages: [
      {
        id: "m1",
        senderEmail: "marcus@afsp.com",
        senderName: "Marcus Webb",
        text: "How are you feeling after Thursday's session?",
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: "m2",
        senderEmail: "jordan@afsp.com",
        senderName: "Jordan Cole",
        text: "Pretty good! Legs are a bit sore but nothing bad.",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: "m3",
        senderEmail: "marcus@afsp.com",
        senderName: "Marcus Webb",
        text: "That's normal for a deload transition. Great work on those PRs this week!",
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
    ],
  },
  {
    id: "dm-admin-marcus",
    type: "dm",
    name: "Marcus Webb",
    avatar: "MW",
    participantEmails: ["admin@afsp.com", "marcus@afsp.com"],
    status: "accepted",
    initiatedByEmail: "marcus@afsp.com",
    roleLabel: "Coach",
    unreadByEmail: { "admin@afsp.com": 1, "marcus@afsp.com": 0 },
    messages: [
      {
        id: "am1",
        senderEmail: "marcus@afsp.com",
        senderName: "Marcus Webb",
        text: "Jordan Cole hit all session targets this week.",
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
      {
        id: "am2",
        senderEmail: "admin@afsp.com",
        senderName: "Platform Admin",
        text: "Thanks — keep me posted on compliance dips.",
        createdAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
      },
      {
        id: "am3",
        senderEmail: "marcus@afsp.com",
        senderName: "Marcus Webb",
        text: "Custom request CR-041 is ready for your review.",
        createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      },
    ],
  },
  {
    id: "dm-jordan-admin",
    type: "dm",
    name: "Jordan Cole",
    avatar: "JC",
    participantEmails: ["admin@afsp.com", "jordan@afsp.com"],
    status: "accepted",
    initiatedByEmail: "jordan@afsp.com",
    roleLabel: "Athlete",
    unreadByEmail: { "admin@afsp.com": 0, "jordan@afsp.com": 0 },
    messages: [
      {
        id: "ja1",
        senderEmail: "jordan@afsp.com",
        senderName: "Jordan Cole",
        text: "Can I switch to a hybrid enrollment next month?",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
      {
        id: "ja2",
        senderEmail: "admin@afsp.com",
        senderName: "Platform Admin",
        text: "Yes — I'll send updated contract terms shortly.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
      },
    ],
  },
  {
    id: "dm-pending-rosa-admin",
    type: "dm",
    name: "Rosa Mendez",
    avatar: "RM",
    participantEmails: ["admin@afsp.com", "rosa@afsp.com"],
    status: "pending",
    initiatedByEmail: "rosa@afsp.com",
    roleLabel: "Athlete",
    unreadByEmail: { "admin@afsp.com": 1, "rosa@afsp.com": 0 },
    messages: [
      {
        id: "pr1",
        senderEmail: "rosa@afsp.com",
        senderName: "Rosa Mendez",
        text: "Hi, I just enrolled and wanted to connect.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
    ],
  },
  {
    id: "group-global",
    type: "group",
    name: "AFSP Community",
    avatar: "AF",
    participantEmails: ["admin@afsp.com", "marcus@afsp.com", "jordan@afsp.com"],
    status: "accepted",
    locked: false,
    groupType: "Global",
    unreadByEmail: { "admin@afsp.com": 0, "marcus@afsp.com": 0, "jordan@afsp.com": 0 },
    messages: [
      {
        id: "g1",
        senderEmail: "admin@afsp.com",
        senderName: "Platform Admin",
        text: "Welcome to all the new members joining this week!",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        id: "g2",
        senderEmail: "marcus@afsp.com",
        senderName: "Marcus Webb",
        text: "Great to have everyone here. Big things coming this quarter.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
      },
    ],
  },
  {
    id: "group-coaches",
    type: "group",
    name: "Coaches Channel",
    avatar: "CC",
    participantEmails: ["admin@afsp.com", "marcus@afsp.com"],
    status: "accepted",
    locked: true,
    groupType: "Internal",
    unreadByEmail: { "admin@afsp.com": 0, "marcus@afsp.com": 2 },
    messages: [
      {
        id: "c1",
        senderEmail: "admin@afsp.com",
        senderName: "Platform Admin",
        text: "Q3 programming guidelines posted in the shared folder.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
      {
        id: "c2",
        senderEmail: "marcus@afsp.com",
        senderName: "Marcus Webb",
        text: "Received. Updating Sprint Mechanics templates.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
      },
    ],
  },
  {
    id: "group-program-elite",
    type: "group",
    name: "Elite Strength · Group",
    avatar: "ES",
    participantEmails: ["admin@afsp.com", "marcus@afsp.com", "jordan@afsp.com"],
    status: "accepted",
    locked: false,
    groupType: "Program",
    programId: "program-001",
    unreadByEmail: { "admin@afsp.com": 0, "marcus@afsp.com": 0, "jordan@afsp.com": 5 },
    messages: [
      {
        id: "e1",
        senderEmail: "marcus@afsp.com",
        senderName: "Marcus Webb",
        text: "Session moved to 7am tomorrow — platform 2.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      },
      {
        id: "e2",
        senderEmail: "jordan@afsp.com",
        senderName: "Jordan Cole",
        text: "I'll be there.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
      },
    ],
  },
];

export const defaultMessagingState: MessagingState = {
  conversations: defaultConversations,
};

export function loadMessagingState(): MessagingState {
  if (typeof window === "undefined") return defaultMessagingState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultMessagingState;
    const parsed = JSON.parse(raw) as Partial<MessagingState>;
    if (!Array.isArray(parsed.conversations) || parsed.conversations.length === 0) {
      return defaultMessagingState;
    }
    return { conversations: parsed.conversations };
  } catch {
    return defaultMessagingState;
  }
}

export function saveMessagingState(state: MessagingState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function conversationVisibleTo(convo: Conversation, email: string, role: MessagingRole): boolean {
  const normalized = email.toLowerCase();
  if (convo.type === "group") {
    if (convo.groupType === "Internal") return role === "coach" || role === "admin";
    // Global + Program groups are shared org-wide so every role sees the same thread.
    if (convo.groupType === "Global" || convo.groupType === "Program") return true;
  }
  if (role === "admin") return true;
  return convo.participantEmails.some((item) => item.toLowerCase() === normalized);
}

export function displayNameForConversation(convo: Conversation, viewerEmail: string, directory: MessagingUser[]): string {
  if (convo.type === "group") return convo.name;
  const otherEmail = convo.participantEmails.find((email) => email.toLowerCase() !== viewerEmail.toLowerCase());
  const other = directory.find((user) => user.email.toLowerCase() === (otherEmail ?? "").toLowerCase());
  return other?.name ?? convo.name;
}

export function avatarForConversation(convo: Conversation, viewerEmail: string, directory: MessagingUser[]): string {
  if (convo.type === "group") return convo.avatar;
  const otherEmail = convo.participantEmails.find((email) => email.toLowerCase() !== viewerEmail.toLowerCase());
  const other = directory.find((user) => user.email.toLowerCase() === (otherEmail ?? "").toLowerCase());
  return other ? initials(other.name) : convo.avatar;
}

export function isPendingForViewer(convo: Conversation, viewerEmail: string): boolean {
  if (convo.status !== "pending" || convo.type !== "dm") return false;
  return (convo.initiatedByEmail ?? "").toLowerCase() !== viewerEmail.toLowerCase();
}

export function canSendMessage(convo: Conversation, viewerEmail: string, role: MessagingRole): boolean {
  if (convo.type === "dm" && convo.status === "pending") return false;
  if (convo.type === "group" && convo.locked && role !== "admin") return false;
  return true;
}

function sameEmailSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const left = new Set(a.map((email) => email.toLowerCase()));
  return b.every((email) => left.has(email.toLowerCase()));
}

/** Keep Global/Program groups membership aligned so every user reads the same thread. */
export function syncSharedGroupMembers(
  conversations: Conversation[],
  memberEmails: string[]
): Conversation[] {
  const normalizedMembers = Array.from(
    new Set(memberEmails.map((email) => email.toLowerCase()).filter(Boolean))
  );
  if (normalizedMembers.length === 0) return conversations;

  let changed = false;
  const next = conversations.map((convo) => {
    if (convo.type !== "group") return convo;
    if (convo.groupType !== "Global" && convo.groupType !== "Program") return convo;
    const merged = Array.from(new Set([...convo.participantEmails.map((e) => e.toLowerCase()), ...normalizedMembers]));
    if (sameEmailSet(merged, convo.participantEmails)) return convo;
    changed = true;
    return { ...convo, participantEmails: merged };
  });
  return changed ? next : conversations;
}

export function ensureProgramGroups(
  conversations: Conversation[],
  programs: Array<{ id: string; name: string }>,
  memberEmails: string[]
): Conversation[] {
  const normalizedMembers = Array.from(
    new Set(memberEmails.map((email) => email.toLowerCase()).filter(Boolean))
  );
  let changed = false;

  // Collapse duplicate program groups (same programId) into one thread, keeping the richest message history.
  const byProgram = new Map<string, Conversation>();
  const withoutDupes: Conversation[] = [];
  conversations.forEach((convo) => {
    if (convo.type !== "group" || !convo.programId) {
      withoutDupes.push(convo);
      return;
    }
    const existing = byProgram.get(convo.programId);
    if (!existing) {
      byProgram.set(convo.programId, convo);
      return;
    }
    changed = true;
    const richer =
      (convo.messages?.length ?? 0) >= (existing.messages?.length ?? 0) ? convo : existing;
    const other = richer === convo ? existing : convo;
    byProgram.set(convo.programId, {
      ...richer,
      participantEmails: Array.from(
        new Set([
          ...richer.participantEmails.map((email) => email.toLowerCase()),
          ...other.participantEmails.map((email) => email.toLowerCase()),
          ...normalizedMembers,
        ])
      ),
      messages: [...richer.messages],
      unreadByEmail: { ...other.unreadByEmail, ...richer.unreadByEmail },
    });
  });
  let next = [...withoutDupes, ...byProgram.values()];

  next = next.map((convo) => {
    if (convo.type !== "group" || !convo.programId) return convo;
    const program = programs.find((item) => item.id === convo.programId);
    if (!program) return convo;
    const expectedName = `${program.name} · Group`;
    const mergedMembers = Array.from(
      new Set([...convo.participantEmails.map((email) => email.toLowerCase()), ...normalizedMembers])
    );
    if (convo.name === expectedName && sameEmailSet(mergedMembers, convo.participantEmails)) return convo;
    changed = true;
    return {
      ...convo,
      name: expectedName,
      participantEmails: mergedMembers,
    };
  });

  programs.forEach((program) => {
    const existing = next.find((convo) => convo.type === "group" && convo.programId === program.id);
    if (existing) return;
    changed = true;
    next = [
      ...next,
      {
        id: `group-program-${program.id}`,
        type: "group",
        name: `${program.name} · Group`,
        avatar: initials(program.name),
        participantEmails: [...normalizedMembers],
        status: "accepted",
        locked: false,
        groupType: "Program",
        programId: program.id,
        unreadByEmail: {},
        messages: [
          {
            id: `seed-${program.id}`,
            senderEmail: "admin@afsp.com",
            senderName: "Platform Admin",
            text: `${program.name} group chat is open. Coaches can post session updates here.`,
            createdAt: nowIso(),
          },
        ],
      },
    ];
  });

  const withMembers = syncSharedGroupMembers(next, normalizedMembers);
  if (withMembers !== next) changed = true;
  return changed ? withMembers : conversations;
}

export function startDirectMessage(args: {
  conversations: Conversation[];
  from: MessagingUser;
  to: MessagingUser;
  openingText?: string;
}): { conversations: Conversation[]; conversationId: string } {
  const existing = args.conversations.find(
    (convo) =>
      convo.type === "dm" &&
      convo.participantEmails.map((email) => email.toLowerCase()).includes(args.from.email.toLowerCase()) &&
      convo.participantEmails.map((email) => email.toLowerCase()).includes(args.to.email.toLowerCase())
  );
  if (existing) {
    return { conversations: args.conversations, conversationId: existing.id };
  }

  const opening =
    args.openingText?.trim() ||
    `Hi ${args.to.name.split(" ")[0]}, I'd like to connect.`;
  const id = `dm-${Date.now()}`;
  const created: Conversation = {
    id,
    type: "dm",
    name: args.to.name,
    avatar: initials(args.to.name),
    participantEmails: [args.from.email.toLowerCase(), args.to.email.toLowerCase()],
    status: "pending",
    initiatedByEmail: args.from.email.toLowerCase(),
    roleLabel: args.to.role === "athlete" ? "Athlete" : args.to.role === "coach" ? "Coach" : "Admin",
    unreadByEmail: { [args.to.email.toLowerCase()]: 1, [args.from.email.toLowerCase()]: 0 },
    messages: [
      {
        id: `msg-${Date.now()}`,
        senderEmail: args.from.email.toLowerCase(),
        senderName: args.from.name,
        text: opening,
        createdAt: nowIso(),
      },
    ],
  };

  return { conversations: [created, ...args.conversations], conversationId: id };
}

export function appendMessage(args: {
  conversations: Conversation[];
  conversationId: string;
  sender: MessagingUser;
  text: string;
  /** Extra emails that should receive unread for group fan-out (directory). */
  notifyEmails?: string[];
}): Conversation[] {
  const trimmed = args.text.trim();
  if (!trimmed) return args.conversations;
  return args.conversations.map((convo) => {
    if (convo.id !== args.conversationId) return convo;
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      senderEmail: args.sender.email.toLowerCase(),
      senderName: args.sender.name,
      text: trimmed,
      createdAt: nowIso(),
    };

    const participantEmails =
      convo.type === "group"
        ? Array.from(
            new Set([
              ...convo.participantEmails.map((email) => email.toLowerCase()),
              ...(args.notifyEmails ?? []).map((email) => email.toLowerCase()),
              args.sender.email.toLowerCase(),
            ])
          )
        : convo.participantEmails.map((email) => email.toLowerCase());

    const unreadByEmail = { ...convo.unreadByEmail };
    participantEmails.forEach((email) => {
      const key = email.toLowerCase();
      if (key === args.sender.email.toLowerCase()) {
        unreadByEmail[key] = 0;
      } else {
        unreadByEmail[key] = (unreadByEmail[key] ?? 0) + 1;
      }
    });
    return {
      ...convo,
      participantEmails,
      messages: [...convo.messages, message],
      unreadByEmail,
    };
  });
}
