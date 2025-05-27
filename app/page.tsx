import AddProject from "@/components/project/add-project-modal";
import Projects from "@/components/project/projects";
import RoleToggle from "@/components/role-toggle";
import { Suspense } from "react";

export default async function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="w-full p-6 space-y-8 max-w-7xl mx-auto">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-3xl text-foreground">
              Mini Sorsend
            </h1>
          </div>
          <RoleToggle />
        </header>

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
    </main>
  );
}
