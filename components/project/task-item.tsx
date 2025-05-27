"use client";
import { Priority, Task, TaskProgress } from "@/app/generated/prisma";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EditOutlined,
  LockOutlined,
  PlayCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Dropdown,
  Input,
  MenuProps,
  notification,
  Popover,
  Select,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

dayjs.extend(relativeTime);

const PriorityConfig = {
  LOW: { color: "#52c41a", label: "Low" },
  MEDIUM: { color: "#1890ff", label: "Medium" },
  HIGH: { color: "#faad14", label: "High" },
  URGENT: { color: "#ff4d4f", label: "Urgent" },
};

const StatusConfig = {
  [TaskProgress.TODO]: {
    color: "#8c8c8c",
    bgColor: "#f5f5f5",
    icon: <ClockCircleOutlined />,
    label: "To Do",
  },
  [TaskProgress.IN_PROGRESS]: {
    color: "#1890ff",
    bgColor: "#e6f7ff",
    icon: <PlayCircleOutlined />,
    label: "In Progress",
  },
  [TaskProgress.DONE]: {
    color: "#52c41a",
    bgColor: "#f6ffed",
    icon: <CheckCircleOutlined />,
    label: "Done",
  },
};

interface TaskItemProps {
  task: Task;
  isManager: boolean;
  compact?: boolean;
}

export const TaskItem = ({
  task,
  isManager,
  compact = false,
}: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description || "",
  });
  const [api, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  const { mutate: updateTask, isPending: isUpdating } = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      
      return response.json();
    },
    onSuccess: (updatedTask, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      
      if (variables.status) {
        api.success({
          message: "Task Updated",
          description: `Status changed to ${StatusConfig[variables.status].label}`,
          placement: "topRight",
        });
      } else if (variables.priority) {
        api.success({
          message: "Priority Updated",
          description: `Priority set to ${PriorityConfig[variables.priority].label}`,
          placement: "topRight",
        });
      } else if (variables.dueDate !== undefined) {
        api.success({
          message: "Due Date Updated",
          description: variables.dueDate
            ? `Due date set to ${dayjs(variables.dueDate).format("MMM DD, YYYY")}`
            : "Due date removed",
          placement: "topRight",
        });
      } else if (variables.title || variables.description !== undefined) {
        api.success({
          message: "Task Updated",
          description: "Task details saved successfully",
          placement: "topRight",
        });
        setIsEditing(false);
      }
    },
    onError: (error, variables) => {
      console.error("Failed to update task:", error);
      
      let description = "Could not update task";
      if (variables.status) {
        description = "Could not update task status";
      } else if (variables.priority) {
        description = "Could not update task priority";
      } else if (variables.dueDate !== undefined) {
        description = "Could not update due date";
      } else if (variables.title || variables.description !== undefined) {
        description = "Could not save task changes";
      }
      
      api.error({
        message: "Update Failed",
        description,
        placement: "topRight",
      });
    },
  });

  const handleStatusChange = (newStatus: TaskProgress) => {
    if (!isManager) return;
    updateTask({ status: newStatus });
  };

  const handlePriorityChange = (newPriority: Priority) => {
    if (!isManager) return;
    updateTask({ priority: newPriority });
  };

  const handleDueDateChange = (date: dayjs.Dayjs | null) => {
    if (!isManager) return;
    updateTask({ dueDate: date ? date.toDate() : null });
  };

  const handleEditSave = () => {
    if (!isManager) return;
    updateTask({
      title: editedTask.title,
      description: editedTask.description || null,
    });
  };

  const isDueSoon =
    task.dueDate && dayjs(task.dueDate).diff(dayjs(), "days") <= 1;
  const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs());

  const statusMenuItems: MenuProps["items"] = [
    {
      key: TaskProgress.TODO,
      label: (
        <div className="flex items-center gap-2">
          {StatusConfig[TaskProgress.TODO].icon}
          <span>To Do</span>
        </div>
      ),
      onClick: () => handleStatusChange(TaskProgress.TODO),
    },
    {
      key: TaskProgress.IN_PROGRESS,
      label: (
        <div className="flex items-center gap-2">
          {StatusConfig[TaskProgress.IN_PROGRESS].icon}
          <span>In Progress</span>
        </div>
      ),
      onClick: () => handleStatusChange(TaskProgress.IN_PROGRESS),
    },
    {
      key: TaskProgress.DONE,
      label: (
        <div className="flex items-center gap-2">
          {StatusConfig[TaskProgress.DONE].icon}
          <span>Done</span>
        </div>
      ),
      onClick: () => handleStatusChange(TaskProgress.DONE),
    },
  ];

  const editForm = (
    <div className="w-80">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title
          </label>
          <Input
            value={editedTask.title}
            onChange={(e) =>
              setEditedTask((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter task title"
            className="h-10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <Input.TextArea
            value={editedTask.description}
            onChange={(e) =>
              setEditedTask((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Add description..."
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
        <Button
          size="small"
          onClick={() => setIsEditing(false)}
          icon={<CloseOutlined />}
        >
          Cancel
        </Button>
        <Button
          size="small"
          type="primary"
          onClick={handleEditSave}
          loading={isUpdating}
          icon={<SaveOutlined />}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {contextHolder}
      <div
        className="group relative bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all duration-300"
        onClick={handleContainerClick}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {isManager ? (
                <Popover
                  content={editForm}
                  title={
                    <div className="flex items-center gap-2 text-gray-700">
                      <EditOutlined />
                      <span className="font-medium">Edit Task</span>
                    </div>
                  }
                  trigger="click"
                  open={isEditing}
                  onOpenChange={setIsEditing}
                  placement="bottomLeft"
                >
                  <div
                    className="flex items-center gap-2 cursor-pointer group-hover:text-blue-600 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {task.title}
                    </h4>
                    <EditOutlined className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Popover>
              ) : (
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                    {task.title}
                  </h4>
                  <LockOutlined className="text-xs text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {isManager ? (
                  <Select
                    value={task.priority}
                    onChange={handlePriorityChange}
                    style={{ width: 90 }}
                    loading={isUpdating}
                    disabled={isUpdating}
                    size="small"
                    variant="borderless"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {Object.entries(Priority).map(([key, value]) => (
                      <Select.Option key={key} value={value}>
                        <div className="flex items-center gap-2">
                          <span style={{ color: PriorityConfig[value].color }}>
                            {PriorityConfig[value].label}
                          </span>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 rounded-sm"
                      style={{
                        backgroundColor: PriorityConfig[task.priority].color,
                      }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: PriorityConfig[task.priority].color }}
                    >
                      {PriorityConfig[task.priority].label}
                    </span>
                  </div>
                )}
              </div>

              {/* Due Date */}
              {isManager ? (
                <DatePicker
                  value={task.dueDate ? dayjs(task.dueDate) : null}
                  onChange={handleDueDateChange}
                  format="MMM DD"
                  showTime
                  allowClear
                  placeholder="Due date"
                  disabled={isUpdating}
                  size="small"
                  variant="borderless"
                  className="w-24"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                task.dueDate && (
                  <Tooltip
                    title={dayjs(task.dueDate).format("MMMM DD, YYYY HH:mm")}
                  >
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        isOverdue
                          ? "bg-red-100 text-red-700"
                          : isDueSoon
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <CalendarOutlined className="text-xs" />
                      <span>{dayjs(task.dueDate).fromNow()}</span>
                    </div>
                  </Tooltip>
                )
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isManager ? (
              <Dropdown
                menu={{ items: statusMenuItems }}
                trigger={["click"]}
                disabled={isUpdating}
              >
                <Button
                  size="small"
                  loading={isUpdating}
                  className="border-0 shadow-sm"
                  style={{
                    backgroundColor: StatusConfig[task.status].bgColor,
                    color: StatusConfig[task.status].color,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1">
                    {StatusConfig[task.status].icon}
                    <span className="text-xs font-medium">
                      {StatusConfig[task.status].label}
                    </span>
                  </div>
                </Button>
              </Dropdown>
            ) : (
              <div
                className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                style={{
                  backgroundColor: StatusConfig[task.status].bgColor,
                  color: StatusConfig[task.status].color,
                }}
              >
                {StatusConfig[task.status].icon}
                <span>{StatusConfig[task.status].label}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
