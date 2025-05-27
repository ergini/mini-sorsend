"use client";
import { Project, Task, TaskProgress } from "@/app/generated/prisma";
import { useRoleStore } from "@/store/useRole";
import {
  BulbOutlined,
  CalendarOutlined,
  CloseOutlined,
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  FolderOutlined,
  HeartOutlined,
  ProjectOutlined,
  RocketOutlined,
  SaveOutlined,
  StarOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Divider,
  Input,
  Modal,
  notification,
  Select,
  Space,
  Tabs,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { TaskItem } from "./task-item";
import { AddTaskForm } from "./add-task-form";

interface ProjectItemProps {
  project: Project & { tasks: Task[] };
}

interface UpdateProjectData {
  name?: string;
  description?: string | null;
  icon?: string;
}

const iconOptions = [
  { value: "FolderOutlined", label: "Folder", icon: <FolderOutlined /> },
  { value: "ProjectOutlined", label: "Project", icon: <ProjectOutlined /> },
  { value: "FileTextOutlined", label: "Document", icon: <FileTextOutlined /> },
  { value: "BulbOutlined", label: "Idea", icon: <BulbOutlined /> },
  { value: "RocketOutlined", label: "Rocket", icon: <RocketOutlined /> },
  { value: "StarOutlined", label: "Star", icon: <StarOutlined /> },
  { value: "HeartOutlined", label: "Heart", icon: <HeartOutlined /> },
  {
    value: "ThunderboltOutlined",
    label: "Lightning",
    icon: <ThunderboltOutlined />,
  },
  { value: "CrownOutlined", label: "Crown", icon: <CrownOutlined /> },
];

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    FolderOutlined: <FolderOutlined />,
    ProjectOutlined: <ProjectOutlined />,
    FileTextOutlined: <FileTextOutlined />,
    BulbOutlined: <BulbOutlined />,
    RocketOutlined: <RocketOutlined />,
    StarOutlined: <StarOutlined />,
    HeartOutlined: <HeartOutlined />,
    ThunderboltOutlined: <ThunderboltOutlined />,
    CrownOutlined: <CrownOutlined />,
  };
  return iconMap[iconName] || <FolderOutlined />;
};

export const ProjectItem = ({ project }: ProjectItemProps) => {
  const { role } = useRoleStore();
  const isManager = role === "manager";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editedProject, setEditedProject] = useState({
    name: project.name,
    description: project.description || "",
    icon: project.icon || "FolderOutlined",
  });
  const [api, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  const { mutate: updateProject, isPending: isUpdatingProject } = useMutation({
    mutationFn: async (data: UpdateProjectData) => {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      return response.json();
    },
    onSuccess: () => {
      // Manual cache invalidation as fallback
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      setIsEditingProject(false);
      api.success({
        message: "Project Updated",
        description: "Project details saved successfully",
        placement: "topRight",
      });
    },
    onError: (error) => {
      console.error("Failed to update project:", error);
      api.error({
        message: "Save Failed",
        description: "Could not save project changes",
        placement: "topRight",
      });
    },
  });

  const { mutate: deleteProject, isPending: isDeletingProject } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      return response.json();
    },
    onSuccess: () => {
      // Manual cache invalidation as fallback
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      setIsDeleteModalOpen(false);
      setIsModalOpen(false);
      api.success({
        message: "Project Deleted",
        description: "Project has been deleted successfully",
        placement: "topRight",
      });
    },
    onError: (error) => {
      console.error("Failed to delete project:", error);
      api.error({
        message: "Delete Failed",
        description: "Could not delete project",
        placement: "topRight",
      });
    },
  });

  const getTaskStats = () => {
    const stats = {
      [TaskProgress.TODO]: 0,
      [TaskProgress.IN_PROGRESS]: 0,
      [TaskProgress.DONE]: 0,
    };

    project.tasks.forEach((task) => {
      stats[task.status]++;
    });

    return stats;
  };

  const taskStats = getTaskStats();
  const totalTasks = project.tasks.length;
  const completedTasks = taskStats[TaskProgress.DONE];
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getProgressColor = () => {
    if (progressPercentage >= 80) return "#52c41a";
    if (progressPercentage >= 50) return "#1890ff";
    if (progressPercentage >= 25) return "#faad14";
    return "#ff4d4f";
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditingProject(false);
  };

  const handleProjectSave = () => {
    if (!isManager) return;

    updateProject({
      name: editedProject.name,
      description: editedProject.description || null,
      icon: editedProject.icon,
    });
  };

  const tabItems = [
    {
      key: "1",
      label: "Overview",
      children: (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">Project Description</h4>
            {isManager && isEditingProject ? (
              <Input.TextArea
                value={editedProject.description}
                onChange={(e) =>
                  setEditedProject((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter project description..."
                rows={3}
                className="mb-2"
              />
            ) : (
              <p className="text-gray-600">
                {project.description || "No description provided"}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Progress Overview</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {totalTasks}
                </div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {progressPercentage}%
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Task Distribution</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {taskStats[TaskProgress.TODO]}
                </div>
                <div className="text-sm text-blue-700">To Do</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">
                  {taskStats[TaskProgress.IN_PROGRESS]}
                </div>
                <div className="text-sm text-orange-700">In Progress</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {taskStats[TaskProgress.DONE]}
                </div>
                <div className="text-sm text-green-700">Done</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: `All Tasks (${totalTasks})`,
      children: (
        <div className="space-y-4">
          {project.tasks.length > 0 ? (
            <div className="space-y-3">
              {project.tasks.map((task) => (
                <TaskItem key={task.id} task={task} isManager={isManager} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <FolderOutlined className="text-4xl" />
              </div>
              <p className="text-gray-500">No tasks in this project yet</p>
              {isManager && (
                <p className="text-gray-400 text-sm">
                  Add tasks to get started
                </p>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Card
        className="h-full shadow-sm hover:shadow-lg transition-all duration-200 border-0 bg-white cursor-pointer group"
        styles={{
          body: { padding: "24px" },
        }}
        onClick={showModal}
        hoverable
      >
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600 text-xl group-hover:scale-105 transition-transform duration-200">
                {getIconComponent(project.icon || "FolderOutlined")}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {project.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarOutlined className="text-xs" />
                  <span>
                    Created {dayjs(project.createdAt).format("MMM DD, YYYY")}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Add Task Button - always visible in header */}
            {isManager && (
              <Button
                type="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAddTaskModalOpen(true);
                }}
              >
                Add Task
              </Button>
            )}
          </div>

          {project.description ? (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-gray-700 text-sm leading-relaxed m-0">
                {project.description.length > 150
                  ? `${project.description.substring(0, 150)}...`
                  : project.description}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 border-dashed">
              <p className="text-gray-400 text-sm italic m-0">
                No description provided
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
            <div className="flex items-center justify-center mb-1">
              <span className="text-xs font-medium text-blue-700">To Do</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {taskStats[TaskProgress.TODO]}
            </div>
          </div>

          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors duration-200">
            <div className="flex items-center justify-center mb-1">
              <span className="text-xs font-medium text-orange-700">
                In Progress
              </span>
            </div>
            <div className="text-lg font-bold text-orange-600">
              {taskStats[TaskProgress.IN_PROGRESS]}
            </div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors duration-200">
            <div className="flex items-center justify-center mb-1">
              <span className="text-xs font-medium text-green-700">Done</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {taskStats[TaskProgress.DONE]}
            </div>
          </div>
        </div>

        <Divider className="my-4 border-gray-200">
          <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
            Recent Task
          </span>
        </Divider>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          {project.tasks.length > 0 ? (
            <TaskItem
              task={project.tasks[0]}
              isManager={isManager}
              compact={true}
            />
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">No tasks yet</p>
            </div>
          )}
        </div>
      </Card>

      <Modal
        title={
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {isManager && isEditingProject ? (
                <Select
                  value={editedProject.icon}
                  onChange={(value) =>
                    setEditedProject((prev) => ({ ...prev, icon: value }))
                  }
                  style={{ width: 60 }}
                >
                  {iconOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.icon}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                getIconComponent(project.icon || "FolderOutlined")
              )}
              <div>
                {isManager && isEditingProject ? (
                  <Input
                    value={editedProject.name}
                    onChange={(e) =>
                      setEditedProject((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="text-xl font-semibold"
                    style={{ border: "none", padding: 0, fontSize: "20px" }}
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900 m-0">
                    {project.name}
                  </h2>
                )}
                <p className="text-sm text-gray-500 m-0 mt-1">
                  Created {dayjs(project.createdAt).format("MMM DD, YYYY")}
                </p>
              </div>
            </div>

            {isManager && (
              <Space>
                {isEditingProject ? (
                  <>
                    <Button
                      size="small"
                      onClick={() => setIsEditingProject(false)}
                      icon={<CloseOutlined />}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      onClick={handleProjectSave}
                      loading={isUpdatingProject}
                      icon={<SaveOutlined />}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="small"
                      danger
                      onClick={() => setIsDeleteModalOpen(true)}
                      icon={<DeleteOutlined />}
                    >
                      Delete
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setIsEditingProject(true)}
                      icon={<EditOutlined />}
                    >
                      Edit Project
                    </Button>
                  </>
                )}
              </Space>
            )}
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
        ]}
        width={900}
        styles={{
          body: { padding: "24px 0 0 0" },
          header: { padding: "24px 24px 0 24px", border: "none" },
        }}
      >
        <div className="px-6">
          <Tabs items={tabItems} />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Project"
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={isDeletingProject}
            onClick={() => deleteProject()}
          >
            Delete Project
          </Button>,
        ]}
        width={400}
      >
        <div className="py-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete the project "{project.name}"?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm font-medium mb-1">
              ⚠️ This action cannot be undone
            </p>
            <p className="text-red-600 text-sm">
              All tasks associated with this project will also be deleted.
            </p>
          </div>
        </div>
      </Modal>

      {/* Add Task Form Modal */}
      <AddTaskForm
        projectId={project.id}
        projectName={project.name}
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
      />
    </>
  );
};
