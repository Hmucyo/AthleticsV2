// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useState } from "react";
import { Send, Search, Users, Lock, UserPlus, Check, X, Hash } from "lucide-react";

type ConvoType = 'dm' | 'group';

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
  lastMessage: string;
  time: string;
  unread: number;
  status?: 'pending' | 'accepted';
  messages: Message[];
  locked?: boolean;
  members?: number;
}

const conversations: Conversation[] = [
  {
    id: 'marcus',
    type: 'dm',
    name: 'Marcus Webb',
    avatar: 'MW',
    lastMessage: 'Great work on those PRs this week!',
    time: '10:42 AM',
    unread: 2,
    status: 'accepted',
    messages: [
      { id: 1, sender: 'Marcus Webb', text: 'How are you feeling after Thursday\'s session?', time: '10:30 AM' },
      { id: 2, sender: 'Me', text: 'Pretty good! Legs are a bit sore but nothing bad.', time: '10:35 AM', mine: true },
      { id: 3, sender: 'Marcus Webb', text: 'That\'s normal for a deload transition. Great work on those PRs this week!', time: '10:42 AM' },
    ],
  },
  {
    id: 'elite-group',
    type: 'group',
    name: 'Elite Strength · Group',
    avatar: 'ES',
    lastMessage: 'Session moved to 7am tomorrow',
    time: 'Yesterday',
    unread: 5,
    messages: [
      { id: 1, sender: 'Marcus Webb', text: 'Session moved to 7am tomorrow — platform 2.', time: 'Yesterday 4:15 PM' },
      { id: 2, sender: 'Tyler Ramos', text: 'Got it, thanks coach!', time: 'Yesterday 4:22 PM' },
      { id: 3, sender: 'Me', text: 'I\'ll be there.', time: 'Yesterday 4:30 PM', mine: true },
      { id: 4, sender: 'Kira Voss', text: 'Is there parking at 7?', time: 'Yesterday 5:01 PM' },
      { id: 5, sender: 'Marcus Webb', text: 'Yes, the lot opens at 6:30.', time: 'Yesterday 5:05 PM' },
    ],
    members: 12,
  },
  {
    id: 'global',
    type: 'group',
    name: 'AFSP Community',
    avatar: 'AF',
    lastMessage: 'Welcome new members this week!',
    time: 'Mon',
    unread: 0,
    locked: false,
    messages: [
      { id: 1, sender: 'Admin', text: 'Welcome to all the new members joining this week! 💪', time: 'Mon 9:00 AM' },
      { id: 2, sender: 'Devon Brooks', text: 'Great to have everyone here. Big things coming this quarter.', time: 'Mon 9:15 AM' },
    ],
    members: 148,
  },
  {
    id: 'aisha',
    type: 'dm',
    name: 'Aisha Kim',
    avatar: 'AK',
    lastMessage: 'Request to message received',
    time: 'Sun',
    unread: 1,
    status: 'pending',
    messages: [
      { id: 1, sender: 'Aisha Kim', text: 'Hi! I noticed you were interested in Sprint Mechanics. Happy to answer any questions.', time: 'Sun 3:00 PM' },
    ],
  },
];

export function Messaging() {
  const [activeConvo, setActiveConvo] = useState<string>('marcus');
  const [message, setMessage] = useState('');
  const [convos, setConvos] = useState(conversations);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'dms' | 'groups'>('all');

  const current = convos.find(c => c.id === activeConvo);

  const send = () => {
    if (!message.trim() || !current) return;
    const newMsg: Message = { id: Date.now(), sender: 'Me', text: message.trim(), time: 'Now', mine: true };
    setConvos(prev => prev.map(c => c.id === activeConvo ? { ...c, messages: [...c.messages, newMsg], lastMessage: message.trim(), unread: 0 } : c));
    setMessage('');
  };

  const acceptRequest = (id: string) => {
    setConvos(prev => prev.map(c => c.id === id ? { ...c, status: 'accepted' } : c));
  };

  const filtered = convos.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'all' || (tab === 'dms' ? c.type === 'dm' : c.type === 'group');
    return matchSearch && matchTab;
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground uppercase mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.06em' }}>Messages</h2>
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-secondary border border-border pl-8 pr-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
              style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}
            />
          </div>
          <div className="flex gap-1.5">
            {([['all', 'All'], ['dms', 'Direct'], ['groups', 'Groups']] as const).map(([val, label]) => (
              <button key={val} onClick={() => setTab(val)} className={`flex-1 py-1 cursor-pointer border transition-all ${tab === val ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`} style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => { setActiveConvo(c.id); setConvos(prev => prev.map(x => x.id === c.id ? { ...x, unread: 0 } : x)); }}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-border cursor-pointer transition-all ${activeConvo === c.id ? 'bg-secondary' : 'hover:bg-muted'}`}
            >
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center border border-border" style={{ background: c.type === 'group' ? '#1e2225' : '#1a1d21' }}>
                {c.type === 'group' ? <Hash size={14} className="text-muted-foreground" /> : (
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.7rem', color: '#ff5500' }}>{c.avatar}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-foreground uppercase truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: c.unread ? 700 : 600, fontSize: '0.82rem', letterSpacing: '0.03em' }}>{c.name}</span>
                  <span className="text-muted-foreground flex-shrink-0 ml-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem' }}>{c.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  {c.status === 'pending' && <span className="text-[#ff8c42]" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>PENDING</span>}
                  {c.locked && <Lock size={10} className="text-muted-foreground" />}
                  <span className="text-muted-foreground truncate" style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem' }}>{c.lastMessage}</span>
                  {c.unread > 0 && <span className="ml-auto flex-shrink-0 w-4 h-4 bg-primary flex items-center justify-center" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'white' }}>{c.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-border">
          <button className="w-full flex items-center justify-center gap-2 py-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all cursor-pointer" style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <UserPlus size={14} /> New Message
          </button>
        </div>
      </div>

      {/* Chat area */}
      {current ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-card">
            <div className="w-8 h-8 flex items-center justify-center bg-secondary border border-border">
              {current.type === 'group' ? <Users size={14} className="text-muted-foreground" /> : (
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.65rem', color: '#ff5500' }}>{current.avatar}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em' }}>{current.name}</div>
              {current.members && <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em' }}>{current.members} members</div>}
              {current.status === 'accepted' && <div className="text-[#4ade80]" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em' }}>● CONNECTED</div>}
              {current.status === 'pending' && <div className="text-[#ff8c42]" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.08em' }}>● PENDING ACCEPTANCE</div>}
            </div>
          </div>

          {/* Pending acceptance banner */}
          {current.status === 'pending' && (
            <div className="mx-4 mt-4 p-4 border border-[#ff8c42]/30 bg-[#ff8c42]/5 flex flex-col gap-3">
              <div className="min-w-0">
                <div className="text-foreground uppercase mb-0.5" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.04em' }}>Message Request</div>
                <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', lineHeight: 1.5 }}>{current.name} wants to connect. Accept to enable replies.</div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1 border-t border-[#ff8c42]/20">
                <button onClick={() => acceptRequest(current.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/20 transition-all cursor-pointer whitespace-nowrap" style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <Check size={12} /> Accept
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-all cursor-pointer whitespace-nowrap" style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <X size={12} /> Decline
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {current.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${msg.mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!msg.mine && (
                    <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.06em' }}>{msg.sender}</span>
                  )}
                  <div className={`px-4 py-2.5 ${msg.mine ? 'bg-primary text-white' : 'bg-card border border-border text-foreground'}`}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.5 }}>{msg.text}</p>
                  </div>
                  <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem' }}>{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={current.status === 'pending' ? 'Accept request to reply...' : 'Type a message...'}
                disabled={current.status === 'pending'}
                className="flex-1 bg-secondary border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 disabled:opacity-40"
                style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}
              />
              <button
                onClick={send}
                disabled={current.status === 'pending' || !message.trim()}
                className="px-4 py-2.5 bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Select a conversation</div>
          </div>
        </div>
      )}
    </div>
  );
}
