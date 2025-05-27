import db from "@/utils/db";
import { ProjectItem } from "./project-item";

const getProjects = async () => {
  const res = await db.project.findMany({
    include: { tasks: true },
    orderBy: { createdAt: "desc" },
  });

  return res;
};

export default async function Projects() {
  const projects = await getProjects();

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectItem key={project.id} project={project} />
      ))}
    </div>
  );
}
