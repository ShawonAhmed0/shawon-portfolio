"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  isConfigured,
  startSession,
  throttleCheck,
  throttleFail,
  throttleReset,
  verifyPassword,
} from "@/lib/admin/auth";

export type LoginState = { error: string | null };

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isConfigured()) {
    return {
      error:
        "No ADMIN_PASSWORD is set on this deployment, so there is nothing to sign in to yet.",
    };
  }

  const head = await headers();
  // First hop only. The rest of an X-Forwarded-For chain is client-supplied
  // and would let one caller mint unlimited throttle buckets.
  const ip = (head.get("x-forwarded-for") ?? "local").split(",")[0].trim();

  const waitSeconds = throttleCheck(ip);
  if (waitSeconds > 0) {
    return { error: `Too many attempts. Try again in ${waitSeconds}s.` };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || !verifyPassword(password)) {
    throttleFail(ip);
    // Deliberately the same message whether or not a password was supplied:
    // nothing here should confirm what a correct attempt looks like.
    return { error: "Incorrect password." };
  }

  throttleReset(ip);
  await startSession();

  // Outside the try/catch-free path on purpose: redirect() signals by
  // throwing, so it must be the last thing this function does.
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const { endSession } = await import("@/lib/admin/auth");
  await endSession();
  redirect("/login");
}
