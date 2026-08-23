import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin/auth";
import { saveBundle, type MediaUpload } from "@/lib/admin/store";
import { ValidationError } from "@/lib/admin/schema";
import { GitHubError } from "@/lib/admin/github";

/**
 * The only write endpoint.
 *
 * Guarded on its own rather than relying on the /admin layout: this is
 * reachable directly, and a layout only decides what renders.
 */
export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
  }

  let payload: { bundle?: unknown; media?: MediaUpload[] };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const media = Array.isArray(payload.media) ? payload.media : [];

  try {
    const result = await saveBundle(
      payload.bundle,
      media,
      buildMessage(media.length),
    );
    return NextResponse.json({ ok: true, ...result });
  } catch (cause) {
    if (cause instanceof ValidationError) {
      // 422, not 500: the request was understood and refused. The field paths
      // travel back so the panel can list exactly what to fix.
      return NextResponse.json(
        { ok: false, error: "Some fields need fixing before this can publish.", issues: cause.issues },
        { status: 422 },
      );
    }

    if (cause instanceof GitHubError) {
      const conflict = cause.message.includes("422");
      return NextResponse.json(
        {
          ok: false,
          error: conflict
            ? "The repository moved since this page loaded — someone pushed in the meantime. Reload and redo the edit."
            : cause.message,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { ok: false, error: cause instanceof Error ? cause.message : "Save failed." },
      { status: 500 },
    );
  }
}

function buildMessage(imageCount: number): string {
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const images = imageCount > 0 ? `, ${imageCount} image${imageCount === 1 ? "" : "s"}` : "";
  return `Update site content via editor (${stamp} UTC${images})`;
}
