import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";
import { Server as ServerIO } from "socket.io";

declare global {
  var io: ServerIO | undefined;
}

export async function GET() {
  const projects = await db.project.findMany({
    include: { tasks: true },
  });

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== PROJECT CREATION START ===");
    const body = await request.json();
    console.log("Request body:", body);
    const { name, description, tasks } = body;

    const project = await db.project.create({
      data: {
        name,
        description: description || null,
        tasks:
          tasks && tasks.length > 0
            ? {
                create: tasks.map((task: any) => ({
                  title: task.title,
                  description: task.description || null,
                  status: task.status,
                  priority: task.priority,
                  dueDate: task.dueDate ? new Date(task.dueDate) : null,
                })),
              }
            : undefined,
      },
      include: {
        tasks: true,
      },
    });

    console.log("Project created successfully:", project.id);

    // Emit Socket.IO event for real-time updates
    if (global.io) {
      console.log("Socket.IO available, connected clients:", global.io.engine.clientsCount);
      console.log("Emitting project-updated event for project:", project.id);
      global.io.emit("project-updated", project);
      console.log("Event emitted successfully");
    } else {
      console.log("Socket.IO not available");
    }

    console.log("=== PROJECT CREATION END ===");
    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
