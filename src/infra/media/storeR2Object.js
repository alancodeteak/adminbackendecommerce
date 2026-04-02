import crypto from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../../config/env.js";

function extFromMime(mime) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

let client;

function getClient() {
  if (client) return client;
  client = new S3Client({
    region: env.OBJECT_STORAGE_REGION || "auto",
    endpoint: env.OBJECT_STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: env.OBJECT_STORAGE_ACCESS_KEY_ID,
      secretAccessKey: env.OBJECT_STORAGE_SECRET_ACCESS_KEY
    }
  });
  return client;
}

export function isR2Configured() {
  return Boolean(
    env.OBJECT_STORAGE_BUCKET?.trim() &&
      env.OBJECT_STORAGE_ENDPOINT?.trim() &&
      env.OBJECT_STORAGE_ACCESS_KEY_ID?.trim() &&
      env.OBJECT_STORAGE_SECRET_ACCESS_KEY?.trim()
  );
}

/**
 * @param {{ buffer: Buffer, mimeType: string, shopId: string }} opts
 */
export async function storeShopImageInR2({ buffer, mimeType, shopId }) {
  const ext = extFromMime(mimeType);
  if (!ext) throw new Error("Unsupported image type");

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const storageKey = `shops/${shopId}/${sha256}.${ext}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: env.OBJECT_STORAGE_BUCKET,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
      // R2 dev domain / public bucket: objects readable without ACL when bucket is public
      CacheControl: "public, max-age=31536000, immutable"
    })
  );

  return {
    sha256,
    storageKey,
    byteSize: buffer.length,
    contentType: mimeType
  };
}
