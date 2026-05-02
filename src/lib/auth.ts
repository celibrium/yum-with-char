import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminUserId } from "@/lib/env";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  const adminId = getAdminUserId();
  return Boolean(user && adminId && user.id === adminId);
}

/**
 * Use at the top of any server action or RSC that performs writes.
 * Redirects to /login when no session, or to / when the user is not
 * the configured admin. RLS still enforces this at the database level.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminId = getAdminUserId();
  if (!adminId || user.id !== adminId) redirect("/");

  return { user, supabase };
}
