import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  role: "admin" | "user";
  name: string;
  email: string;
  loginTime: string;
  class?: string;
  board?: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  role: "admin";
  name: string;
}

interface PendingProfile {
  role: "admin" | "user";
  name: string;
  class?: string;
  board?: string;
}

const PENDING_PROFILE_KEY = "mihir-auth-pending-profile";
const LOCAL_STUDENT_USER_KEY = "mihir-local-student-user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getPendingProfile = (): PendingProfile | null => {
    const raw = localStorage.getItem(PENDING_PROFILE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as PendingProfile;
    } catch {
      localStorage.removeItem(PENDING_PROFILE_KEY);
      return null;
    }
  };

  const clearPendingProfile = () => {
    localStorage.removeItem(PENDING_PROFILE_KEY);
  };

  const getLocalStudent = (): User | null => {
    const raw = localStorage.getItem(LOCAL_STUDENT_USER_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as User;
      return parsed.role === "user" ? parsed : null;
    } catch {
      localStorage.removeItem(LOCAL_STUDENT_USER_KEY);
      return null;
    }
  };

  const clearLocalStudent = () => {
    localStorage.removeItem(LOCAL_STUDENT_USER_KEY);
  };

  const upsertProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("role, name, class, board")
      .eq("id", supabaseUser.id)
      .maybeSingle();

    if (existingProfile) {
      setUser({
        id: supabaseUser.id,
        role: existingProfile.role,
        name: existingProfile.name,
        email: supabaseUser.email ?? "",
        class: existingProfile.class ?? undefined,
        board: existingProfile.board ?? undefined,
        loginTime: new Date().toISOString(),
      });
      return;
    }

    const pendingProfile = getPendingProfile();
    const metadata = supabaseUser.user_metadata ?? {};

    const role = metadata.role === "admin" ? "admin" : pendingProfile?.role ?? "admin";
    const name =
      (typeof metadata.name === "string" && metadata.name.trim()) ||
      (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
      pendingProfile?.name ||
      supabaseUser.email?.split("@")[0] ||
      "Admin";

    const { error: upsertError } = await supabase.from("user_profiles").upsert({
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
      role,
      name,
      class: null,
      board: null,
    });

    if (upsertError) {
      throw upsertError;
    }

    clearPendingProfile();

    setUser({
      id: supabaseUser.id,
      role,
      name,
      email: supabaseUser.email ?? "",
      loginTime: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    const syncSession = async () => {
      const localStudent = getLocalStudent();
      if (localStudent) {
        setUser(localStudent);
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      await upsertProfile(data.session.user);
      setLoading(false);
    };

    syncSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        const localStudent = getLocalStudent();
        setUser(localStudent);
        setLoading(false);
        return;
      }

      clearLocalStudent();
      await upsertProfile(session.user);
      setLoading(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [upsertProfile]);

  const loginStudentWithCredentials = async (username: string, password: string) => {
    const { data: student, error } = await supabase
      .from("students")
      .select("id, username, class, board")
      .eq("username", username)
      .eq("password", password)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!student) {
      throw new Error("Invalid username or password.");
    }

    await supabase.auth.signOut();

    const studentUser: User = {
      id: student.id,
      role: "user",
      name: student.username,
      email: "",
      class: student.class,
      board: student.board,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_STUDENT_USER_KEY, JSON.stringify(studentUser));
    setUser(studentUser);
  };

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  };

  const registerWithEmail = async ({ email, password, role, name }: RegisterPayload) => {
    localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify({ role, name }));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          name,
        },
      },
    });

    if (error) {
      clearPendingProfile();
      throw error;
    }

    if (data.session?.user) {
      const { error: upsertError } = await supabase.from("user_profiles").upsert({
        id: data.session.user.id,
        email,
        role,
        name,
        class: null,
        board: null,
      });

      if (upsertError) {
        throw upsertError;
      }

      clearPendingProfile();
    }

    return data;
  };

  const loginWithGoogle = async (pendingProfile?: PendingProfile) => {
    if (pendingProfile) {
      localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(pendingProfile));
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });

    if (error) {
      clearPendingProfile();
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    clearPendingProfile();
    clearLocalStudent();
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";
  const isLoggedIn = !!user;

  return {
    user,
    loading,
    loginStudentWithCredentials,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    isAdmin,
    isUser,
    isLoggedIn,
  };
}
