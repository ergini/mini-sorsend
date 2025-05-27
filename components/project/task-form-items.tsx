import { TaskProgress } from "@/app/generated/prisma";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Space } from "antd";

const { Option } = Select;

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskProgress;
}

export const TaskFormItems = () => {
  return (
    <Form.List name="tasks">
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <Form.Item
                {...restField}
                name={[name, 'title']}
                rules={[{ required: true, message: 'Task title is required' }]}
              >
                <Input placeholder="Task title" />
              </Form.Item>
              
              <Form.Item
                {...restField}
                name={[name, 'description']}
              >
                <Input placeholder="Description" />
              </Form.Item>
              
              <Form.Item
                {...restField}
                name={[name, 'status']}
                initialValue={TaskProgress.TODO}
              >
                <Select style={{ width: 120 }}>
                  <Option value={TaskProgress.TODO}>To Do</Option>
                  <Option value={TaskProgress.IN_PROGRESS}>In Progress</Option>
                  <Option value={TaskProgress.DONE}>Done</Option>
                </Select>
              </Form.Item>

              <MinusCircleOutlined onClick={() => remove(name)} />
            </Space>
          ))}
          
          <Form.Item>
            <Button 
              type="dashed" 
              onClick={() => add({ status: TaskProgress.TODO })} 
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
