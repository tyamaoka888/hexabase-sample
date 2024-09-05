import { Container } from "inversify";
import "reflect-metadata";
import { TYPES } from "@/shared/config/types";
import { HexabaseClientManager } from "@/server/infrastructure/config/hexabase";
import {
  HexTaskRepository,
  TaskRepository,
} from "@/server/infrastructure/repositories/hexTaskRepository";
import { GetAllTasksUsecase } from "@/server/application/usecase/task/getAllTasksUsecase";
import { CreateTaskUsecase } from "@/server/application/usecase/task/createTaskUsecase";
import { ApiTaskService, TaskService } from "@/services/task-service";
import { AxiosInstance, IAxiosInstance } from "@/lib/axios";
import { DeleteTaskUsecase } from "@/server/application/usecase/task/deleteTaskUsecase";

const container: Container = new Container();

// Server configuration
container
  .bind<HexabaseClientManager>(TYPES.HexabaseClientManager)
  .to(HexabaseClientManager)
  .inSingletonScope();
container
  .bind<TaskRepository>(TYPES.HexTaskRepository)
  .to(HexTaskRepository)
  .inSingletonScope();
container
  .bind<GetAllTasksUsecase>(TYPES.GetAllTasksUsecase)
  .to(GetAllTasksUsecase)
  .inSingletonScope();
container
  .bind<CreateTaskUsecase>(TYPES.CreateTaskUsecase)
  .to(CreateTaskUsecase)
  .inSingletonScope();
container
  .bind<DeleteTaskUsecase>(TYPES.DeleteTaskUsecase)
  .to(DeleteTaskUsecase)
  .inSingletonScope();

// Client configuration
container
  .bind<IAxiosInstance>(TYPES.AxiosInstance)
  .to(AxiosInstance)
  .inSingletonScope();
container
  .bind<TaskService>(TYPES.TaskService)
  .to(ApiTaskService)
  .inSingletonScope();

export { container };
