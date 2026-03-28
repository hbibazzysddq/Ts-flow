import { ArrowLeft, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useCreateTask, useDeleteTask, useTask } from "../hooks/useTask";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useColumns, useCreateColumns, useDeleteColumns } from "../hooks/useColumns";

const PRIORITY_STYLES = {
  low: "bg-low-bg text-low-text",
  medium: "bg-medium-bg text-medium-text",
  high: "bg-high-bg text-high-text",
};

function TaskCard({
  task,
  onDelete,
  onClick,
}: {
  task: any;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onClick(task.id)}
      className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:shadow-sm active:scale-95 transition-all group relative"
    >
      <p className="text-sm text-gray-900 mb-2 pr-5 leading-snug">
        {task.title}
      </p>
      <div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority as keyof typeof PRIORITY_STYLES]}`}
        >
          {task.priority}
        </span>
        {task.deadline && (
          <span className="text-xs text-gray-400">
            {new Date(task.deadline).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
      </div>
      <button className=" absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
        <Trash size={12} />
      </button>
    </div>
  );
}

function KanbanColumn({
  column,
  boardId,
  onDeleteColumn,
  onNavigateTask,
}: {
  column: any;
  boardId: string;
  onDeleteColumn: (id: string) => void;
  onNavigateTask: (id: string) => void;
}) {
  const {data: tasks } = useTask(column.id)
  const createTask = useCreateTask(column.id)
  const deleteTask = useDeleteTask(column.id)
  const [showInput, setShowInput] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return
    await createTask.mutateAsync({ title: taskTitle, order: tasks?.length ?? 0 })
    setTaskTitle('')
    setShowInput(false)
  }

  const handleDeleteTask = async (id: string) => {
    if(confirm('Hapus task ini?')){
      await deleteTask.mutateAsync(id)
    }
  }

  return (
    <div className="flex-shrink-0 w-72 md:w-64 lg:w-72 bg-secondary rounded-2xl p-3 flex flex-col max-h-[calc(100vh-px)]">
      {/* header column */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>{column.title}</span>
          <span>{tasks?.length ?? 0}</span>
        </div>
        <button onClick={()=> onDeleteColumn(column.id)} className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
          <MoreHorizontal size={14}/>
        </button>
      </div>

      {/* Tasks */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pb-1">
        {tasks?.map(task => (
          <TaskCard key={task.id} task={task} onDelete={handleDeleteTask} onClick={onNavigateTask}/>
        ))}
      </div>

      {/* Add task */}
      {showInput ? (
        <div className="mt-2">
          <input type="text" placeholder="Nama task..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)}
          onKeyDown={e => {if (e.key === 'Enter') handleCreateTask(); if (e.key === 'Escape') setShowInput(false)}} className="w-fit border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary mb-2"/>
          <div>
            <button onClick={handleCreateTask} disabled={!taskTitle.trim() || createTask.isPending} className="flex-1 bg-primary text-white rounded-lg py-1.5 text-xs font-medium disabled:opacity-60">
              Tambah
            </button>
            <button onClick={() => setShowInput(true)} className="flex-1 border border-gray-200 rounded-lg py-1.5 text-xs text-gray-600">
              Batal 
            </button>
          </div>
        </div>
      ): (
        <button onClick={() => setShowInput(true)} className="mt-2 w-full flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-xs py-1.5 px-2 rounded-lg hover:bg-white transition">
          <Plus size={13}/>
          Tambah Task
        </button>
      )}
    </div>
  )
}





export default function Board() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: columns, isLoading } = useColumns(id!)
  const createColumn = useCreateColumns(id!)
  const deleteColumn = useDeleteColumns(id!)

  const [showInput, setShowInput] = useState(false)
  const [columnTitle, setColumnTitle] = useState('')

  const handleCreateColumn = async () => {
    if (!columnTitle.trim()) return
    await createColumn.mutateAsync({ title: columnTitle, order: columns?.length ?? 0 })
    setColumnTitle('')
    setShowInput(false)
  }

  const handleDeleteColumn = async (columnId: string) => {
    if (confirm('Hapus kolom ini beserta semua task di dalamnya?')) {
      await deleteColumn.mutateAsync(columnId)
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-medium text-gray-900">Board</h1>
      </nav>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3 p-4 md:p-6 min-w-max">

          {/* Loading skeleton */}
          {isLoading && (
            [...Array(3)].map((_, i) => (
              <div key={i} className="w-72 bg-secondary rounded-2xl p-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3 w-1/2" />
                <div className="h-20 bg-white rounded-xl mb-2" />
                <div className="h-20 bg-white rounded-xl" />
              </div>
            ))
          )}

          {/* Columns */}
          {columns?.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              boardId={id!}
              onDeleteColumn={handleDeleteColumn}
              onNavigateTask={(taskId) => navigate(`/task/${taskId}`)}
            />
          ))}

          {/* Add column */}
          <div className="flex-shrink-0 w-72 md:w-64 lg:w-72">
            {showInput ? (
              <div className="bg-secondary rounded-2xl p-3">
                <input
                  type="text"
                  placeholder="Nama kolom..."
                  value={columnTitle}
                  onChange={e => setColumnTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateColumn(); if (e.key === 'Escape') setShowInput(false) }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary mb-2 bg-white"
                  autoFocus
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={handleCreateColumn}
                    disabled={!columnTitle.trim() || createColumn.isPending}
                    className="flex-1 bg-primary text-white rounded-lg py-1.5 text-xs font-medium disabled:opacity-60"
                  >
                    Tambah
                  </button>
                  <button
                    onClick={() => { setShowInput(false); setColumnTitle('') }}
                    className="flex-1 border border-gray-200 bg-white rounded-lg py-1.5 text-xs text-gray-600"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowInput(true)}
                className="w-full flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm py-3 px-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-white transition"
              >
                <Plus size={16} />
                Tambah kolom
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
