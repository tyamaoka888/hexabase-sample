import { container } from "@/shared/config/di";
import { TYPES } from "@/shared/config/types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { CreateTaskRequest } from "@/shared/types/request/Task";
import { Task } from "@/types/task";
import { TaskService } from "@/services/task-service";

const taskService = container.get<TaskService>(TYPES.TaskService);

export const useTasks = () => {
  const queryClient = useQueryClient();

  const useAllTasksQuery = (): UseQueryResult<Task[], Error> => {
    return useQuery({
      queryKey: ["tasks"],
      queryFn: () => taskService.getAllTasks(),
    });
  };

  const useCreateTaskMutation = (): UseMutationResult<
    Task,
    Error,
    CreateTaskRequest
  > => {
    return useMutation({
      mutationFn: (task: CreateTaskRequest) => taskService.createTask(task),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
    });
  };

  const useUpdateTaskMutation = (): UseMutationResult<
    Task,
    Error,
    { id: string; task: Partial<Task> }
  > => {
    return useMutation({
      mutationFn: ({ id, task }) => taskService.updateTask(id, task),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
    });
  };

  const useDeleteTaskMutation = (): UseMutationResult<void, Error, string> => {
    return useMutation({
      mutationFn: (id: string) => taskService.deleteTask(id),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
    });
  };

  return {
    useAllTasksQuery,
    useCreateTaskMutation,
    useUpdateTaskMutation,
    useDeleteTaskMutation,
  };
};
