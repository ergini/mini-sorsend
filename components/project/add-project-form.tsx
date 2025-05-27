import { createProject } from "@/app/actions";
import type { FormProps } from "antd";
import { Button, Form, Input, notification } from "antd";
import { useState } from "react";
import { TaskFormItems } from "./task-form-items";
import type { CreateProjectData } from "@/app/actions";
import { TaskProgress } from "@/app/generated/prisma";

interface AddProjectFormProps {
  onClose: () => void;
}

export const AddProjectForm = ({ onClose }: AddProjectFormProps) => {
  const [form] = Form.useForm<CreateProjectData>();
  const [api, contextHolder] = notification.useNotification();
  const [submitting, setSubmitting] = useState(false);

  const onFinish: FormProps<CreateProjectData>["onFinish"] = async (values) => {
    try {
      setSubmitting(true);
      // Ensure all tasks have a status
      const formattedValues = {
        ...values,
        tasks: values.tasks?.map((task) => ({
          ...task,
          status: task.status || TaskProgress.TODO,
        })),
      };

      const result = await createProject(formattedValues);

      if (result.error) {
        api.error({
          message: "Error",
          description: result.error,
        });
      } else {
        const taskCount = values.tasks?.length ?? 0;
        api.success({
          message: "Project Created",
          description: `Project "${values.name}" has been created successfully with ${taskCount} tasks.`,
        });
        form.resetFields();
        onClose();
      }
    } catch (error: unknown) {
      api.error({
        message: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setSubmitting(false);
    }
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
        style={{ maxWidth: 800 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        initialValues={{
          tasks: [],
        }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            { required: true, message: "Please input the project name!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item label="Tasks">
          <TaskFormItems />
        </Form.Item>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outlined"
            htmlType="button"
            className="w-full"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={submitting}
          >
            Create Project
          </Button>
        </div>
      </Form>
    </>
  );
};
