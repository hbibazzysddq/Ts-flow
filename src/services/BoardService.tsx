import supabase from "./Supabase";

export interface Board {
  id: string;
  user_id: string;
  title: string;
  color: string;
  created_at: string;
}

export const getBoards = async () => {
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
};

export const createBoards = async (title: string, color: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("boards")
    .insert({ title, color, user_id: user?.id })
    .select()
    .single();
  return { data, error };
};

export const deleteBoards = async (id: string) => {
  const { error } = await supabase
    .from("boards")
    .delete()
    .eq("id", id);
  return { error };
};
