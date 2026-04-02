import { ValidationError } from "../../../domain/errors/ValidationError.js";
import { uploadSingleImage, isMulterFileTooLarge } from "../../../infra/http/uploads.js";

export function uploadImage(req, res, next) {
  uploadSingleImage(req, res, (err) => {
    if (!err) return next();
    if (isMulterFileTooLarge(err)) return next(new ValidationError("Image must be <= 5MB"));
    return next(new ValidationError(err.message || "Invalid image upload", err));
  });
}

