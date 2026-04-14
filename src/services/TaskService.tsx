import supabase from "./Supabase";

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  deadline: string | null;
  order: number;
  assigned_to: string | null;
  assigned_email: string | null;
  created_at: string;
}

export const getTasks = async (columnId: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("column_id", columnId)
    .order("order", { ascending: true });
  return { data, error };
};

export const createTask = async (column_id: string, title: string, order: number) => {
  const { data, error } = await supabase
    .from("tasks")
    .insert({ column_id, title, order, priority: "low" })
    .select()
    .single();
  return { data, error };
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
};

export const deleteTask = async (id: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  return { error };
};

export const reorderTasks = async (
  tasks: { id: string; order: number; column_id: string }[]
) => {
  const promises = tasks.map((t) =>
    supabase.from("tasks").update({ order: t.order, column_id: t.column_id }).eq("id", t.id)
  );
  const results = await Promise.all(promises);
  const error = results.find((r) => r.error)?.error;
  return { error };
};
