import { TaskDetail } from "@/server/domain/model/entity/taskDetail";

export type TaskStatus = "pending" | "in_progress" | "completed";

export class Task {
  private constructor(
    public taskId: number | null,
    public userId: number,
    public taskTitle: string,
    public status: TaskStatus,
    public details: TaskDetail[] = [],
  ) {}

  static create(
    userId: number,
    taskTitle: string,
    status: TaskStatus = "pending",
    details: TaskDetail[] = [],
  ): Task {
    if (taskTitle.trim().length === 0) {
      throw new Error("Task title cannot be empty");
    }
    return new Task(null, userId, taskTitle.trim(), status, details);
  }

  static reconstruct(
    taskId: number,
    userId: number,
    taskTitle: string,
    status: TaskStatus,
    details: TaskDetail[] = [],
  ): Task {
    return new Task(taskId, userId, taskTitle, status, details);
  }

  updateTitle(newTitle: string): void {
    if (newTitle.trim().length === 0) {
      throw new Error("Task title cannot be empty");
    }
    this.taskTitle = newTitle.trim();
  }

  updateStatus(newStatus: TaskStatus): void {
    if (this.status === "completed" && newStatus !== "completed") {
      throw new Error("Cannot change status of a completed task");
    }
    this.status = newStatus;
  }

  addDetail(detail: TaskDetail): void {
    this.details.push(detail);
  }

  removeDetail(detailId: number): void {
    const index = this.details.findIndex((d) => d.taskDetailId === detailId);
    if (index !== -1) {
      this.details.splice(index, 1);
    }
  }

  isOverdue(currentDate: Date): boolean {
    // 仮の実装。実際のビジネスロジックに応じて調整してください。
    const dueDate = new Date(currentDate);
    dueDate.setDate(dueDate.getDate() + 7); // 例：タスクは7日後が期限とする
    return currentDate > dueDate && this.status !== "completed";
  }
}
