"use client";

import { createContext, useContext, useRef, useState } from "react";
import { ImageUp, FolderOpen, Link2 } from "lucide-react";
import { encodeImage, formatBytes, type MediaFolder, type PendingMedia } from "@/lib/admin/media";

/**
 * Media plumbing for the editor.
 *
 * An image field cannot own its upload, because an upload is not local to the
 * field: the bytes have to travel with the save, alongside every other field's
 * bytes, in one commit. So the field reports the encoded file upward through
 * this context and takes back only a path. The panel holds the queue.
 */
type MediaApi = {
  /** Registers encoded bytes for the next save and returns nothing — the
   *  field sets its own value from `publicPath`. */
  add: (item: PendingMedia) => void;
  /** Object URL for an image uploaded this session, so the thumbnail shows
   *  the real picture rather than a 404 at a path the deploy has not built
   *  yet. Outlives the save on purpose — the committed file does not appear
   *  on the live site until Vercel finishes rebuilding. */
  previewFor: (publicPath: string) => string | undefined;
  /** Whether the file is still waiting to be published, which is what the
   *  badge reports. Distinct from having a preview: after a save the preview
   *  survives but the badge should not. */
  isQueued: (publicPath: string) => boolean;
  /** Everything already in /public, for reusing an image without re-uploading. */
  library: string[];
};

const MediaContext = createContext<MediaApi | null>(null);

export const MediaProvider = MediaContext.Provider;

function useMedia(): MediaApi {
  const api = useContext(MediaContext);
  if (!api) throw new Error("ImageField must be rendered inside a MediaProvider");
  return api;
}

export default function ImageField({
  label,
  value,
  onChange,
  folder,
  basename,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  folder: MediaFolder;
  /** Seeds the committed filename, so files land as `hishabai-a1b2.webp`
   *  rather than `IMG_4127.webp`. */
  basename: string;
  hint?: string;
}) {
  const media = useMedia();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"none" | "library" | "url">("none");

  const preview = media.previewFor(value) ?? value;
  const queued = media.isQueued(value);

  async function onPick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const item = await encodeImage(file, folder, basename);
      media.add(item);
      onChange(item.publicPath);
      setMode("none");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read that image.");
    } finally {
      setBusy(false);
      // Cleared so re-picking the same file fires change again.
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="ad-field">
      <span className="ad-label">{label}</span>

      <div className="ad-thumb">
        {preview ? (
          /* Deliberately a plain img, not next/image: the source is a blob
             URL for a queued file, or an arbitrary path mid-edit, and the
             optimiser handles neither. */
          <img src={preview} alt="" />
        ) : (
          <span className="ad-thumb-empty">No image</span>
        )}
        {queued ? <span className="ad-badge">New · unpublished</span> : null}
      </div>

      <div className="ad-list-row flex-wrap">
        <button
          type="button"
          className="ad-btn ad-btn-ghost"
          onClick={() => input.current?.click()}
          disabled={busy}
        >
          <ImageUp size={13} /> {busy ? "Processing…" : "Upload"}
        </button>
        <button
          type="button"
          className="ad-btn ad-btn-ghost"
          onClick={() => setMode(mode === "library" ? "none" : "library")}
        >
          <FolderOpen size={13} /> Existing
        </button>
        <button
          type="button"
          className="ad-btn ad-btn-ghost"
          onClick={() => setMode(mode === "url" ? "none" : "url")}
        >
          <Link2 size={13} /> Path
        </button>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />

      {mode === "url" ? (
        <input
          className="ad-input"
          value={value}
          placeholder="/work/example.jpg"
          onChange={(e) => onChange(e.target.value)}
        />
      ) : null}

      {mode === "library" ? (
        <div className="ad-media-grid">
          {media.library.map((path) => (
            <button
              key={path}
              type="button"
              className="ad-media-pick"
              title={path}
              onClick={() => {
                onChange(path);
                setMode("none");
              }}
            >
              <img src={path} alt="" />
            </button>
          ))}
          {media.library.length === 0 ? <span className="ad-hint">Nothing in /public yet.</span> : null}
        </div>
      ) : null}

      {error ? <p className="ad-error">{error}</p> : null}
      {hint ? <span className="ad-hint">{hint}</span> : null}
      <span className="ad-hint">{value || "unset"}</span>
    </div>
  );
}

export { formatBytes };
