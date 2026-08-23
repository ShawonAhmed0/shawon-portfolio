import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import "./admin.css";

export const metadata: Metadata = {
  title: "Content editor",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The gate. Every route under /admin passes through here, so the check cannot
 * be forgotten on a page added later.
 *
 * The API routes verify the session independently rather than trusting this:
 * a layout guards what is rendered, not what is callable, and /api/admin/save
 * is reachable without ever loading a page.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthed())) redirect("/login");
  return children;
}
