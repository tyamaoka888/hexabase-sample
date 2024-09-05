import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "@/shared/config/types";
import { container } from "@/shared/config/di";
import { CreateTaskRequest } from "@/shared/types/request/Task";
import { GetAllTasksUsecase } from "@/server/application/usecase/task/getAllTasksUsecase";
import { CreateTaskUsecase } from "@/server/application/usecase/task/createTaskUsecase";

const getAllTasksUsecase = container.get<GetAllTasksUsecase>(
  TYPES.GetAllTasksUsecase,
);

const createTaskUsecase = container.get<CreateTaskUsecase>(
  TYPES.CreateTaskUsecase,
);

export const GET = async (req: NextRequest) => {
  try {
    const tasks = await getAllTasksUsecase.execute();

    return NextResponse.json(tasks, {
      status: 200,
    });
  } catch (error) {
    console.error("Error in GET /api/tasks:", error);
    // 未知のエラー
    return NextResponse.json({ error: error }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  console.log("POST /api/tasks");

  try {
    const request = (await req.json()) as CreateTaskRequest;

    await createTaskUsecase.execute(request);
    return NextResponse.json(
      {},
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in POST /api/tasks:", error);
    // 未知のエラー
    return NextResponse.json({ error: error }, { status: 500 });
  }
};
