"use client";
import { Button, Modal } from "antd";
import { useState } from "react";
import { AddProjectForm } from "./add-project-form";

export default function AddProject() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button onClick={showModal}>Add Project</Button>
      <Modal
        title="Add Project"
        closable={{ "aria-label": "Custom Close Button" }}
        onCancel={handleCancel}
        okButtonProps={{ hidden: true }}
        cancelButtonProps={{ hidden: true }}
        open={isModalOpen}
      >
        <h1>Add your project details</h1>
        <AddProjectForm onClose={handleCancel} />
      </Modal>
    </>
  );
}
