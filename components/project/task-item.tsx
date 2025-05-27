"use client";
import { updateTask } from "@/app/actions";
import { Task, TaskProgress, Priority } from "@/app/generated/prisma";
import {
  Button,
  DatePicker,
  Input,
  notification,
  Popover,
  Select,
  Tag,
  Tooltip,
} from "antd";
import { useState } from "react";
import { CalendarOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const PriorityColors: Record<Priority, string> = {
  LOW: "blue",
  MEDIUM: "green",
  HIGH: "orange",
  URGENT: "red",
};

interface TaskItemProps {
  task: Task;
}

export const TaskItem = ({ task }: TaskItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description || "",
  });
  const [api, contextHolder] = notification.useNotification();

  const handleStatusChange = async (newStatus: TaskProgress) => {
    try {
      setIsUpdating(true);
      const result = await updateTask(task.id, { status: newStatus });
      if (result.error) throw new Error(result.error);

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

  const handlePriorityChange = async (newPriority: Priority) => {
    try {
      setIsUpdating(true);
      const result = await updateTask(task.id, { priority: newPriority });
      if (result.error) throw new Error(result.error);

      api.success({
        message: "Task Updated",
        description: `Task priority has been updated to ${newPriority.toLowerCase()}`,
      });
    } catch (error) {
      api.error({
        message: "Error",
        description: "Failed to update task priority",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDueDateChange = async (date: dayjs.Dayjs | null) => {
    try {
      setIsUpdating(true);
      const result = await updateTask(task.id, {
        dueDate: date ? date.toDate() : null,
      });
      if (result.error) throw new Error(result.error);

      api.success({
        message: "Task Updated",
        description: "Due date has been updated",
      });
    } catch (error) {
      api.error({
        message: "Error",
        description: "Failed to update due date",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditSave = async () => {
    try {
      setIsUpdating(true);
      const result = await updateTask(task.id, {
        title: editedTask.title,
        description: editedTask.description || null,
      });
      if (result.error) throw new Error(result.error);

      setIsEditing(false);
      api.success({
        message: "Task Updated",
        description: "Task details have been updated",
      });
    } catch (error) {
      api.error({
        message: "Error",
        description: "Failed to update task details",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const editForm = (
    <div className="p-2 min-w-[300px]">
      <div className="mb-3">
        <Input
          value={editedTask.title}
          onChange={(e) =>
            setEditedTask((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Task title"
        />
      </div>
      <div className="mb-3">
        <Input.TextArea
          value={editedTask.description}
          onChange={(e) =>
            setEditedTask((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Description"
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button size="small" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
        <Button
          size="small"
          type="primary"
          onClick={handleEditSave}
          loading={isUpdating}
        >
          Save
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {contextHolder}
      <div className="border rounded-md p-3 mb-2 last:mb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Popover
                content={editForm}
                title="Edit Task"
                trigger="click"
                open={isEditing}
                onOpenChange={setIsEditing}
              >
                <div className="flex items-center gap-2 cursor-pointer hover:text-blue-500">
                  <h4 className="font-medium text-base m-0">{task.title}</h4>
                  <EditOutlined className="text-sm" />
                </div>
              </Popover>
              <Select
                value={task.priority}
                onChange={handlePriorityChange}
                style={{ width: 100 }}
                loading={isUpdating}
                disabled={isUpdating}
                size="small"
              >
                {Object.entries(Priority).map(([key, value]) => (
                  <Select.Option key={key} value={value}>
                    <Tag color={PriorityColors[value as Priority]}>{value}</Tag>
                  </Select.Option>
                ))}
              </Select>
              <DatePicker
                value={task.dueDate ? dayjs(task.dueDate) : null}
                onChange={handleDueDateChange}
                format="YYYY-MM-DD HH:mm"
                showTime
                allowClear
                placeholder="Set due date"
                disabled={isUpdating}
                size="small"
              />
              {task.dueDate && (
                <Tooltip title={dayjs(task.dueDate).format("YYYY-MM-DD HH:mm")}>
                  <Tag icon={<CalendarOutlined />}>
                    {dayjs(task.dueDate).fromNow()}
                  </Tag>
                </Tooltip>
              )}
            </div>
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
