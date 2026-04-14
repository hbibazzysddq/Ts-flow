import supabase from "./Supabase";

export interface Board {
  id: string;
  user_id: string;
  title: string;
  color: string;
  created_at: string;
  isShared?: boolean;
}

export const getBoards = async () => {
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false });
  return { data, error };
};

export const getSharedBoardsFull = async (userId: string) => {
  const { data, error } = await supabase
    .from("board_members")
    .select("boards(*)")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) return { data: null, error };
  const boards = (data as unknown as { boards: Board }[] ?? [])
    .map((row) => row.boards)
    .filter(Boolean)
    .map((b) => ({ ...b, isShared: true }));
  return { data: boards, error: null };
};

export const createBoards = async (title: string, color: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("boards")
    .insert({ title, color, user_id: user?.id })
    .select()
    .single();
  return { data, error };
};

export const deleteBoards = async (id: string) => {
  const { error } = await supabase.from("boards").delete().eq("id", id);
  return { error };
};
