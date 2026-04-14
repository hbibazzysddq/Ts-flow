import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getComments, addComment, deleteComment } from "../services/CommentService";

export const useComments = (taskId: string) => {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: async () => {
      const { data, error } = await getComments(taskId);
      if (error) throw error;
      return data;
    },
    enabled: !!taskId,
  });
};

export const useAddComment = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ content, userEmail }: { content: string; userEmail: string }) =>
      addComment(taskId, content, userEmail),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });
};

export const useDeleteComment = (taskId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });
};
