import { inject, injectable } from "inversify";
import { HexTaskRepository } from "../../../infrastructure/repositories/hexTaskRepository";
import { TYPES } from "@/shared/config/types";

@injectable()
export class DeleteTaskUsecase {
  private readonly repository: HexTaskRepository;

  constructor(@inject(TYPES.HexTaskRepository) repository: HexTaskRepository) {
    this.repository = repository;
  }

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
