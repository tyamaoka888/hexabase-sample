import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "@/shared/config/types";
import { container } from "@/shared/config/di";
import { DeleteTaskUsecase } from "@/server/application/usecase/task/deleteTaskUsecase";

const deleteTaskUsecase = container.get<DeleteTaskUsecase>(
  TYPES.DeleteTaskUsecase,
);

export const DELETE = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  },
): Promise<NextResponse> => {
  try {
    const { id } = params;
    console.log("id", id);

    // ここでidを使用してタスクを削除する処理を実装
    await deleteTaskUsecase.execute(id);

    return NextResponse.json(
      { message: `Task ${id} deleted successfully` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in DELETE /api/tasks/[id]:", error);
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 },
    );
  }
};
