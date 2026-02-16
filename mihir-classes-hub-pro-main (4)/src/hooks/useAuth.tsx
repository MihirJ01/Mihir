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

const DEFAULT_ADMIN_GOOGLE_EMAILS = ["mihirj010105@gmail.com", "prasad16th@gmail.com"];

const parseAdminEmails = () => {
  const raw = import.meta.env.VITE_ADMIN_GOOGLE_EMAILS as string | undefined;

  if (!raw) {
    return DEFAULT_ADMIN_GOOGLE_EMAILS;
  }

  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const ADMIN_GOOGLE_EMAILS = parseAdminEmails();

const OAUTH_REDIRECT_URL =
  (import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined)?.trim() ||
  `${window.location.origin}/app`;
interface RegisterPayload {
  email: string;
  password: string;
  role: "admin" | "user";
  name: string;
  className?: string;
  board?: string;
}

interface PendingProfile {
  role: "admin" | "user";
  name: string;
  class?: string;
  board?: string;
}

const PENDING_PROFILE_KEY = "mihir-auth-pending-profile";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const hydrateGoogleUser = useCallback(async (supabaseUser: SupabaseUser) => {
    const email = (supabaseUser.email ?? "").toLowerCase();
    const emailPrefix = email.split("@")[0] ?? "";
    const isAdmin = ADMIN_GOOGLE_EMAILS.includes(email);

    if (!email) {
      throw new Error("Google account email is required.");
    }

    if (isAdmin) {
      const displayName =
        (typeof supabaseUser.user_metadata?.name === "string" && supabaseUser.user_metadata.name.trim()) ||
        (typeof supabaseUser.user_metadata?.full_name === "string" && supabaseUser.user_metadata.full_name.trim()) ||
        emailPrefix ||
        "Admin";

      const { error: adminUpsertError } = await supabase.from("user_profiles").upsert({
        id: supabaseUser.id,
        email,
        role: "admin",
        name: displayName,
        class: null,
        board: null,
      });

      if (adminUpsertError) {
        throw adminUpsertError;
      }

      setUser({
        id: supabaseUser.id,
        role: "admin",
        name: displayName,
        email,
        loginTime: new Date().toISOString(),
      });
      return;
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, username, class, board")
      .or(`username.eq.${email},username.eq.${emailPrefix}`)
      .maybeSingle();

    if (studentError) {
      throw studentError;
    }

    if (!student) {
      throw new Error("This Google account is not authorized. Contact admin after admission.");

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

  const upsertProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("role, name, class, board")
      .eq("id", supabaseUser.id)
      .maybeSingle();

    const { error: studentUpsertError } = await supabase.from("user_profiles").upsert({
      id: supabaseUser.id,
      email,
      role: "user",
      name: student.username,
      class: student.class,
      board: student.board,
    });

    if (studentUpsertError) {
      throw studentUpsertError;
    }

    setUser({
      id: student.id,
      role: "user",
      name: student.username,
      email,
      class: student.class,
      board: student.board,
      loginTime: new Date().toISOString(),
    });
    if (existingProfile) {
      const hydratedUser: User = {
        id: supabaseUser.id,
        role: existingProfile.role,
        name: existingProfile.name,
        email: supabaseUser.email ?? "",
        class: existingProfile.class ?? undefined,
        board: existingProfile.board ?? undefined,
        loginTime: new Date().toISOString(),
      };
      setUser(hydratedUser);
      return;
    }

    const pendingProfile = getPendingProfile();
    const metadata = supabaseUser.user_metadata ?? {};

    const role =
      metadata.role === "admin" || metadata.role === "user"
        ? metadata.role
        : pendingProfile?.role ?? "user";

    const name =
      (typeof metadata.name === "string" && metadata.name.trim()) ||
      (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
      pendingProfile?.name ||
      supabaseUser.email?.split("@")[0] ||
      "User";

    const className =
      (typeof metadata.class === "string" && metadata.class.trim()) ||
      pendingProfile?.class ||
      null;

    const board =
      (typeof metadata.board === "string" && metadata.board.trim()) ||
      pendingProfile?.board ||
      null;

    const { error: upsertError } = await supabase.from("user_profiles").upsert({
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
      role,
      name,
      class: className,
      board,
    });

    if (upsertError) {
      throw upsertError;
    }

    clearPendingProfile();

    const hydratedUser: User = {
      id: supabaseUser.id,
      role,
      name,
      email: supabaseUser.email ?? "",
      class: className ?? undefined,
      board: board ?? undefined,
      loginTime: new Date().toISOString(),
    };

    setUser(hydratedUser);
  }, []);

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        await hydrateGoogleUser(data.session.user);
      } catch (error) {
        await supabase.auth.signOut();
        setUser(null);
        setAuthError(error instanceof Error ? error.message : "Google authentication failed.");
      } finally {
        setLoading(false);
      }
      await upsertProfile(data.session.user);
      setLoading(false);
    };

    syncSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        await hydrateGoogleUser(session.user);
      } catch (error) {
        await supabase.auth.signOut();
        setUser(null);
        setAuthError(error instanceof Error ? error.message : "Google authentication failed.");
      } finally {
        setLoading(false);
      }
    });
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        await upsertProfile(session.user);
        setLoading(false);
      },
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [hydrateGoogleUser]);

  const loginWithGoogle = async () => {
    setAuthError(null);
  }, [upsertProfile]);

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  };

  const registerWithEmail = async ({
    email,
    password,
    role,
    name,
    className,
    board,
  }: RegisterPayload) => {
    localStorage.setItem(
      PENDING_PROFILE_KEY,
      JSON.stringify({ role, name, class: className, board }),
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          name,
          class: className,
          board,
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
        class: className ?? null,
        board: board ?? null,
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
        redirectTo: OAUTH_REDIRECT_URL,
        redirectTo: `${window.location.origin}/app`,
      },
    });

    if (error) {
      clearPendingProfile();
      throw error;
    }
  };

  const clearAuthError = () => setAuthError(null);

  const logout = async () => {
    await supabase.auth.signOut();
  const logout = async () => {
    await supabase.auth.signOut();
    clearPendingProfile();
    setUser(null);
    setAuthError(null);
  };

  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";
  const isLoggedIn = !!user;

  return {
    user,
    loading,
    authError,
    clearAuthError,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    isAdmin,
    isUser,
    isLoggedIn,
  };
}
