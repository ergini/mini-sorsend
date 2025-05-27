"use client";
import { updateTaskStatus } from "@/app/actions";
import { Task, TaskProgress } from "@/app/generated/prisma";
import { notification, Select } from "antd";
import { useState } from "react";

interface TaskItemProps {
  task: Task;
}

export const TaskItem = ({ task }: TaskItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const handleStatusChange = async (newStatus: TaskProgress) => {
    try {
      setIsUpdating(true);
      await updateTaskStatus(task.id, newStatus);
      api.success({
        message: "Task Updated",
        description: `Task status has been updated to ${newStatus
          .toLowerCase()
          .replace("_", " ")}`,
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
      api.error({
        message: "Error",
        description: "Failed to update task status",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="border rounded-md p-3 mb-2 last:mb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-medium text-base m-0">{task.title}</h4>
            {task.description && (
              <p className="text-gray-600 text-sm mt-1 mb-0">
                {task.description}
              </p>
            )}
          </div>
          <Select
            value={task.status}
            onChange={handleStatusChange}
            style={{ width: 120 }}
            loading={isUpdating}
            disabled={isUpdating}
          >
            <Select.Option value={TaskProgress.TODO}>To Do</Select.Option>
            <Select.Option value={TaskProgress.IN_PROGRESS}>
              In Progress
            </Select.Option>
            <Select.Option value={TaskProgress.DONE}>Done</Select.Option>
          </Select>
        </div>
      </div>
    </>
  );
};
