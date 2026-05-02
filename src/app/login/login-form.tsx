"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({
  next,
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    initialError ? { error: initialError } : undefined,
  );

  return (
    <form
      action={formAction}
      className="space-y-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6"
    >
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <label className="block text-sm">
        <span className="block mb-1 text-[var(--color-ink-soft)]">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
        />
      </label>
      <label className="block text-sm">
        <span className="block mb-1 text-[var(--color-ink-soft)]">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
        />
      </label>
      {state?.error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--color-accent)] text-white py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
