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
    .split(/[;,]/)
    .map((email) => email.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "").toLowerCase())
    .filter(Boolean);
};

const ADMIN_GOOGLE_EMAILS = parseAdminEmails();

const OAUTH_REDIRECT_URL =
  (import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined)?.trim() ||
  `${window.location.origin}/app`;

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
      throw new Error(`Signed in as ${email}, but this account is not mapped as admin and no admitted student record was found. Contact admin.`);
    }

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
      id: supabaseUser.id,
      role: "user",
      name: student.username,
      email,
      class: student.class,
      board: student.board,
      loginTime: new Date().toISOString(),
    });
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

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [hydrateGoogleUser]);

  const loginWithGoogle = async () => {
    setAuthError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: OAUTH_REDIRECT_URL,
      },
    });

    if (error) {
      throw error;
    }
  };

  const clearAuthError = () => setAuthError(null);

  const logout = async () => {
    await supabase.auth.signOut();
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
    loginWithGoogle,
    logout,
    isAdmin,
    isUser,
    isLoggedIn,
  };
}
