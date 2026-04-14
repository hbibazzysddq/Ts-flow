import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createColumns, getColumns, deleteColumns } from "../services/ColumnServices"

export const useColumns = (boardId: string) => {
    return useQuery({
        queryKey: ['columns', boardId],
        queryFn: async () => {
            const {data , error} = await getColumns(boardId)
            if (error) throw error
            return data
        },
        enabled: !!boardId
    })
}

export const useCreateColumns = (boardId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({title,order}: {title: string, order: number}) => createColumns(boardId ,title, order),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['columns', boardId]})
        }
    })
}

export const useDeleteColumns = (boardId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteColumns(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['columns', boardId] })
        }
    })
}