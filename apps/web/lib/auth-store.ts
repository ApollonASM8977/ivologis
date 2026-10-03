import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { UserRole } from "@ivologis/shared";

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string | null;
  permissions?: string[];
}

interface AuthState {
  user: CurrentUser | null;
  setSession: (token: string, user: CurrentUser) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setSession: (token, user) => {
        const secure = typeof window !== "undefined" && window.location.protocol === "https:";
        Cookies.set("ivologis_token", token, { expires: 7, sameSite: "lax", secure });
        Cookies.set("ivologis_role", user.role, { expires: 7, sameSite: "lax", secure });
        set({ user });
      },
      clearSession: () => {
        Cookies.remove("ivologis_token");
        Cookies.remove("ivologis_role");
        set({ user: null });
      },
    }),
    { name: "ivologis-auth" },
  ),
);

export const ROLE_HOME: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "/admin/dashboard",
  [UserRole.ADMIN_AGENT]: "/admin/dashboard",
  [UserRole.OWNER]: "/owner/dashboard",
  [UserRole.TENANT]: "/tenant/dashboard",
};
