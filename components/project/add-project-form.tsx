"use client";
import { Priority, TaskProgress } from "@/app/generated/prisma";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FormProps } from "antd";
import { Button, Form, Input, notification } from "antd";
import { TaskFormItems } from "./task-form-items";

interface CreateTaskData {
  title: string;
  description?: string;
  status: TaskProgress;
  priority: Priority;
  dueDate?: Date | null;
}

interface CreateProjectData {
  name: string;
  description?: string;
  tasks?: CreateTaskData[];
}

interface AddProjectFormProps {
  onClose: () => void;
}

export const AddProjectForm = ({ onClose }: AddProjectFormProps) => {
  const [form] = Form.useForm<CreateProjectData>();
  const [api, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  const { mutate: createProject, isPending: isCreating } = useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      return response.json();
    },
    onSuccess: (newProject, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      const taskCount = variables.tasks?.length ?? 0;
      api.success({
        message: "Project Created",
        description: `Project "${variables.name}" has been created successfully with ${taskCount} tasks.`,
        placement: "topRight",
      });
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
      api.error({
        message: "Error",
        description: "Failed to create project. Please try again.",
        placement: "topRight",
      });
    },
  });

  const onFinish: FormProps<CreateProjectData>["onFinish"] = (values) => {
    const formattedValues = {
      ...values,
      tasks: values.tasks?.map((task) => ({
        ...task,
        status: task.status || TaskProgress.TODO,
      })),
    };

    createProject(formattedValues);
  };

  const onFinishFailed: FormProps<CreateProjectData>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        name="add-project"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        initialValues={{
          tasks: [],
        }}
        className="space-y-4"
      >
        <Form.Item
          label={
            <span className="text-sm font-medium text-foreground">
              Project Name
            </span>
          }
          name="name"
          rules={[
            { required: true, message: "Please input the project name!" },
          ]}
        >
          <Input placeholder="Enter project name" className="h-10" />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-sm font-medium text-foreground">
              Description
            </span>
          }
          name="description"
        >
          <Input.TextArea
            rows={3}
            placeholder="Enter project description (optional)"
            className="resize-none"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-sm font-medium text-foreground">Tasks</span>
          }
        >
          <TaskFormItems />
        </Form.Item>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
          <Button
            htmlType="button"
            onClick={onClose}
            disabled={isCreating}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating}
            className="min-w-[120px] shadow-sm"
          >
            Create Project
          </Button>
        </div>
      </Form>
    </>
  );
};
