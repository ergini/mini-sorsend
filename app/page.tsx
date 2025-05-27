import AddProject from "@/components/project/add-project-modal";
import Projects from "@/components/project/projects";
import RoleToggle from "@/components/role-toggle";
import { Suspense } from "react";
import { SocketStatus } from "@/components/socket-status";

export default async function Home() {
  return (
    <div className="min-h-screen">
      <SocketStatus />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Mini Sorsend
            </h1>
          </div>
          <RoleToggle />
        </div>

        <section className="w-full space-y-6">
          <div className="w-full flex items-center justify-between">
            <div>
              <h2 className="font-medium text-2xl text-foreground">Projects</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your projects and tasks
              </p>
            </div>
            <AddProject />
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-muted-foreground">
                  Loading projects...
                </div>
              </div>
            }
          >
            <Projects />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
