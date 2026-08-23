/**
 * Client-side image preparation.
 *
 * Resizing and re-encoding happen in the browser, before anything is sent.
 * Three reasons: a phone camera JPEG is several megabytes and would not
 * survive the serverless request limit; the server would otherwise need an
 * image library, which is a dependency this project does not carry; and the
 * bytes that reach the repository are then the same bytes the site serves,
 * so what is committed is already optimised.
 *
 * WebP at this size lands around 120–260KB for a screenshot, against 1–4MB
 * for the original.
 */

/** Long edge cap. The widest slot the site renders an image into is roughly
 *  760 CSS px, so 1600 still covers a 2x display with room to spare. */
export const MAX_EDGE = 1600;

const QUALITY = 0.82;

/**
 * Ceiling for one save's worth of images, measured in encoded bytes.
 *
 * Vercel caps a serverless request body at 4.5MB and base64 inflates by a
 * third, so 3MB of image is about 4MB on the wire — under the limit with
 * headroom for the JSON travelling alongside it.
 */
export const MAX_UPLOAD_BYTES = 3_000_000;

export type PendingMedia = {
  /** Repository path, e.g. `public/work/hishabai-a1b2c3.webp`. */
  path: string;
  base64: string;
  bytes: number;
  /** Object URL for the thumbnail. Revoked by the caller when replaced. */
  preview: string;
  /** The site-absolute URL this becomes once committed. */
  publicPath: string;
};

export type MediaFolder = "work" | "reel" | "me";

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "image"
  );
}

/** Chunked because `String.fromCharCode(...bytes)` on a 200KB array blows the
 *  argument limit and throws a RangeError. */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

async function shortHash(bytes: Uint8Array): Promise<string> {
  // Copied into a fresh buffer: subtle.digest wants an ArrayBuffer, and a
  // subarray view would hand it the whole backing store.
  const copy = new Uint8Array(bytes);
  const digest = await crypto.subtle.digest("SHA-256", copy.buffer as ArrayBuffer);
  return Array.from(new Uint8Array(digest).subarray(0, 4))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function encodeImage(
  file: File,
  folder: MediaFolder,
  basename: string,
): Promise<PendingMedia> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`${file.name} is not an image.`);
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get a 2D canvas to resize the image.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY),
  );
  if (!blob) throw new Error("The browser could not encode that image.");

  // A browser without WebP encoding silently hands back a PNG. Following the
  // real type keeps the extension honest rather than writing PNG bytes into
  // a .webp the server would then serve with the wrong content type.
  const ext = blob.type === "image/webp" ? "webp" : "png";

  const bytes = new Uint8Array(await blob.arrayBuffer());
  const hash = await shortHash(bytes);
  const name = `${slugify(basename)}-${hash}.${ext}`;

  return {
    // The hash is in the filename so a replacement lands at a new URL. Reusing
    // the old name would leave every browser and CDN that already cached it
    // serving the previous picture.
    path: `public/${folder}/${name}`,
    publicPath: `/${folder}/${name}`,
    base64: toBase64(bytes),
    bytes: bytes.length,
    preview: URL.createObjectURL(blob),
  };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
