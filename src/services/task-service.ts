import { inject, injectable } from "inversify";
import { TYPES } from "@/shared/config/types";
import { Task } from "@/types/task";
import { Axios, AxiosError } from "axios";
import { CreateTaskRequest } from "@/shared/types/request/Task";
import { AxiosInstance } from "@/lib/axios";

export interface TaskService {
  getAllTasks(): Promise<Task[]>;
  createTask(task: CreateTaskRequest): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}

@injectable()
export class ApiTaskService implements TaskService {
  private axiosInstance: Axios;

  constructor(@inject(TYPES.AxiosInstance) axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance.instance;
  }

  async getAllTasks(): Promise<Task[]> {
    const response = await this.axiosInstance.get<Task[]>("/tasks");
    return response.data;
  }

  async createTask(request: CreateTaskRequest): Promise<Task> {
    const response = await this.axiosInstance.post<Task>("/tasks", request);
    return response.data;
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    const response = await this.axiosInstance.put<Task>(`/tasks/${id}`, task);
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await this.axiosInstance.delete(`/tasks/${id}`);
  }
}
