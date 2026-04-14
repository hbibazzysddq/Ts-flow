import { ArrowLeft, GripVertical, Plus, Trash2, X, MoreHorizontal, UserPlus, Users, Wifi, WifiOff } from "lucide-react";
import { useTask } from "../hooks/useTask";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBoards } from "../hooks/useBoards";
import { useColumns, useCreateColumns, useDeleteColumns } from "../hooks/useColumns";
import { type Column } from "../services/ColumnServices";
import { useBoardMembers, useInviteMember, useRemoveMember } from "../hooks/useCollab";
import { useAuth } from "../context/AuthContext";
import supabase from "../services/Supabase";
import {
  DndContext, DragOverlay, closestCorners,
  PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable,
  verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQueryClient } from "@tanstack/react-query";
import { reorderTasks, type Task } from "../services/TaskService";

const PRIORITY = {
  low:    { label: "Low",    cls: "bg-green-50 text-green-700 border-green-200" },
  medium: { label: "Med",    cls: "bg-amber-50 text-amber-700 border-amber-200" },
  high:   { label: "High",   cls: "bg-red-50 text-red-600 border-red-200" },
};
const COL_COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ef4444","#06b6d4"];

function avatarInitial(email: string) {
  return (email?.charAt(0) ?? "?").toUpperCase();
}

// ── Invite modal ──────────────────────────────────────────────────────────────
function InviteModal({ boardId, onClose }: { boardId: string; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [err, setErr] = useState("");
  const invite = useInviteMember(boardId);
  const remove = useRemoveMember(boardId);
  const { data: members } = useBoardMembers(boardId);
  const { user } = useAuth();

  const handleInvite = async () => {
    if (!email.trim()) return;
    setErr(""); setSuccess("");
    if (email.toLowerCase() === user?.email?.toLowerCase()) {
      setErr("Tidak bisa mengundang diri sendiri."); return;
    }
    const { error } = await invite.mutateAsync(email.trim());
    if (error) { setErr(error.message.includes("unique") ? "Email sudah diundang." : error.message); return; }
    setSuccess(`Undangan dikirim ke ${email}`);
    setEmail("");
  };

  return (
    <div
      className="fixed inset-0 bg-black/25 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-200 fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-gray-900">Anggota Board</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          {/* Invite input */}
          <p className="text-xs font-medium text-gray-600 mb-2">Undang lewat email</p>
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder="email@contoh.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleInvite()}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              autoFocus
            />
            <button
              onClick={handleInvite}
              disabled={!email.trim() || invite.isPending}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {invite.isPending ? "..." : "Undang"}
            </button>
          </div>

          {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{err}</p>}
          {success && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-3">✓ {success}</p>}

          {/* Members list */}
          <p className="text-xs font-medium text-gray-600 mb-2">
            Anggota saat ini ({members?.length ?? 0})
          </p>
          <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
            {members?.map(m => (
              <div key={m.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-full text-[11px] font-bold flex items-center justify-center flex-shrink-0 ${
                    m.role === "owner" ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-600"
                  }`}>
                    {avatarInitial(m.email)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800 truncate max-w-[180px]">{m.email}</p>
                    <p className="text-[11px] text-gray-400">
                      {m.role === "owner" ? "Pemilik" : m.status === "pending" ? "Menunggu..." : "Anggota"}
                    </p>
                  </div>
                </div>
                {m.role !== "owner" && (
                  <button
                    onClick={() => remove.mutate(m.id)}
                    className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            {(members?.length ?? 0) === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">
                Belum ada anggota lain
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sortable Task Card ─────────────────────────────────────────────────────────
function SortableTaskCard({ task, onDelete, onClick }: {
  task: Task; onDelete: (id: string) => void; onClick: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const pr = PRIORITY[task.priority as keyof typeof PRIORITY] ?? PRIORITY.low;
  const isOverdue = task.deadline && new Date(task.deadline) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0 : 1 }}
      className="bg-white border border-gray-200 rounded-xl p-3 group hover:border-gray-300 hover:shadow-sm transition-all relative"
    >
      <div {...attributes} {...listeners}
        className="absolute top-3 left-2 text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity">
        <GripVertical size={13} />
      </div>

      <div onClick={() => onClick(task.id)} className="pl-4 cursor-pointer">
        <p className="text-sm text-gray-800 leading-snug mb-2 pr-6">{task.title}</p>
        {task.description && (
          <p className="text-xs text-gray-400 leading-relaxed mb-2 line-clamp-2 pr-2">{task.description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${pr.cls}`}>{pr.label}</span>
          {task.deadline && (
            <span className={`text-[11px] flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {isOverdue ? "Overdue · " : ""}{new Date(task.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </span>
          )}
          {task.assigned_email && (
            <span className="ml-auto flex items-center">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-primary text-[10px] font-bold flex items-center justify-center" title={task.assigned_email}>
                {avatarInitial(task.assigned_email)}
              </span>
            </span>
          )}
        </div>
      </div>

      <button onClick={e => { e.stopPropagation(); onDelete(task.id); }}
        className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
        <Trash2 size={11} />
      </button>
    </div>
  );
}

function TaskOverlay({ task }: { task: Task }) {
  const pr = PRIORITY[task.priority as keyof typeof PRIORITY] ?? PRIORITY.low;
  return (
    <div className="bg-white border border-indigo-300 rounded-xl p-3 shadow-lg w-64 rotate-1 scale-105">
      <p className="text-sm text-gray-800 mb-2">{task.title}</p>
      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded border ${pr.cls}`}>{pr.label}</span>
    </div>
  );
}

// ── Kanban Column ──────────────────────────────────────────────────────────────
function KanbanColumn({ column, tasks, accent, onDeleteColumn, onNavigate, onDeleteTask, onCreateTask, isCreating }: {
  column: any; tasks: Task[]; accent: string;
  onDeleteColumn: (id: string) => void;
  onNavigate: (id: string) => void;
  onDeleteTask: (colId: string, id: string) => void;
  onCreateTask: (colId: string, title: string, order: number) => Promise<void>;
  isCreating: boolean;
}) {
  const [showInput, setShowInput] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

  const handleCreate = async () => {
    if (!taskTitle.trim()) return;
    await onCreateTask(column.id, taskTitle, tasks.length);
    setTaskTitle(""); setShowInput(false);
  };

  return (
    <div className="flex-shrink-0 w-[272px] flex flex-col bg-gray-100/60 rounded-xl border border-gray-200 max-h-[calc(100vh-80px)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-white border-b border-gray-200 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
          <span className="text-sm font-medium text-gray-800">{column.title}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">{tasks.length}</span>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(v => !v)}
            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <MoreHorizontal size={14} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-7 bg-white border border-gray-200 rounded-lg shadow-md py-1 w-36 z-10">
              <button onClick={() => { setShowMenu(false); onDeleteColumn(column.id); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors">
                <Trash2 size={12} /> Hapus kolom
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 min-h-[48px]">
          {tasks.map(task => (
            <SortableTaskCard key={task.id} task={task}
              onDelete={id => onDeleteTask(column.id, id)} onClick={onNavigate} />
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-xs text-gray-400">Belum ada task</p>
              <p className="text-[11px] text-gray-300 mt-0.5">Drag task ke sini atau klik tambah</p>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add task */}
      <div className="px-2 pb-2">
        {showInput ? (
          <div className="bg-white border border-indigo-300 rounded-xl p-2.5 shadow-sm">
            <textarea placeholder="Nama task..." value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleCreate(); } if (e.key === "Escape") setShowInput(false); }}
              rows={2} autoFocus
              className="w-full text-sm text-gray-800 bg-transparent border-none outline-none resize-none leading-snug placeholder-gray-400" />
            <div className="flex items-center gap-1.5 mt-2">
              <button onClick={handleCreate} disabled={!taskTitle.trim() || isCreating}
                className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                {isCreating ? "..." : "Tambah"}
              </button>
              <button onClick={() => { setShowInput(false); setTaskTitle(""); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={13} />
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowInput(true)}
            className="w-full flex items-center gap-1.5 px-2.5 py-2 text-xs text-gray-400 hover:text-gray-700 hover:bg-white border border-dashed border-gray-200 hover:border-gray-300 rounded-lg transition-all">
            <Plus size={12} strokeWidth={2.5} />
            Tambah task
          </button>
        )}
      </div>
    </div>
  );
}

function ColumnWithTasks({ column, accent, getTasksForColumn, onDeleteColumn, onNavigate, onDeleteTask, onCreateTask }: {
  column: any; accent: string;
  getTasksForColumn: (id: string) => Task[];
  onDeleteColumn: (id: string) => void;
  onNavigate: (id: string) => void;
  onDeleteTask: (colId: string, id: string) => void;
  onCreateTask: (colId: string, title: string, order: number) => Promise<void>;
}) {
  useTask(column.id);
  const [creating, setCreating] = useState(false);
  const tasks = getTasksForColumn(column.id);
  const handleCreate = async (colId: string, title: string, order: number) => {
    setCreating(true);
    await onCreateTask(colId, title, order);
    setCreating(false);
  };
  return <KanbanColumn column={column} tasks={tasks} accent={accent}
    onDeleteColumn={onDeleteColumn} onNavigate={onNavigate}
    onDeleteTask={onDeleteTask} onCreateTask={handleCreate} isCreating={creating} />;
}

// ── Main Board ─────────────────────────────────────────────────────────────────
export default function Board() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: boards } = useBoards();
  const { data: columns, isLoading } = useColumns(id!);
  const { data: members } = useBoardMembers(id!);
  const createColumn = useCreateColumns(id!);
  const deleteColumn = useDeleteColumns(id!);

  const currentBoard = boards?.find(b => b.id === id);
  const [showInput, setShowInput] = useState(false);
  const [colTitle, setColTitle] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [connected, setConnected] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overrides, setOverrides] = useState<Record<string, Task[]> | null>(null);
  const columnsRef = useRef(columns);
  useEffect(() => { columnsRef.current = columns; }, [columns]);

  // ── Realtime ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`board-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "columns" }, (payload) => {
        const col = (payload.new || payload.old) as Partial<Column>;
        if (col?.board_id === id) qc.invalidateQueries({ queryKey: ["columns", id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload) => {
        const task = (payload.new || payload.old) as Partial<Task>;
        const colId = columnsRef.current?.find(c => c.id === task?.column_id)?.id;
        if (colId) qc.invalidateQueries({ queryKey: ["tasks", colId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "board_members" }, () => {
        qc.invalidateQueries({ queryKey: ["board_members", id] });
      })
      .subscribe(status => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const getTasksForColumn = useCallback((colId: string): Task[] => {
    if (overrides?.[colId]) return overrides[colId];
    return qc.getQueryData<Task[]>(["tasks", colId]) ?? [];
  }, [overrides, qc]);

  const handleCreateColumn = async () => {
    if (!colTitle.trim()) return;
    await createColumn.mutateAsync({ title: colTitle, order: columns?.length ?? 0 });
    setColTitle(""); setShowInput(false);
  };

  const handleDeleteColumn = async (colId: string) => {
    if (confirm("Hapus kolom ini?")) deleteColumn.mutateAsync(colId);
  };

  const handleCreateTask = async (colId: string, title: string, order: number) => {
    const { createTask } = await import("../services/TaskService");
    await createTask(colId, title, order);
    qc.invalidateQueries({ queryKey: ["tasks", colId] });
  };

  const handleDeleteTask = async (colId: string, taskId: string) => {
    if (confirm("Hapus task ini?")) {
      const { deleteTask } = await import("../services/TaskService");
      await deleteTask(taskId);
      qc.invalidateQueries({ queryKey: ["tasks", colId] });
    }
  };

  // DnD
  const onDragStart = (e: DragStartEvent) => {
    if (!columns) return;
    const snap: Record<string, Task[]> = {};
    for (const c of columns) snap[c.id] = [...(qc.getQueryData<Task[]>(["tasks", c.id]) ?? [])];
    setOverrides(snap);
    for (const tasks of Object.values(snap)) {
      const t = tasks.find(t => t.id === e.active.id);
      if (t) { setActiveTask(t); break; }
    }
  };

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over || !overrides || !columns) return;
    const aid = active.id as string, oid = over.id as string;
    let ac: string | null = null, oc: string | null = null;
    for (const [cid, tasks] of Object.entries(overrides)) {
      if (tasks.some(t => t.id === aid)) ac = cid;
      if (tasks.some(t => t.id === oid)) oc = cid;
    }
    if (!oc && columns.some(c => c.id === oid)) oc = oid;
    if (!ac || !oc || ac === oc) return;
    setOverrides(prev => {
      if (!prev) return prev;
      const src = [...prev[ac!]], dst = [...prev[oc!]];
      const idx = src.findIndex(t => t.id === aid);
      if (idx === -1) return prev;
      const [moved] = src.splice(idx, 1);
      moved.column_id = oc!;
      const overIdx = dst.findIndex(t => t.id === oid);
      if (overIdx === -1) dst.push(moved); else dst.splice(overIdx, 0, moved);
      return { ...prev, [ac!]: src, [oc!]: dst };
    });
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveTask(null);
    if (!over || !overrides || !columns) { setOverrides(null); return; }
    const aid = active.id as string, oid = over.id as string;
    let ac: string | null = null, oc: string | null = null;
    for (const [cid, tasks] of Object.entries(overrides)) {
      if (tasks.some(t => t.id === aid)) ac = cid;
      if (tasks.some(t => t.id === oid)) oc = cid;
    }
    if (!oc && columns.some(c => c.id === oid)) oc = oid;
    if (!ac) { setOverrides(null); return; }

    if (ac === (oc ?? ac)) {
      const list = [...overrides[ac]];
      const ni = list.findIndex(t => t.id === aid), oi = list.findIndex(t => t.id === oid);
      if (ni !== -1 && oi !== -1 && ni !== oi) {
        const reordered = arrayMove(list, ni, oi);
        setOverrides(p => p ? { ...p, [ac!]: reordered } : p);
        await reorderTasks(reordered.map((t, i) => ({ id: t.id, order: i, column_id: ac! })));
        qc.setQueryData(["tasks", ac], reordered.map((t, i) => ({ ...t, order: i })));
      }
    } else if (oc) {
      const src = overrides[ac] ?? [], dst = overrides[oc] ?? [];
      await reorderTasks([
        ...src.map((t, i) => ({ id: t.id, order: i, column_id: ac! })),
        ...dst.map((t, i) => ({ id: t.id, order: i, column_id: oc! })),
      ]);
      qc.setQueryData(["tasks", ac], src.map((t, i) => ({ ...t, order: i, column_id: ac! })));
      qc.setQueryData(["tasks", oc], dst.map((t, i) => ({ ...t, order: i, column_id: oc! })));
    }
    setOverrides(null);
  };

  const activeMembers = members?.filter(m => m.status === "active") ?? [];
  const isOwner = currentBoard?.user_id === user?.id;

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 h-14 flex items-center gap-3 px-4 flex-shrink-0 z-20">
        <button onClick={() => navigate("/")}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0">
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          {currentBoard && (
            <div className="w-5 h-5 rounded-md flex-shrink-0" style={{ background: currentBoard.color }} />
          )}
          <h1 className="text-sm font-semibold text-gray-900 truncate">{currentBoard?.title ?? "Board"}</h1>
          {columns && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md flex-shrink-0">
              {columns.length} kolom
            </span>
          )}
        </div>

        {/* Member avatars stack */}
        {activeMembers.length > 0 && (
          <div className="flex items-center -space-x-2 flex-shrink-0">
            {activeMembers.slice(0, 4).map(m => (
              <div key={m.id}
                title={m.email}
                className="w-7 h-7 rounded-full bg-indigo-100 text-primary text-[11px] font-bold flex items-center justify-center border-2 border-white ring-0">
                {avatarInitial(m.email)}
              </div>
            ))}
            {activeMembers.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center border-2 border-white">
                +{activeMembers.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Realtime indicator */}
        <div className="flex items-center gap-1 flex-shrink-0" title={connected ? "Terhubung realtime" : "Offline"}>
          {connected
            ? <Wifi size={13} className="text-green-500" />
            : <WifiOff size={13} className="text-red-400" />}
        </div>

        {/* Invite button (only owner) */}
        {isOwner && (
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
            <UserPlus size={13} />
            <span className="hidden sm:inline">Undang</span>
          </button>
        )}
        {!isOwner && (
          <button onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 text-xs text-gray-500 px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0">
            <Users size={13} />
          </button>
        )}
      </nav>

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners}
        onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-3 p-4 h-full items-start" style={{ minWidth: "max-content" }}>

            {isLoading && [...Array(3)].map((_, i) => (
              <div key={i} className="w-[272px] bg-gray-100 rounded-xl border border-gray-200 p-3 flex-shrink-0 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-16 bg-white rounded-xl mb-2" />
                <div className="h-16 bg-white rounded-xl" />
              </div>
            ))}

            {columns?.map((col, i) => (
              <ColumnWithTasks key={col.id} column={col}
                accent={COL_COLORS[i % COL_COLORS.length]}
                getTasksForColumn={getTasksForColumn}
                onDeleteColumn={handleDeleteColumn}
                onNavigate={tid => navigate(`/task/${tid}`)}
                onDeleteTask={handleDeleteTask}
                onCreateTask={handleCreateTask}
              />
            ))}

            <div className="flex-shrink-0 w-[272px]">
              {showInput ? (
                <div className="bg-white border border-indigo-300 rounded-xl p-3 shadow-sm">
                  <input type="text" placeholder="Nama kolom..." value={colTitle}
                    onChange={e => setColTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleCreateColumn(); if (e.key === "Escape") setShowInput(false); }}
                    autoFocus
                    className="w-full text-sm text-gray-800 bg-transparent border-none outline-none placeholder-gray-400 mb-2.5" />
                  <div className="flex gap-1.5">
                    <button onClick={handleCreateColumn} disabled={!colTitle.trim() || createColumn.isPending}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                      {createColumn.isPending ? "..." : "Tambah"}
                    </button>
                    <button onClick={() => { setShowInput(false); setColTitle(""); }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowInput(true)}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm text-gray-400 hover:text-gray-600 bg-white/60 hover:bg-white border border-dashed border-gray-300 hover:border-gray-400 rounded-xl transition-all">
                  <Plus size={14} strokeWidth={2.5} />
                  Tambah kolom
                </button>
              )}
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? <TaskOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      {showInvite && <InviteModal boardId={id!} onClose={() => setShowInvite(false)} />}
    </div>
  );
}
