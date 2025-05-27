import { Priority, TaskProgress } from "@/app/generated/prisma";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Select, Space, Tag } from "antd";

const { Option } = Select;

const PriorityColors: Record<Priority, string> = {
  LOW: "blue",
  MEDIUM: "green",
  HIGH: "orange",
  URGENT: "red",
};

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskProgress;
  priority: Priority;
  dueDate?: Date;
}

export const TaskFormItems = () => {
  return (
    <Form.List name="tasks">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Space
              key={key}
              style={{ display: "flex", marginBottom: 8 }}
              align="baseline"
              wrap
            >
              <Form.Item
                {...restField}
                name={[name, "title"]}
                rules={[{ required: true, message: "Task title is required" }]}
              >
                <Input placeholder="Task title" />
              </Form.Item>

              <Form.Item {...restField} name={[name, "description"]}>
                <Input placeholder="Description" />
              </Form.Item>

              <Form.Item
                {...restField}
                name={[name, "status"]}
                initialValue={TaskProgress.TODO}
              >
                <Select style={{ width: 120 }}>
                  <Option value={TaskProgress.TODO}>To Do</Option>
                  <Option value={TaskProgress.IN_PROGRESS}>In Progress</Option>
                  <Option value={TaskProgress.DONE}>Done</Option>
                </Select>
              </Form.Item>

              <Form.Item
                {...restField}
                name={[name, "priority"]}
                initialValue={Priority.MEDIUM}
              >
                <Select style={{ width: 100 }}>
                  {Object.entries(Priority).map(([key, value]) => (
                    <Option key={key} value={value}>
                      <Tag color={PriorityColors[value]}>{value}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item {...restField} name={[name, "dueDate"]}>
                <DatePicker
                  showTime
                  placeholder="Set due date"
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>

              <MinusCircleOutlined onClick={() => remove(name)} />
            </Space>
          ))}

          <Form.Item>
            <Button
              type="dashed"
              onClick={() =>
                add({
                  status: TaskProgress.TODO,
                  priority: Priority.MEDIUM,
                })
              }
              block
              icon={<PlusOutlined />}
            >
              Add Task
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};
