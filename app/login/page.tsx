import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import LoginForm from "@/components/admin/LoginForm";
import Wordmark from "@/components/Wordmark";
import "@/app/admin/admin.css";

/**
 * Unlinked by design. Nothing on the site points here — no nav item, no
 * footer link — so the URL itself is the first factor and the password the
 * second. That is why the robots directives below matter more than usual:
 * an indexed /login would undo the only thing keeping it quiet.
 */
export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false, nocache: true },
};

export default async function LoginPage() {
  // Already signed in: skip the form rather than asking for a password that
  // would only mint the session that is already in the cookie jar.
  if (await isAuthed()) redirect("/admin");

  return (
    <main className="ad-gate">
      <div className="ad-gate-card">
        <Wordmark className="text-[1.35rem]" />
        <p className="ad-gate-note">Content editor</p>
        <LoginForm />
      </div>
    </main>
  );
}
