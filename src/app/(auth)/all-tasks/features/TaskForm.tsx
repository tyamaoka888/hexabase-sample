"use client";

import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { FormTextInput } from "@/components/atoms/FormTextInput";
import Button from "@/components/atoms/Button";
import { TaskFormValues } from "@/types/form";
import { useTasks } from "@/hooks/useTasks";
import { CreateTaskRequest } from "@/shared/types/request/Task";

interface TaskFormProps {}

export const TaskForm: FC<TaskFormProps> = ({}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>();

  const { useCreateTaskMutation } = useTasks();
  const { mutate } = useCreateTaskMutation();

  /**
   * 追加ボタン押下時の処理
   */
  const onSubmit = (data: TaskFormValues) => {
    if (data.taskTitle === "") return;

    const request: CreateTaskRequest = {
      userId: 1,
      taskTitle: data.taskTitle,
      status: "pending",
    };

    mutate(request);

    reset(); // フォームのリセット
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-1/3 space-x-4">
      <FormTextInput register={{ ...register("taskTitle") }} />
      <Button type="submit">追加</Button>
    </form>
  );
};
