"use client";

import React, { FC } from "react";
import { useTasks } from "@/hooks/useTasks";
import { FaTrash } from "react-icons/fa";

interface TaskListProps {}

const TaskList: FC<TaskListProps> = ({}) => {
  const { useAllTasksQuery, useDeleteTaskMutation } = useTasks();
  const { data: tasks, isLoading } = useAllTasksQuery();
  const { mutateAsync: deleteTask } = useDeleteTaskMutation();

  const handleDeleteTask = async (taskId: string) => {
    console.log(taskId);
    await deleteTask(taskId);
  };

  if (!tasks || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
      <thead className="bg-gray-200 text-gray-700">
        <tr>
          <th className="py-3 px-4 text-left">Task ID</th>
          <th className="py-3 px-4 text-left">User ID</th>
          <th colSpan={2} className="py-3 px-4 text-left">
            Task Title
          </th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr
            key={task.taskId}
            className="border-b border-gray-200 hover:bg-gray-100"
          >
            <td className="py-3 px-4">{task.taskId}</td>
            <td className="py-3 px-4">{task.userId}</td>
            <td className="py-3 px-4">{task.taskTitle}</td>
            <td className="py-3 px-4">
              {/*<FaTrash*/}
              {/*  className="text-red-500 cursor-pointer hover:text-red-400"*/}
              {/*  onClick={() => handleDeleteTask(task.taskId)}*/}
              {/*/>*/}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TaskList;
