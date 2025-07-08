import { useLocalStorage } from "./useLocalStorage";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

export interface User {
  role: "admin" | "user";
  name: string;
  loginTime: string;
  class?: string;
  board?: string;
}

const ALLOWED_ADMIN_NAMES = ["Mihir", "Prasad", "Pradnya"];

export function useAuth() {
  const [user, setUser] = useLocalStorage<User | null>("mihir-auth-user", null);

  console.log("useAuth - current user:", user);

  const login = (role: "admin" | "user", name: string, className?: string, board?: string) => {
    // Check if admin login is restricted
    if (role === "admin" && !ALLOWED_ADMIN_NAMES.includes(name)) {
      throw new Error("Access denied. Only authorized administrators can access the admin panel.");
    }

    const userData: User = {
      role,
      name,
      loginTime: new Date().toISOString(),
      class: className,
      board: board,
    };
    console.log("useAuth - logging in user:", userData);
    setUser(userData);

    // Log activity to Supabase
    supabase.from('recent_activities').insert([
      {
        user_id: null, // If you have user id, use it here
        user_name: name,
        action: 'logged in',
        details: null,
        created_at: new Date().toISOString(),
      } as TablesInsert<'recent_activities'>
    ]);
  };

  const logout = () => {
    console.log("useAuth - logging out");
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";
  const isLoggedIn = !!user;

  console.log("useAuth - computed values:", { isAdmin, isUser, isLoggedIn });

  return {
    user,
    login,
    logout,
    isAdmin,
    isUser,
    isLoggedIn,
  };
}
