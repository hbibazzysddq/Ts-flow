import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../services/Supabase";
import type { Task } from "../services/TaskService";
import { useState } from "react";
import { ArrowLeft, Calendar, Flag, Trash2 } from "lucide-react";

const PRIORITY_OPTIONS = ["low", "medium", "high"] as const;

const PRIORITY_STYLES = {
  low: "bg-low-bg text-low-text",
  medium: "bg-medium-bg text-medium-text",
  high: "bg-high-bg text-high-text",
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [deadline, setDeadline] = useState("");
  const [initialize, setInitialize] = useState(false);

  // Set initial values setelah data loaded
  if (task && !initialize) {
    setTitle(task.title),
    setDescription(task.description ?? ""),
    setPriority(task.priority),
    setDeadline(task.deadline ?? "");
    setInitialize(true);
  }

  //update Task

  const updateTask = useMutation({
    mutationFn: async (updates: Partial<Task>) => {
      const {error} = await supabase.from('tasks').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey:['tasks', id]})
      queryClient.invalidateQueries({ queryKey: ['tasks']})
    }
  }) 

  const deleteTaks = useMutation({
    mutationFn: async () => {
      const {error} = await supabase.from('tasks').delete().eq('id',id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey:['tasks']})
      navigate(-1)
    }
  })


  const handleSave = () => {
    updateTask.mutate({title, description,priority,deadline : deadline || null})
  }

  const handleDelete = () => {
    if(confirm('Hapus taks ini?')) deleteTaks.mutate()
  }

  if(isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col">
        <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0">
          <button onClick={() => navigate(-1)} className=" p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
            <ArrowLeft size={18}/>
          </button>
        </nav>
        <div className="max-w-2xl mx-auto w-full px-4 py-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-3/4" />
          <div className="h-32 bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if(!task) return null


  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={()=> navigate(-1)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition ">
            <ArrowLeft size={18}/>
            <span className="text-base font-medium text-gray-900">Detail Task</span>
          </button>
      </div>
      <button onClick={handleDelete} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
        <Trash2 size={16}/>
      </button>
      </nav>

       {/* Content */}
      <div className="max-w-2xl mx-auto w-full px-4 md:px-6 py-6 flex flex-col gap-5">

        {/* Title */}
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Judul task</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleSave}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-primary bg-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Deskripsi</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={handleSave}
            rows={5}
            placeholder="Tambahkan deskripsi..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-primary bg-white resize-none"
          />
        </div>

        {/* Priority & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Priority */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Flag size={12} /> Prioritas
            </label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map(p => (
                <button
                  key={p}
                  onClick={() => {
                    setPriority(p)
                    updateTask.mutate({ priority: p })
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition capitalize
                    ${priority === p
                      ? PRIORITY_STYLES[p] + ' border-transparent'
                      : 'bg-white border-gray-200 text-gray-500'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
              <Calendar size={12} /> Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={e => {
                setDeadline(e.target.value)
                updateTask.mutate({ deadline: e.target.value || null })
              }}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-primary bg-white"
            />
          </div>
        </div>

        {/* Meta info */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
          <p className="text-xs text-gray-400">
            Dibuat: {new Date(task.created_at).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
          {updateTask.isSuccess && (
            <p className="text-xs text-green-500">Tersimpan ✓</p>
          )}
        </div>

        {/* Save button mobile */}
        <button
          onClick={handleSave}
          disabled={updateTask.isPending}
          className="w-full bg-primary text-white rounded-xl py-3 text-sm font-medium disabled:opacity-60 md:hidden"
        >
          {updateTask.isPending ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  )
}
