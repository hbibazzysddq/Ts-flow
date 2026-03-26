import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createBoards, deleteBoards, getBoards } from "../services/BoardService"

export const useBoards = () => {
    return useQuery({
        queryKey: ['boards'],
        queryFn: async () => {
            const {data , error} = await getBoards()
            if (error) throw error
            return data
        }
    })
}

export const useCreateBoards = () =>{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ title, color} : {title: string, color: string}) => createBoards(title, color),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards']})
        }
    })
}

export const useDeleteBoards = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteBoards(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards']})
        }
    })
}