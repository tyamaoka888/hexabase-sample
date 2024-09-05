import React from "react";
import TaskList from "@/app/(auth)/all-tasks/features/TaskList";
import { TaskForm } from "@/app/(auth)/all-tasks/features/TaskForm";

const Page = async () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex w-full">
        <TaskForm />
      </div>
      <div className="py-2">
        <TaskList />
      </div>
    </div>
  );
};

export default Page;
