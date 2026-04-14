import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createBoards, deleteBoards, getBoards, getSharedBoardsFull } from "../services/BoardService"
import { useAuth } from "../context/AuthContext"

export const useBoards = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const { data, error } = await getBoards()
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })
}

export const useSharedBoards = () => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ["shared_boards", user?.id],
    queryFn: async () => {
      const { data, error } = await getSharedBoardsFull(user!.id)
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
  })
}

export const useCreateBoards = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ title, color }: { title: string; color: string }) =>
      createBoards(title, color),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] })
    },
  })
}

export const useDeleteBoards = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBoards(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] })
    },
  })
}