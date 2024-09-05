import { inject, injectable } from "inversify";
import { HexTaskRepository } from "../../../infrastructure/repositories/hexTaskRepository";
import { TYPES } from "@/shared/config/types";
import { CreateTaskRequest } from "@/shared/types/request/Task";
import { Task } from "@/server/domain/model/aggregate/task";
import { TaskDetail } from "@/server/domain/model/entity/taskDetail";

@injectable()
export class CreateTaskUsecase {
  private readonly repository: HexTaskRepository;

  constructor(@inject(TYPES.HexTaskRepository) repository: HexTaskRepository) {
    this.repository = repository;
  }

  async execute(input: CreateTaskRequest): Promise<void> {
    const newTaskDetail1 = TaskDetail.create("test_description1", "test_note1");
    const newTaskDetail2 = TaskDetail.create("test_description2", "test_note2");
    const newTaskDetail3 = TaskDetail.create("test_description3", "test_note3");

    const newTask = Task.create(1, input.taskTitle, input.status, [
      newTaskDetail1,
      newTaskDetail2,
      newTaskDetail3,
    ]);

    await this.repository.create(newTask);
  }
}
