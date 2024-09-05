// Task型定義
export type Task = {
  taskId: string;
  userId: number;
  taskTitle: string;
  status: "pending" | "in_progress" | "completed";
  details: TaskDetail[];
};

// TaskDetail型定義
export type TaskDetail = {
  taskDetailId: number;
  taskId: number;
  description: string | null;
  notes: string | null;
};

// タスクとその詳細情報（複数）を合わせた型定義
// export type TaskWithDetails = Task & {
//   details: TaskDetail[];
// };
