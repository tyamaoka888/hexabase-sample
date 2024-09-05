import { RollbackOperation } from "./rollbackOperations";
import { injectable } from "inversify";

@injectable()
export abstract class RollbackEnabledRepository {
  protected rollbackOperations: RollbackOperation[] = [];

  protected addRollbackOperation(operation: RollbackOperation): void {
    this.rollbackOperations.push(operation);
  }

  protected async executeRollback(): Promise<void> {
    for (const operation of this.rollbackOperations.reverse()) {
      try {
        await operation.execute();
      } catch (rollbackError) {
        console.error("Error during rollback operation:", rollbackError);
      }
    }
    this.rollbackOperations = [];
  }

  protected async withRollback<T>(operation: () => Promise<T>): Promise<T> {
    try {
      const result = await operation();
      this.rollbackOperations = []; // Clear successful operations
      return result;
    } catch (error) {
      await this.executeRollback();
      throw error;
    }
  }
}
