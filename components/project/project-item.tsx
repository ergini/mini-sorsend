import { Project, Task, TaskProgress } from "@/app/generated/prisma";
import { Card, Divider } from "antd";
import { TaskItem } from "./task-item";

interface ProjectItemProps {
  project: Project & { tasks: Task[] };
}

export const ProjectItem = ({ project }: ProjectItemProps) => {
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
  const latestTasks = [...project.tasks]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 2);

  return (
    <Card
      title={project.name}
      style={{ width: "100%" }}
      extra={<span>{project.tasks.length} tasks</span>}
    >
      <p className="text-gray-600 mb-4">{project.description}</p>

      <div className="flex gap-4 text-sm mb-4">
        <div className="flex flex-col">
          <span className="font-medium">To Do</span>
          <span className="text-gray-600">{taskStats[TaskProgress.TODO]}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-medium">In Progress</span>
          <span className="text-gray-600">
            {taskStats[TaskProgress.IN_PROGRESS]}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-medium">Done</span>
          <span className="text-gray-600">{taskStats[TaskProgress.DONE]}</span>
        </div>
      </div>

      {latestTasks.length > 0 && (
        <>
          <Divider orientation="left" className="my-4">
            Latest Tasks
          </Divider>
          <div>
            {latestTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </>
      )}
    </Card>
  );
};
