"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "@/app/login/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="ad-btn ad-btn-primary w-full" disabled={pending}>
      {pending ? "Checking…" : "Enter"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {
    error: null,
  });

  return (
    <form action={formAction} className="ad-stack">
      <label className="ad-field">
        <span className="ad-label">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          required
          className="ad-input"
        />
      </label>

      {/* aria-live so the failure is announced, not just repainted: this is
          the one message on the page and a screen reader user gets no other
          signal that the attempt was rejected. */}
      <p className="ad-error" role="status" aria-live="polite">
        {state.error ?? ""}
      </p>

      <Submit />
    </form>
  );
}
