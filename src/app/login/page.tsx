import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getCurrentUser } from "@/lib/auth";
import { getAdminUserId } from "@/lib/env";

export const metadata = {
  title: "Admin sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const adminId = getAdminUserId();
  if (user && adminId && user.id === adminId) {
    redirect(params.next ?? "/admin");
  }

  return (
    <div className="max-w-sm mx-auto py-10">
      <h1 className="font-[family-name:var(--font-display)] text-3xl mb-2 text-center">
        Welcome back, char.
      </h1>
      <p className="text-sm text-[var(--color-ink-soft)] text-center mb-6">
        Sign in to manage recipes.
      </p>
      <LoginForm next={params.next} initialError={params.error} />
    </div>
  );
}
