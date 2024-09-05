export type CreateTaskRequest = {
  userId: number;
  taskTitle: string;
  status: "pending" | "in_progress" | "completed";
};
