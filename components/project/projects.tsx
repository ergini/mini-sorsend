"use client";
import { FolderOpenOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Empty, Skeleton } from "antd";
import { ProjectItem } from "./project-item";

const ProjectSkeleton = () => (
  <Card className="h-full">
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton.Avatar size="large" />
        <div className="flex-1">
          <Skeleton.Input style={{ width: 200, height: 24 }} active />
        </div>
      </div>

      {/* Description skeleton */}
      <Skeleton paragraph={{ rows: 2, width: ["100%", "80%"] }} active />

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-gray-50 rounded-lg">
            <Skeleton.Input style={{ width: 60, height: 16 }} active />
            <div className="mt-2">
              <Skeleton.Input style={{ width: 30, height: 20 }} active />
            </div>
          </div>
        ))}
      </div>

      {/* Recent task skeleton */}
      <div className="mt-4">
        <Skeleton.Input style={{ width: 100, height: 16 }} active />
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <Skeleton paragraph={{ rows: 1 }} active />
        </div>
      </div>
    </div>
  </Card>
);

export default function Projects() {
  const {
    data: projects,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: () => fetch("/api/projects").then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="w-full grid grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-full">
            <ProjectSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <Alert
          message="Error Loading Projects"
          description="Failed to load projects. Please try again."
          type="error"
          action={
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Empty
          image={<FolderOpenOutlined className="text-6xl text-gray-300" />}
          description={
            <div className="text-center">
              <p className="text-gray-500 text-lg font-medium mb-2">
                No projects yet
              </p>
              <p className="text-gray-400 text-sm">
                Create your first project to get started with task management
              </p>
            </div>
          }
          className="text-center"
        />
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-2 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="w-full">
          <ProjectItem project={project} />
        </div>
      ))}
    </div>
  );
}
