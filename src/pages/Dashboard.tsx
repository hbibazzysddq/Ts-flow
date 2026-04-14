import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useBoards, useCreateBoards, useDeleteBoards, useSharedBoards } from "../hooks/useBoards";
import { type Board } from "../services/BoardService";
import { LogOut, Plus, Trash2, LayoutGrid, Calendar, ArrowRight, Users } from "lucide-react";

const COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ef4444","#06b6d4"];
const COLOR_NAMES = ["Indigo","Pink","Amber","Emerald","Blue","Violet","Red","Cyan"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

function BoardCard({ board, onOpen, onDelete, shared }: {
  board: Board; onOpen: () => void; onDelete?: (e: React.MouseEvent) => void; shared?: boolean
}) {
  const [hovered, setHovered] = useState(false);
  
  // Use lazy initializer for useState to avoid calling impure function during render
  const [now] = useState(() => Date.now());
  
  const daysSince = useMemo(() => {
    const createdDate = new Date(board.created_at);
    return Math.floor((now - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [board.created_at, now]);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group relative overflow-hidden fade-in"
    >
      <div className="h-1 w-full" style={{ background: board.color }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${board.color}18` }}>
            <div className="w-4 h-4 rounded-sm" style={{ background: board.color }} />
          </div>
          <div className="flex items-center gap-1">
            {shared && (
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <Users size={9} /> shared
              </span>
            )}
            {onDelete && (
              <button onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">{board.title}</h3>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={11} />
            {daysSince === 0 ? "Hari ini" : daysSince === 1 ? "Kemarin" : `${daysSince}h lalu`}
          </div>
          <div className="flex items-center gap-1 text-xs font-medium transition-all" style={{ color: hovered ? board.color : "#9ca3af" }}>
            Buka <ArrowRight size={11} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: boards, isLoading } = useBoards();
  const { data: sharedBoards, isLoading: isLoadingShared } = useSharedBoards();
  const createBoards = useCreateBoards();
  const deleteBoards = useDeleteBoards();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createBoards.mutateAsync({ title, color });
    setTitle(""); setColor(COLORS[0]); setShowModal(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Hapus board ini?")) await deleteBoards.mutateAsync(id);
  };

  const firstName = user?.email?.split("@")[0] ?? "there";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-5 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">TaskFlow</span>
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
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-8">
        {/* Greeting */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-0.5">{getGreeting()},</p>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{firstName} 👋</h1>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-primary hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm shadow-primary/20">
            <Plus size={15} strokeWidth={2.5} />
            <span className="hidden sm:inline">Board baru</span>
            <span className="sm:hidden">Baru</span>
          </button>
        </div>

        {/* Stats */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { label: "Board saya", value: boards?.length ?? 0, icon: "📋" },
              { label: "Diundang ke", value: sharedBoards?.length ?? 0, icon: "🤝" },
              { label: "Dibuat bulan ini", value: boards?.filter(b => new Date(b.created_at).getMonth() === new Date().getMonth()).length ?? 0, icon: "📅" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{s.icon}</span>
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* My Boards */}
        <>
          {!isLoading && (boards?.length ?? 0) > 0 && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Board Saya</h2>
              <span className="text-xs text-gray-400">{boards?.length} board</span>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
                  <div className="h-1 bg-gray-200" />
                  <div className="p-4">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 mb-3" />
                    <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-4" />
                    <div className="h-px bg-gray-100 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && (boards?.length ?? 0) === 0 && (sharedBoards?.length ?? 0) === 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center py-16 text-center mb-8 fade-in">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
                <LayoutGrid size={22} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Belum ada board</p>
              <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">
                Buat board pertama dan mulai organisir task kamu dalam kolom Kanban.
              </p>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 bg-primary hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                <Plus size={14} strokeWidth={2.5} />
                Buat board pertama
              </button>
            </div>
          )}

          {!isLoading && (boards?.length ?? 0) > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {boards!.map(board => (
                <BoardCard key={board.id} board={board}
                  onOpen={() => navigate(`/board/${board.id}`)}
                  onDelete={e => handleDelete(e, board.id)} />
              ))}
            </div>
          )}
        </>

        {/* Shared Boards */}
        {!isLoadingShared && (sharedBoards?.length ?? 0) > 0 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Diundang</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Users size={10} /> {sharedBoards?.length}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sharedBoards!.map(board => (
                <BoardCard key={board.id} board={board}
                  onOpen={() => navigate(`/board/${board.id}`)}
                  shared />
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setShowModal(true)}
        className="md:hidden fixed bottom-5 right-5 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
        <Plus size={20} />
      </button>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/25 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-gray-200 fade-in">
            <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900">Board baru</h2>
                <button onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama board</label>
                <input type="text" placeholder="cth: Project Website, Sprint Q2..."
                  value={title} onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreate()}
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>

              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-700 mb-2">Warna</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c, i) => (
                    <button key={c} onClick={() => setColor(c)} title={COLOR_NAMES[i]}
                      className="w-7 h-7 rounded-lg transition-all relative"
                      style={{ background: c, outline: color === c ? `2px solid ${c}` : "2px solid transparent", outlineOffset: "2px", transform: color === c ? "scale(1.15)" : "scale(1)" }}>
                      {color === c && (
                        <svg className="absolute inset-0 m-auto" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {title && (
                <div className="mb-5 bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: `${color}20` }}>
                    <div className="w-3.5 h-3.5 rounded-sm" style={{ background: color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="text-xs text-gray-400">Preview board</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button onClick={handleCreate} disabled={!title.trim() || createBoards.isPending}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                  {createBoards.isPending ? "Membuat..." : "Buat Board"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
