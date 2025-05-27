"use server";

import { TaskProgress } from "@/app/generated/prisma";
import db from "@/utils/db";
import { revalidatePath } from "next/cache";

export interface CreateTaskData {
  title: string;
  description?: string;
  status: TaskProgress;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  tasks?: CreateTaskData[];
}

export async function createProject(data: CreateProjectData) {
  try {
    const project = await db.project.create({
      data: {
        name: data.name,
        description: data.description,
        tasks:
          data.tasks && data.tasks?.length > 0
            ? {
                create: data.tasks.map((task) => ({
                  title: task.title,
                  description: task.description,
                  status: task.status,
                })),
              }
            : undefined,
      },
      include: {
        tasks: true,
      },
    });

    revalidatePath("/");
    return { data: project };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { error: "Failed to create project" };
  }
}

export async function updateTaskStatus(taskId: string, status: TaskProgress) {
  try {
    const task = await db.task.update({
      where: { id: taskId },
      data: { status },
      include: { project: true },
    });

    revalidatePath("/");
    return { data: task };
  } catch (error) {
    console.error("Failed to update task:", error);
    return { error: "Failed to update task status" };
  }
}
