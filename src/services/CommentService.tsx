import supabase from "./Supabase";

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  user_email: string;
  content: string;
  created_at: string;
}

export const getComments = async (taskId: string) => {
  const { data, error } = await supabase
    .from("task_comments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  return { data, error };
};

export const addComment = async (taskId: string, content: string, userEmail: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("task_comments")
    .insert({ task_id: taskId, content, user_id: user?.id, user_email: userEmail })
    .select()
    .single();
  return { data, error };
};

export const deleteComment = async (id: string) => {
  const { error } = await supabase.from("task_comments").delete().eq("id", id);
  return { error };
};
