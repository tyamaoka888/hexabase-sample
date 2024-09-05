import { TaskService } from "@/services/task-service";
import { DeleteTaskUsecase } from "@/server/application/usecase/task/deleteTaskUsecase";

export const TYPES = {
  // Server configuration
  HexabaseClientManager: Symbol.for("HexabaseClientManager"),

  // Repository
  HexTaskRepository: Symbol.for("HexTaskRepository"),

  // Usecase
  GetAllTasksUsecase: Symbol.for("GetAllTasksUsecase"),
  CreateTaskUsecase: Symbol.for("CreateTaskUsecase"),
  DeleteTaskUsecase: Symbol.for("DeleteTaskUsecase"),

  // Client configuration
  AxiosInstance: Symbol.for("AxiosInstance"),
  TaskService: Symbol.for("TaskService"),
};
