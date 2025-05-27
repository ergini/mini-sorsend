import db from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
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
    const { name, description, icon } = body;

    const project = await db.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon && { icon }),
      },
      include: { tasks: true },
    });

    if (global.io) {
      console.log("Emitting project-updated event for project:", id);
      global.io.emit("project-updated", project);
    } else {
      console.log("Socket.IO not available");
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const project = await db.project.delete({
      where: { id },
      include: { tasks: true },
    });

    if (global.io) {
      console.log("Emitting project-deleted event for project:", id);
      global.io.emit("project-deleted", { id });
    } else {
      console.log("Socket.IO not available");
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
