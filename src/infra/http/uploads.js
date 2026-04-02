import multer from "multer";

/** Single source of truth for shop (and other) image uploads via this multer instance. */
export const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_IMAGE_UPLOAD_LABEL = "8MB";

function fileFilter(_req, file, cb) {
  const ok = file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/webp";
  if (!ok) return cb(new Error("Only jpeg, png, webp images are allowed"));
  return cb(null, true);
}

export const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_UPLOAD_BYTES, files: 1 },
  fileFilter
}).single("image");

export function isMulterFileTooLarge(err) {
  return err?.code === "LIMIT_FILE_SIZE";
}

/** User-facing validation copy (middleware / API errors). */
export function imageFileTooLargeMessage() {
  return `Image file is too large. Maximum size is ${MAX_IMAGE_UPLOAD_LABEL}.`;
}

