import db from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, status, priority, dueDate, projectId } = body;

    const task = await db.task.create({
      data: {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
      },
      include: { project: { include: { tasks: true } } },
    });

    if (global.io) {
      console.log("Emitting task-updated event for new task:", task.id);
      global.io.emit("task-updated", task);
    } else {
      console.log("Socket.IO not available");
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
