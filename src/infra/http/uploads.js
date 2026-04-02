import multer from "multer";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function fileFilter(_req, file, cb) {
  const ok = file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/webp";
  if (!ok) return cb(new Error("Only jpeg, png, webp images are allowed"));
  return cb(null, true);
}

export const uploadSingleImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter
}).single("image");

export function isMulterFileTooLarge(err) {
  return err?.code === "LIMIT_FILE_SIZE";
}

