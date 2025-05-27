import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "manager" | "employee";

interface RoleState {
  role: Role;
  setRole: (role: Role) => void;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: "employee",
      setRole: (role) => set({ role }),
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "role-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
