import { inject, injectable } from "inversify";
import { TYPES } from "@/shared/config/types";
import { HexTaskRepository } from "@/server/infrastructure/repositories/hexTaskRepository";
import { Task } from "@/server/domain/model/aggregate/task";

@injectable()
export class GetAllTasksUsecase {
  private readonly repository: HexTaskRepository;

  constructor(@inject(TYPES.HexTaskRepository) repository: HexTaskRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Task[]> {
    return await this.repository.findAll();
  }
}
