import supabase from "./Supabase";

export interface BoardMember {
  id: string;
  board_id: string;
  user_id: string | null;
  email: string;
  role: "owner" | "member";
  status: "pending" | "active";
  invited_at: string;
}

export const getBoardMembers = async (boardId: string) => {
  const { data, error } = await supabase
    .from("board_members")
    .select("*")
    .eq("board_id", boardId)
    .order("invited_at", { ascending: true });
  return { data, error };
};

export const inviteMember = async (boardId: string, email: string) => {
  const { data, error } = await supabase
    .from("board_members")
    .insert({ board_id: boardId, email: email.toLowerCase(), role: "member", status: "pending" })
    .select()
    .single();
  return { data, error };
};

export const removeMember = async (id: string) => {
  const { error } = await supabase.from("board_members").delete().eq("id", id);
  return { error };
};

// Called on login: activate all pending invites for this user's email
export const acceptPendingInvites = async (userId: string, email: string) => {
  const { error } = await supabase
    .from("board_members")
    .update({ user_id: userId, status: "active" })
    .eq("email", email.toLowerCase())
    .eq("status", "pending");
  return { error };
};

// Get boards where user is an active member (not the owner)
export const getSharedBoards = async (userId: string) => {
  const { data, error } = await supabase
    .from("board_members")
    .select("board_id, boards(*)")
    .eq("user_id", userId)
    .eq("status", "active");
  return { data, error };
};
