import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBoardMembers, inviteMember, removeMember, type BoardMember } from "../services/CollabService";

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
