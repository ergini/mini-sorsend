"use client";
import { useRoleStore } from "@/store/useRole";
import { Button, Modal, Skeleton } from "antd";
import { useState } from "react";
import { AddProjectForm } from "./add-project-form";

export default function AddProject() {
  const { role, hydrated } = useRoleStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  if (!hydrated)
    return (
      <Skeleton.Input style={{ width: 40, height: 40 }} active size="default" />
    );

  if (role !== "manager") return null;

  return (
    <>
      <Button
        type="primary"
        onClick={showModal}
        className="shadow-sm hover:shadow-md transition-shadow"
      >
        Add Project
      </Button>
      <Modal
        title={
          <div className="pb-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              Add New Project
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new project with tasks and details
            </p>
          </div>
        }
        closable={{ "aria-label": "Close Modal" }}
        onCancel={handleCancel}
        okButtonProps={{ hidden: true }}
        cancelButtonProps={{ hidden: true }}
        open={isModalOpen}
        width={600}
        styles={{
          body: { padding: "24px 0 0 0" },
          header: { padding: "24px 24px 0 24px", border: "none" },
        }}
      >
        <div className="px-6">
          <AddProjectForm onClose={handleCancel} />
        </div>
      </Modal>
    </>
  );
}
