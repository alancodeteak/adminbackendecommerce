import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

function extFromMime(mime) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

export async function storeLocalImage({ buffer, mimeType, uploadsDir }) {
  const ext = extFromMime(mimeType);
  if (!ext) throw new Error("Unsupported image type");

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const filename = `${sha256}.${ext}`;
  await fs.mkdir(uploadsDir, { recursive: true });
  const absolutePath = path.join(uploadsDir, filename);

  // Write if missing; if exists, keep it (dedup by sha).
  try {
    await fs.writeFile(absolutePath, buffer, { flag: "wx" });
  } catch (err) {
    if (err?.code !== "EEXIST") throw err;
  }

  return {
    sha256,
    storageKey: `uploads/${filename}`,
    byteSize: buffer.length,
    contentType: mimeType
  };
}

