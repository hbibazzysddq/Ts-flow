import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useOwnBoardsWithMembers, usePendingInvites, usePendingInvitesForUser, useInviteMember, useRemoveMember, useAcceptInvite, useDeclineInvite } from "../hooks/useCollab";
import { useSharedBoards } from "../hooks/useBoards";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Users, X, UserPlus, Mail, ArrowRight, LayoutGrid, Clock, Send, ExternalLink, Check } from "lucide-react";

function avatarInitial(email: string) {
  return (email?.charAt(0) ?? "?").toUpperCase();
}

// ── Member Management Modal ────────────────────────────────────────────
function ManageMembersModal({ boardId, boardTitle, boardColor, onClose }: {
  boardId: string; boardTitle: string; boardColor: string; onClose: () => void
}) {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [err, setErr] = useState("");
  const invite = useInviteMember(boardId);
  const remove = useRemoveMember(boardId);
  const qc = useQueryClient();
  const { user } = useAuth();

  const { data: boards } = useOwnBoardsWithMembers();
  const board = boards?.find((b: any) => b.id === boardId);
  const members: any[] = board?.board_members ?? [];

  const handleInvite = async () => {
    if (!email.trim()) return;
    setErr(""); setSuccess("");
    if (email.toLowerCase() === user?.email?.toLowerCase()) {
      setErr("Cannot invite yourself."); return;
    }
    const { error } = await invite.mutateAsync(email.trim());
    if (error) {
      setErr(error.message.includes("unique") ? "Email already invited." : error.message);
      return;
    }
    setSuccess(`Invitation sent to ${email}`);
    setEmail("");
    qc.invalidateQueries({ queryKey: ["own_boards_with_members"] });
  };

  const handleRemove = async (id: string) => {
    await remove.mutateAsync(id);
    qc.invalidateQueries({ queryKey: ["own_boards_with_members"] });
  };

  const activeCount = members.filter((m: any) => m.status === "active").length;

  return (
    <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-gray-200 fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-md flex-shrink-0" style={{ background: boardColor }} />
            <h2 className="text-sm font-semibold text-gray-900 truncate">{boardTitle}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0">
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-gray-600 mb-2">Invite new member</p>
          <div className="flex gap-2 mb-4">
            <input type="email" placeholder="email@contoh.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleInvite()}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              autoFocus />
            <button onClick={handleInvite} disabled={!email.trim() || invite.isPending}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors">
              {invite.isPending ? "..." : "Invite"}
            </button>
          </div>

          {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{err}</p>}
          {success && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-3">✓ {success}</p>}

          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600">Members ({activeCount})</p>
          </div>
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0 ${
                    m.role === "owner" ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-600"
                  }`}>
                    {avatarInitial(m.email)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate max-w-[160px]">{m.email}</p>
                    <p className="text-[11px] text-gray-400">
                      {m.role === "owner" ? "Owner" : m.status === "pending" ? "Pending..." : "Member"}
                    </p>
                  </div>
                </div>
                {m.role !== "owner" && (
                  <button onClick={() => handleRemove(m.id)}
                    className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Collab Page ─────────────────────────────────────────────────────────
export default function Collab() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: ownBoards, isLoading: loadingOwn } = useOwnBoardsWithMembers();
  const { data: sharedBoards, isLoading: loadingShared } = useSharedBoards();
  const { data: pendingInvites, isLoading: loadingPending } = usePendingInvites();
  const { data: myInvites, isLoading: loadingMyInvites } = usePendingInvitesForUser();
  const acceptInvite = useAcceptInvite();
  const declineInvite = useDeclineInvite();
  const [manageBoard, setManageBoard] = useState<{ id: string; title: string; color: string } | null>(null);

  const firstName = user?.email?.split("@")[0] ?? "there";

  const totalMembers = (ownBoards as any[] | undefined)?.reduce((sum: number, b: any) =>
    sum + (b.board_members?.filter((m: any) => m.status === "active").length ?? 0), 0) ?? 0;

  const totalPending = (pendingInvites as any[] | undefined)?.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-5 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">TaskFlow</span>
          </button>
          <div className="hidden sm:flex items-center gap-1 text-xs">
            <button onClick={() => navigate("/")}
              className="px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              Dashboard
            </button>
            <button onClick={() => navigate("/collab")}
              className="px-2.5 py-1.5 rounded-lg text-primary bg-primary/10 font-medium transition-colors">
              Collaboration
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-600 max-w-[140px] truncate">{user?.email}</span>
          </div>
          <button onClick={() => logout()}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-0.5">Collaboration</p>
            <h1 className="text-2xl font-bold text-gray-900">Collaboration Hub</h1>
          </div>
        </div>

        {/* Stats */}
        {!loadingOwn && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Board", value: ownBoards?.length ?? 0, icon: LayoutGrid, color: "text-indigo-500" },
              { label: "Active members", value: totalMembers, icon: Users, color: "text-emerald-500" },
              { label: "Pending invites", value: totalPending, icon: Send, color: "text-amber-500" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon size={14} className={s.color} />
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Owned Boards */}
        {loadingOwn && (
          <div className="flex flex-col gap-3 mb-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loadingOwn && (ownBoards as any[] | undefined)?.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-12 text-center mb-8 fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
              <Users size={22} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">No boards yet</p>
            <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">
              Create a board first to start collaborating with your team.
            </p>
            <button onClick={() => navigate("/")}
              className="flex items-center gap-1.5 bg-primary hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
              <LayoutGrid size={14} />
              Go to Dashboard
            </button>
          </div>
        )}

        {/* My Boards section */}
        {!loadingOwn && ownBoards != null && (ownBoards as any[]).length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">My Boards</h2>
              <span className="text-xs text-gray-400">{(ownBoards as any[]).length} boards</span>
            </div>
            <div className="flex flex-col gap-3 mb-8">
              {(ownBoards as any[])?.map((board: any) => {
                const activeMembers = board.board_members?.filter((m: any) => m.status === "active") ?? [];
                const pendingCount = board.board_members?.filter((m: any) => m.status === "pending").length ?? 0;
                return (
                  <div key={board.id}
                    className="bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all fade-in">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: `${board.color}18` }}>
                            <div className="w-4 h-4 rounded-sm" style={{ background: board.color }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{board.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center -space-x-1">
                                {activeMembers.slice(0, 3).map((m: any) => (
                                  <div key={m.id}
                                    title={m.email}
                                    className="w-5 h-5 rounded-full bg-indigo-100 text-primary text-[9px] font-bold flex items-center justify-center border border-white">
                                    {avatarInitial(m.email)}
                                  </div>
                                ))}
                                {activeMembers.length > 3 && (
                                  <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[8px] font-bold flex items-center justify-center border border-white">
                                    +{activeMembers.length - 3}
                                  </div>
                                )}
                              </div>
                              <span className="text-[11px] text-gray-400">
                                {activeMembers.length} members
                                {pendingCount > 0 && ` · ${pendingCount} pending`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setManageBoard({ id: board.id, title: board.title, color: board.color })}
                          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
                          <UserPlus size={13} />
                          <span className="hidden sm:inline">Manage</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Shared Boards */}
        {!loadingShared && sharedBoards != null && (sharedBoards as any[]).length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Collaborations</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Users size={10} /> {(sharedBoards as any[]).length}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {(sharedBoards as any[])?.map((board: any) => (
                <div key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group relative overflow-hidden fade-in">
                  <div className="h-1 w-full" style={{ background: board.color }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${board.color}18` }}>
                        <div className="w-4 h-4 rounded-sm" style={{ background: board.color }} />
                      </div>
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Users size={9} /> shared
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 truncate">{board.title}</h3>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-400">Members</span>
                      <ExternalLink size={12} className="text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* My Invitations (Accept/Decline) */}
        {!loadingMyInvites && myInvites != null && (myInvites as any[]).length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-700">My Invitations</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Mail size={10} /> {(myInvites as any[]).length}
              </span>
            </div>
            <div className="flex flex-col gap-2 mb-8">
              {(myInvites as any[])?.map((inv: any) => {
                const boardInfo = inv.boards ?? {};
                const isAccepting = acceptInvite.isPending;
                const isDeclining = declineInvite.isPending;
                return (
                  <div key={inv.id}
                    className="bg-white border border-amber-200 rounded-xl px-4 py-3.5 flex items-center justify-between fade-in">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                        {avatarInitial(boardInfo.title ?? "B")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{boardInfo.title ?? "Board"}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Users size={10} />
                          <span>You're invited to collaborate</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => acceptInvite.mutateAsync(inv.id)}
                        disabled={isAccepting || isDeclining}
                        className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors">
                        <Check size={12} />
                        {isAccepting ? "..." : "Accept"}
                      </button>
                      <button onClick={() => declineInvite.mutateAsync(inv.id)}
                        disabled={isAccepting || isDeclining}
                        className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors">
                        <X size={12} />
                        {isDeclining ? "..." : "Decline"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pending Invites (from my boards) */}
        {!loadingPending && totalPending > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Pending Invitations</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock size={10} /> {totalPending}
              </span>
            </div>
            <div className="flex flex-col gap-2 mb-8">
              {(pendingInvites as any[])?.map((inv: any) => (
                <div key={inv.id}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between fade-in">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                      {avatarInitial(inv.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{inv.email}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Mail size={10} />
                        <span>Collab · </span>
                        <span className="font-medium text-gray-600 truncate max-w-[120px]">{(inv as any).boards?.title ?? "Board"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAB mobile */}
      <button onClick={() => navigate("/")}
        className="md:hidden fixed bottom-5 right-5 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
        <ArrowRight size={20} />
      </button>

      {/* Manage Members Modal */}
      {manageBoard && (
        <ManageMembersModal
          boardId={manageBoard.id}
          boardTitle={manageBoard.title}
          boardColor={manageBoard.color}
          onClose={() => setManageBoard(null)}
        />
      )}
    </div>
  );
}
