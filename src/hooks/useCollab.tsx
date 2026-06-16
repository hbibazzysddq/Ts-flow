import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptInvite, declineInvite, getBoardMembers, getOwnBoardsWithMembers, getPendingInvites, getPendingInvitesForUser, inviteMember, removeMember, type BoardMember, type BoardWithMembers } from "../services/CollabService";
import { useAuth } from "../context/AuthContext";

export const useBoardMembers = (boardId: string) => {
  return useQuery({
    queryKey: ["board_members", boardId],
    queryFn: async () => {
      const { data, error } = await getBoardMembers(boardId);
      if (error) throw error;
      return data as BoardMember[];
    },
    enabled: !!boardId,
  });
};

export const useInviteMember = (boardId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => inviteMember(boardId, email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board_members", boardId] });
    },
  });
};

export const useRemoveMember = (boardId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeMember(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["board_members", boardId] });
    },
  });
};

export const useOwnBoardsWithMembers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["own_boards_with_members", user?.id],
    queryFn: async () => {
      const { data, error } = await getOwnBoardsWithMembers(user!.id);
      if (error) throw error;
      return (data ?? []) as BoardWithMembers[];
    },
    enabled: !!user,
  });
};

export const usePendingInvites = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pending_invites", user?.id],
    queryFn: async () => {
      const { data, error } = await getPendingInvites(user!.id);
      if (error) throw error;
      return (data ?? []) as BoardMember[];
    },
    enabled: !!user,
  });
};

export const usePendingInvitesForUser = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pending_invites_for_user", user?.id],
    queryFn: async () => {
      const { data, error } = await getPendingInvitesForUser();
      if (error) throw error;
      return ((data ?? []) as any[]).map((inv: any) => ({
        ...inv,
        boards: { title: inv.board_title, color: inv.board_color },
      }));
    },
    enabled: !!user,
  });
};

export const useAcceptInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptInvite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending_invites_for_user"] });
      qc.invalidateQueries({ queryKey: ["shared_boards"] });
    },
  });
};

export const useDeclineInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => declineInvite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pending_invites_for_user"] });
    },
  });
};
