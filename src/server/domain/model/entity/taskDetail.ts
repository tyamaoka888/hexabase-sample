export class TaskDetail {
  private constructor(
    public taskDetailId: number | null,
    public taskId: number | null,
    public description: string | null,
    public notes: string | null,
  ) {}

  static reconstruct(
    taskDetailId: number,
    taskId: number,
    description: string | null,
    notes: string | null,
  ): TaskDetail {
    return new TaskDetail(taskDetailId, taskId, description, notes);
  }

  static create(description: string | null, notes: string | null): TaskDetail {
    return new TaskDetail(null, null, description, notes);
  }
}
