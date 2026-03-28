import supabase from "./Supabase";

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  deadline: string | null;
  order: number;
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

export const createTask = async (
  column_id: string,
  title: string,
  order: number,
) => {
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
