"use client";
import { useRoleStore } from "@/store/useRole";
import { Skeleton, Switch } from "antd";

export default function RoleToggle() {
  const { role, setRole, hydrated } = useRoleStore();

  const toggleRole = () => {
    setRole(role === "manager" ? "employee" : "manager");
  };

  if (!hydrated) {
    return (
      <Skeleton.Input style={{ width: 120, height: 20 }} active size="small" />
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg border border-border">
      <span className="text-sm font-medium text-muted-foreground">Role:</span>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium transition-colors ${
            role === "employee" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Employee
        </span>
        <Switch
          onChange={toggleRole}
          checked={role === "manager"}
          size="small"
        />
        <span
          className={`text-sm font-medium transition-colors ${
            role === "manager" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Manager
        </span>
      </div>
    </div>
  );
}
