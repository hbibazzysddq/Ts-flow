import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../services/Supabase";
import type { Task } from "../services/TaskService";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Trash2,
  Check,
  Send,
  MessageCircle,
  UserCheck,
} from "lucide-react";
import {
  useComments,
  useAddComment,
  useDeleteComment,
} from "../hooks/useComments";
import { useBoardMembers } from "../hooks/useCollab";
import { useAuth } from "../context/AuthContext";
import { type Comment } from "../services/CommentService";

const PRIORITY_OPTIONS = ["low", "medium", "high"] as const;
const PRIORITY_CONFIG = {
  low: { label: "Low", cls: "bg-green-50 text-green-700 border-green-200" },
  medium: {
    label: "Medium",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  high: { label: "High", cls: "bg-red-50 text-red-600 border-red-200" },
};

function avatarInitial(email: string) {
  return (email?.charAt(0) ?? "?").toUpperCase();
}

function timeAgo(dateStr: string, now: number) {
  const diff = now - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}h lalu`;
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [now] = useState(() => Date.now());

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Task;
    },
    enabled: !!id,
  });

  // Get board context for members
  const [boardId, setBoardId] = useState<string | null>(null);
  useEffect(() => {
    if (!task?.column_id) return;
    supabase
      .from("columns")
      .select("board_id")
      .eq("id", task.column_id)
      .single()
      .then(({ data }) => {
        if (data) setBoardId(data.board_id);
      });
  }, [task?.column_id]);

  const { data: members } = useBoardMembers(boardId ?? "");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [deadline, setDeadline] = useState("");
  const [assignedEmail, setAssignedEmail] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [commentText, setCommentText] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  if (task && !initialized) {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setDeadline(task.deadline ?? "");
    setAssignedEmail(task.assigned_email ?? null);
    setInitialized(true);
  }

  const { data: comments } = useComments(id!);
  const addComment = useAddComment(id!);
  const deleteComment = useDeleteComment(id!);

  const updateTask = useMutation({
    mutationFn: async (updates: Partial<Task>) => {
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", id] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      navigate(-1);
    },
  });

  // Realtime comments
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`comments-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_comments" },
        (p) => {
          const row = (p.new || p.old) as Partial<Comment>;
          if (row?.task_id === id)
            qc.invalidateQueries({ queryKey: ["comments", id] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments?.length]);

  const handleSave = () =>
    updateTask.mutate({
      title,
      description,
      priority,
      deadline: deadline || null,
      assigned_email: assignedEmail,
    });

  const handleSendComment = async () => {
    if (!commentText.trim() || !user?.email) return;
    await addComment.mutateAsync({
      content: commentText.trim(),
      userEmail: user.email,
    });
    setCommentText("");
  };

  const handleAssign = (email: string | null) => {
    setAssignedEmail(email);
    updateTask.mutate({ assigned_email: email });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 h-14 flex items-center gap-3 px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={16} />
          </button>
        </nav>
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-4 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-11 bg-gray-200 rounded-xl" />
          <div className="h-28 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!task) return null;

  const activeMembers = members?.filter((m) => m.status === "active") ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-gray-900">
            Detail Task
          </span>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg fade-in">
              <Check size={11} /> Tersimpan
            </span>
          )}
          {updateTask.isPending && (
            <span className="text-xs text-gray-400">Menyimpan...</span>
          )}
          <button
            onClick={() => {
              if (confirm("Hapus task ini?")) deleteTask.mutate();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-6 fade-in">
        {/* Two-column layout on desktop */}
        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-6">
          {/* Left – main form */}
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Judul
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleSave}
                className="w-full px-3.5 py-2.5 text-sm font-medium text-gray-900 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Deskripsi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSave}
                rows={4}
                placeholder="Tambahkan deskripsi, langkah, atau catatan..."
                className="w-full px-3.5 py-2.5 text-sm text-gray-800 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Comments */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <MessageCircle size={14} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-700">
                  Komentar {comments?.length ? `(${comments.length})` : ""}
                </span>
              </div>

              {/* Comment list */}
              <div className="max-h-72 overflow-y-auto px-4 py-3 flex flex-col gap-4">
                {comments?.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Belum ada komentar
                  </p>
                )}
                {comments?.map((c) => (
                  <div key={c.id} className="flex gap-2.5 group">
                    <div className="w-7 h-7 rounded-full bg-indigo-50 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {avatarInitial(c.user_email)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-800 truncate">
                          {c.user_email.split("@")[0]}
                        </span>
                        <span className="text-[11px] text-gray-400 flex-shrink-0">
                          {timeAgo(c.created_at, now)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                    {c.user_id === user?.id && (
                      <button
                        onClick={() => deleteComment.mutate(c.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all flex-shrink-0"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>

              {/* Comment input */}
              <div className="flex gap-2 px-4 py-3 border-t border-gray-100">
                <div className="w-7 h-7 rounded-full bg-indigo-50 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                  {avatarInitial(user?.email ?? "")}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleSendComment()
                    }
                    placeholder="Tulis komentar... (Enter untuk kirim)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-primary focus:bg-white transition-all placeholder-gray-400"
                  />
                  <button
                    onClick={handleSendComment}
                    disabled={!commentText.trim() || addComment.isPending}
                    className="p-2 bg-primary text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors flex-shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={updateTask.isPending}
              className="w-full py-2.5 bg-primary hover:bg-indigo-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors"
            >
              {updateTask.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>

          {/* Right – meta sidebar */}
          <div className="mt-5 lg:mt-0 space-y-4">
            {/* Priority */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Prioritas
              </label>
              <div className="flex flex-col gap-1.5">
                {PRIORITY_OPTIONS.map((p) => {
                  const cfg = PRIORITY_CONFIG[p];
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        setPriority(p);
                        updateTask.mutate({ priority: p });
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        active
                          ? cfg.cls
                          : "border-transparent text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {cfg.label}
                      {active && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deadline */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.target.value);
                  updateTask.mutate({ deadline: e.target.value || null });
                }}
                className="w-full px-3 py-2 text-xs text-gray-800 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-primary transition-colors cursor-pointer"
              />
              {deadline && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-gray-500">
                    {new Date(deadline).toLocaleDateString("id-ID", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <button
                    onClick={() => {
                      setDeadline("");
                      updateTask.mutate({ deadline: null });
                    }}
                    className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>

            {/* Assign */}
            {activeMembers.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <UserCheck size={13} className="text-gray-400" />
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Ditugaskan
                  </label>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handleAssign(null)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-all ${
                      !assignedEmail
                        ? "border-primary/30 bg-primary/5 text-primary font-medium"
                        : "border-transparent text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    Tidak ditugaskan
                    {!assignedEmail && <Check size={11} className="ml-auto" />}
                  </button>
                  {activeMembers.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleAssign(m.email)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-all ${
                        assignedEmail === m.email
                          ? "border-primary/30 bg-primary/5 text-primary font-medium"
                          : "border-transparent text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {avatarInitial(m.email)}
                      </div>
                      <span className="truncate">{m.email.split("@")[0]}</span>
                      {assignedEmail === m.email && (
                        <Check size={11} className="ml-auto flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Info
              </label>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Dibuat</span>
                  <span className="font-medium text-gray-700">
                    {new Date(task.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">ID</span>
                  <span className="text-gray-400 font-mono text-[11px]">
                    {task.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
