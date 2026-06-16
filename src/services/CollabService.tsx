import supabase from "./Supabase";
import type { Board } from "./BoardService";

export interface BoardMember {
  id: string;
  board_id: string;
  user_id: string | null;
  email: string;
  role: "owner" | "member";
  status: "pending" | "active";
  invited_at: string;
}

export interface BoardWithMembers extends Board {
  board_members: BoardMember[];
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

// Accept a single invite via RPC (bypass RLS)
export const acceptInvite = async (id: string) => {
  const { error } = await supabase.rpc("accept_board_invite", { invite_id: id });
  return { error };
};

// Decline a single invite via RPC (bypass RLS)
export const declineInvite = async (id: string) => {
  const { error } = await supabase.rpc("decline_board_invite", { invite_id: id });
  return { error };
};

// Get pending invites via RPC (bypass RLS)
export const getPendingInvitesForUser = async () => {
  const { data, error } = await supabase.rpc("get_pending_invites");
  return { data, error };
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

// Get user's own boards with their members (for collab page)
export const getOwnBoardsWithMembers = async (userId: string) => {
  const { data, error } = await supabase
    .from("boards")
    .select("*, board_members(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
};

// Get pending invites from user's boards
export const getPendingInvites = async (userId: string) => {
  const { data, error } = await supabase
    .from("board_members")
    .select("*, boards!inner(title, color)")
    .eq("status", "pending")
    .eq("boards.user_id", userId)
    .order("invited_at", { ascending: false });
  return { data, error };
};
