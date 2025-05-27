import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";
import { Server as ServerIO } from "socket.io";

declare global {
  var io: ServerIO | undefined;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { title, description, status, priority, dueDate } = body;

    const task = await db.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: { project: { include: { tasks: true } } },
    });

    if (global.io) {
      console.log("Emitting task-updated event for task:", id);
      global.io.emit("task-updated", task);
    } else {
      console.log("Socket.IO not available");
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
