import { use, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  useBoards,
  useCreateBoards,
  useDeleteBoards,
} from "../hooks/useBoards";
import { Layout, LogOut, Plus, Trash } from "lucide-react";

const COLORS = [
  "#5B4FCF",
  "#1D9E75",
  "#D85A30",
  "#D4537E",
  "#378ADD",
  "#BA7517",
];
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: boards, isLoading } = useBoards();
  const createBoards = useCreateBoards();
  const deleteBoards = useDeleteBoards();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createBoards.mutateAsync({ title, color });

    setTitle("");
    setColor(COLORS[0]);
    setShowModal(false);
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string,
  ) => {
    e.stopPropagation();
    if (confirm("Hapus board ini?"))
      await deleteBoards.mutateAsync(e.currentTarget.id);
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <span className="text-lg font-semibold text-gray-900">Task</span>
          <span className="text-lg font-semibold text-primary">flow</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden md:block text-sm text-gray-500 truncate max-w-45">
            {user?.email}
          </span>
          <button
            onClick={() => logout()}
            className="text-sm text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg"
          >
            <LogOut size={14} />
            <span className="hidden md:block">logout</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div>
            <h1 className="text-lg md:text-xl font-medium text-gray-900">
              Boards kamu
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {boards?.length ?? 0} boards aktif
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={16} />
            <span className=" hidden md:block">Board baru</span>
            <span className="md:hidden">Baru</span>
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[...Array(4)].map((_, i) => (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-gray-200 mb-3" />
                <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && boards?.length === 0 && (
          <div className=" flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mb-4">
              <Layout size={24} className="text-gray-200" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Belum ada board</p>
            <p className=" text-gray-400 text-sm mt-1 mb-4">
              Klik "Baru" untuk memulai
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm"
            >
              <Plus size={14} />
              Buat board pertama
            </button>
          </div>
        )}

        {/* Boards grid */}
        {!isLoading && boards && boards.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => navigate(`/board/${board.id}`)}
                className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 cursor-pointer hover:shadow-sm active:scale-95 transition-all group relative"
              >
                <div
                  className="w-8 h-8 rounded-lg mb-3"
                  style={{ backgroundColor: board.color }}
                />
                <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                  {board.title}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(board.created_at).toLocaleDateString("id-ID")}
                </p>

                {/* delete button */}
                <button onClick={(e) => handleDelete(e, board.id)}>
                  <Trash size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB - mobile - tombol tambah floating di mobile */}
      <button
        onClick={() => setShowModal(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center z-10 active:scale-95 transition"
      >
        <Plus size={24} />
      </button>

      {/* modal */}
      {showModal && (
        <div
          className=" fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          {/* mobile: sheet dari bawah, desktop: modal tengah */}
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full md:max-w-sm shadow-lg">
            {/* Handle bar mobile */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden" />
            <h2 className="text-base font-medium text-gray-900 mb-4">Buat board baru</h2>

            <label htmlFor="" className="text-xs text-gray-500 mb-1 block">Nama board</label>
            <input type="text" placeholder="contoh: Project Website" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-primary" autoFocus/>

            <label htmlFor="" className="text-xs text-gray-50 mb-2 block">Warna</label>
            <div className="flex gap-2 mb-6">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className="w-8 h-8 rounded-lg transition-all active:scale-90" style={{
                  background:c,
                  outline: color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: '2px'
                }}/>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 active:bg-gray-50">
                Batal
              </button>
              <button onClick={handleCreate} disabled={!title.trim() || createBoards.isPending} className="flex-1 bg-primary text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-60">{createBoards.isPending ? 'Menyimpan...' : 'Buat'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
