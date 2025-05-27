import AddProject from "@/components/project/add-project-modal";
import Projects from "@/components/project/projects";
import { Suspense } from "react";

export default async function Home() {
  return (
    <main className="w-full p-6 space-y-12">
      <h1 className="font-semibold text-2xl">Mini Sorsend</h1>
      <div className="w-full space-y-4">
        <div className="w-full flex items-center justify-between">
          <h1 className="font-medium text-xl">Projects</h1>
          <AddProject />
        </div>
        <Suspense fallback={<div>Loading projects...</div>}>
          <Projects />
        </Suspense>
      </div>
    </main>
  );
}
