import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";

export async function GET() {
  const projects = await db.project.findMany({
    include: { tasks: true },
  });

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
