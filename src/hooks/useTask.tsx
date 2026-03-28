import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTask, deleteTask, getTasks, updateTask, type Task } from "../services/TaskService"

export const useTask = (columnId: string) => {
    return useQuery({
        queryKey: ['tasks', columnId],
        queryFn: async () => {
            const {data , error} = await getTasks(columnId)
            if (error) throw error
            return data
        },
    })
}

export const useCreateTask = (columnId: string) =>{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({title,order}: {title: string, order: number}) => createTask(columnId, title, order),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['tasks', columnId]})
        }
    })
}

export const useUpdateTask = (columnId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({id, updates}: {id: string, updates: Partial<Task>}) => updateTask(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['tasks', columnId]})
        }
    })
}

export const useDeleteTask = (columnId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['tasks', columnId]})
        }
    })
}