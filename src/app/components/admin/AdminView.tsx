// IMPORTANT: Before modifying this file, please update CHANGELOG.md with a summary of your changes.
import { useState } from "react";
import { FileText, Download, Check, X, Eye, Clock, Users, Lock, Unlock, ChevronDown, ChevronUp, AlertCircle, ShieldCheck } from "lucide-react";

const contracts = [
  { id: 'C-2024-0089', athlete: 'Jordan Cole', program: 'Elite Strength', coach: 'Marcus Webb', amount: '$149/mo', duration: '3 months', signed: 'Jun 12, 2025', status: 'Pending', type: 'Virtual' },
  { id: 'C-2024-0088', athlete: 'Rosa Mendez', program: 'Elite Strength', coach: 'Marcus Webb', amount: '$149/mo', duration: '1 month', signed: 'Jun 10, 2025', status: 'Approved', type: 'In-Person' },
  { id: 'C-2024-0087', athlete: 'Tyler Ramos', program: 'Elite Strength', coach: 'Marcus Webb', amount: '$298/mo', duration: '2 months', signed: 'Jun 8, 2025', status: 'Approved', type: 'Hybrid' },
  { id: 'C-2024-0086', athlete: 'Kira Voss', program: 'Recovery & Mobility', coach: 'James Ortega', amount: '$79/mo', duration: '6 months', signed: 'May 30, 2025', status: 'Approved', type: 'Virtual' },
  { id: 'C-2024-0085', athlete: 'DeShawn Grant', program: 'Olympic Lifting', coach: 'Priya Sharma', amount: '$179/mo', duration: '1 month', signed: 'May 28, 2025', status: 'Rejected', type: 'In-Person' },
];

const customRequests = [
  {
    id: 'CR-041',
    athlete: 'Marcus Liu',
    submitted: 'Jun 12, 2025',
    status: 'Pending',
    goal: 'Improve 40-yard dash from 4.7s to 4.5s for NFL combine preparation',
    level: 'Advanced — 5 years training, D3 wide receiver',
    equipment: 'Full track access, weight room with sleds, cones, resistance bands',
    time: '6 days/week, 90-120 min per session',
    injury: 'Hamstring grade 1 strain (recovered Feb 2025). Cleared.',
  },
  {
    id: 'CR-040',
    athlete: 'Sasha Winters',
    submitted: 'Jun 11, 2025',
    status: 'In Review',
    goal: 'Post-pregnancy return to competitive CrossFit within 6 months',
    level: 'Intermediate — 3 years CrossFit pre-pregnancy',
    equipment: 'Home gym: pull-up bar, dumbbells to 35 lbs, jump rope, bike',
    time: '5 days/week, 45-60 min',
    injury: 'C-section recovery — cleared for full activity by OBGYN as of Jun 1',
  },
  {
    id: 'CR-039',
    athlete: 'Felipe Torres',
    submitted: 'Jun 9, 2025',
    status: 'Approved',
    goal: 'Increase vertical jump from 28" to 36" for AAU basketball',
    level: 'Intermediate — 2 years structured training',
    equipment: 'Community gym, no sled. Has weight vest.',
    time: '4 days/week, 60 min',
    injury: 'None',
  },
];

const groups = [
  { id: 1, name: 'Elite Strength', type: 'Program', members: 5, coach: 'Marcus Webb', locked: false },
  { id: 2, name: 'Sprint Mechanics', type: 'Program', members: 8, coach: 'Aisha Kim', locked: false },
  { id: 3, name: 'Recovery & Mobility', type: 'Program', members: 18, coach: 'James Ortega', locked: false },
  { id: 4, name: 'AFSP Community', type: 'Global', members: 148, coach: 'Admin', locked: false },
  { id: 5, name: 'Coaches Channel', type: 'Internal', members: 6, coach: 'Admin', locked: true },
];

interface AdminViewProps {
  currentPage: string;
}

export function AdminView({ currentPage }: AdminViewProps) {
  const [contractList, setContractList] = useState(contracts);
  const [requestList, setRequestList] = useState(customRequests);
  const [groupList, setGroupList] = useState(groups);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  const approveContract = (id: string) => setContractList(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
  const rejectContract = (id: string) => setContractList(prev => prev.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
  const approveRequest = (id: string) => setRequestList(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  const rejectRequest = (id: string) => setRequestList(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  const toggleLock = (id: number) => setGroupList(prev => prev.map(g => g.id === id ? { ...g, locked: !g.locked } : g));

  const statusColor = (s: string) => {
    if (s === 'Approved') return 'text-[#4ade80] border-[#4ade80]/30';
    if (s === 'Rejected') return 'text-destructive border-destructive/30';
    if (s === 'In Review') return 'text-[#60a5fa] border-[#60a5fa]/30';
    return 'text-[#ff8c42] border-[#ff8c42]/30';
  };

  if (currentPage === 'admin-dashboard') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>ADMINISTRATION</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            ADMIN<br /><span className="text-[#a78bfa]">OVERVIEW</span>
          </h1>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Pending Contracts', value: contractList.filter(c => c.status === 'Pending').length.toString(), color: '#ff8c42', sub: 'awaiting approval' },
            { label: 'Custom Requests', value: requestList.filter(r => r.status === 'Pending' || r.status === 'In Review').length.toString(), color: '#60a5fa', sub: 'in pipeline' },
            { label: 'Total Athletes', value: '148', color: '#4ade80', sub: 'platform-wide' },
            { label: 'Active Programs', value: '5', color: '#a78bfa', sub: 'running now' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border p-4">
              <div className="text-muted-foreground uppercase mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.2rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div className="text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border p-5">
            <div className="text-muted-foreground uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>Recent Contracts</div>
            <div className="space-y-2.5">
              {contractList.slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }}>{c.athlete}</div>
                    <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>{c.id} · {c.signed}</div>
                  </div>
                  <span className={`px-2 py-0.5 border uppercase ${statusColor(c.status)}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em' }}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border p-5">
            <div className="text-muted-foreground uppercase mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.12em' }}>Custom Requests Queue</div>
            <div className="space-y-2.5">
              {requestList.map(r => (
                <div key={r.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }}>{r.athlete}</div>
                    <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>{r.id} · {r.submitted}</div>
                  </div>
                  <span className={`px-2 py-0.5 border uppercase ${statusColor(r.status)}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em' }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'admin-contracts') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>CONTRACT MANAGEMENT</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            ENROLLMENT<br /><span className="text-[#a78bfa]">CONTRACTS</span>
          </h1>
        </div>
        <div className="space-y-2">
          {contractList.map(c => (
            <div key={c.id} className="bg-card border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <FileText size={20} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>{c.id}</span>
                      <span className={`px-2 py-0.5 border uppercase ${statusColor(c.status)}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em' }}>{c.status}</span>
                    </div>
                    <div className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.04em' }}>{c.athlete}</div>
                    <div className="text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>
                      {c.program} · {c.coach} · {c.type} · {c.duration} · {c.amount}
                    </div>
                    <div className="text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>Signed: {c.signed}</div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                    <Eye size={13} /> View
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                    <Download size={13} /> PDF
                  </button>
                  {c.status === 'Pending' && (
                    <>
                      <button onClick={() => approveContract(c.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/20 transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        <Check size={13} /> Approve
                      </button>
                      <button onClick={() => rejectContract(c.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                        <X size={13} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentPage === 'admin-requests') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>CUSTOM PROGRAMS</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            PROGRAM<br /><span className="text-[#a78bfa]">REQUESTS</span>
          </h1>
        </div>
        <div className="space-y-3">
          {requestList.map(r => {
            const open = expandedRequest === r.id;
            return (
              <div key={r.id} className="bg-card border border-border">
                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted transition-all" onClick={() => setExpandedRequest(open ? null : r.id)}>
                  <AlertCircle size={18} className={r.status === 'Pending' ? 'text-[#ff8c42]' : r.status === 'In Review' ? 'text-[#60a5fa]' : r.status === 'Approved' ? 'text-[#4ade80]' : 'text-destructive'} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.04em' }}>{r.athlete}</span>
                      <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>{r.id}</span>
                    </div>
                    <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>{r.goal.slice(0, 70)}...</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}><Clock size={11} /> {r.submitted}</span>
                    <span className={`px-2 py-0.5 border uppercase ${statusColor(r.status)}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em' }}>{r.status}</span>
                    <span className="text-muted-foreground">{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
                  </div>
                </div>
                {open && (
                  <div className="border-t border-border px-5 py-4 bg-muted space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        ['Goal', r.goal],
                        ['Level', r.level],
                        ['Equipment', r.equipment],
                        ['Time Available', r.time],
                        ['Injury / Medical', r.injury],
                      ].map(([label, val]) => (
                        <div key={label} className={label === 'Goal' ? 'col-span-2' : ''}>
                          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.1em' }}>{label}</div>
                          <div className="text-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.5 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {(r.status === 'Pending' || r.status === 'In Review') && (
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <button onClick={() => approveRequest(r.id)} className="flex items-center gap-1.5 px-4 py-2 bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] hover:bg-[#4ade80]/20 transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                          <Check size={14} /> Approve & Assign Coach
                        </button>
                        <button onClick={() => rejectRequest(r.id)} className="flex items-center gap-1.5 px-4 py-2 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                          <X size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (currentPage === 'admin-groups') {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div>
          <div className="text-muted-foreground uppercase mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.12em' }}>GROUP MANAGEMENT</div>
          <h1 className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.04em' }}>
            CHAT<br /><span className="text-[#a78bfa]">GROUPS</span>
          </h1>
        </div>
        <div className="space-y-2">
          {groupList.map(g => (
            <div key={g.id} className="bg-card border border-border p-5 flex items-center gap-4">
              <ShieldCheck size={20} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-0.5">
                  <span className="text-foreground uppercase" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.04em' }}>{g.name}</span>
                  <span className="text-muted-foreground border border-border px-2 py-0.5 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em' }}>{g.type}</span>
                  {g.locked && <span className="text-destructive border border-destructive/30 px-2 py-0.5 uppercase" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.08em' }}>Locked</span>}
                </div>
                <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}>
                  <Users size={11} className="inline mr-1" />{g.members} members · Coach: {g.coach}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                  View
                </button>
                <button
                  onClick={() => toggleLock(g.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all cursor-pointer uppercase ${g.locked ? 'border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/10 hover:bg-[#4ade80]/20' : 'border-[#ff8c42]/30 text-[#ff8c42] bg-[#ff8c42]/10 hover:bg-[#ff8c42]/20'}`}
                  style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}
                >
                  {g.locked ? <><Unlock size={13} /> Unlock</> : <><Lock size={13} /> Lock</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
