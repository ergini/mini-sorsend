"use client";
import { TaskProgress, Priority } from "@/app/generated/prisma";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  notification,
  Select,
} from "antd";
import { useState } from "react";
import dayjs from "dayjs";

interface CreateTaskData {
  title: string;
  description?: string;
  status: TaskProgress;
  priority: Priority;
  dueDate?: Date | null;
  projectId: string;
}

interface AddTaskFormProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddTaskForm = ({ projectId, projectName, isOpen, onClose }: AddTaskFormProps) => {
  const [form] = Form.useForm<CreateTaskData>();
  const [api, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  const { mutate: createTask, isPending: isCreating } = useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      return response.json();
    },
    onSuccess: (newTask, variables) => {
      // Manual cache invalidation as fallback
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      api.success({
        message: "Task Created",
        description: `Task "${variables.title}" has been added to ${projectName}`,
        placement: "topRight",
      });
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
      api.error({
        message: "Error",
        description: "Failed to create task. Please try again.",
        placement: "topRight",
      });
    },
  });

  const handleSubmit = (values: any) => {
    const taskData: CreateTaskData = {
      ...values,
      projectId,
      dueDate: values.dueDate ? values.dueDate.toDate() : null,
    };
    createTask(taskData);
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={`Add Task to ${projectName}`}
        open={isOpen}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: TaskProgress.TODO,
            priority: Priority.MEDIUM,
          }}
          className="mt-4"
        >
          <Form.Item
            label="Task Title"
            name="title"
            rules={[{ required: true, message: "Please enter a task title" }]}
          >
            <Input placeholder="Enter task title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter task description (optional)"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Status"
              name="status"
            >
              <Select>
                <Select.Option value={TaskProgress.TODO}>To Do</Select.Option>
                <Select.Option value={TaskProgress.IN_PROGRESS}>In Progress</Select.Option>
                <Select.Option value={TaskProgress.DONE}>Done</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Priority"
              name="priority"
            >
              <Select>
                <Select.Option value={Priority.LOW}>Low</Select.Option>
                <Select.Option value={Priority.MEDIUM}>Medium</Select.Option>
                <Select.Option value={Priority.HIGH}>High</Select.Option>
                <Select.Option value={Priority.URGENT}>Urgent</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Due Date"
            name="dueDate"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder="Select due date (optional)"
              className="w-full"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={handleCancel} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreating}
            >
              Create Task
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}; 