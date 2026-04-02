import { ValidationError } from "../../../domain/errors/ValidationError.js";
import {
  uploadSingleImage,
  isMulterFileTooLarge,
  imageFileTooLargeMessage
} from "../../../infra/http/uploads.js";

export function uploadImage(req, res, next) {
  uploadSingleImage(req, res, (err) => {
    if (!err) return next();
    if (isMulterFileTooLarge(err)) return next(new ValidationError(imageFileTooLargeMessage()));
    return next(new ValidationError(err.message || "Invalid image upload", err));
  });
}

