import { env } from "../../../../config/env.js";
import { storeLocalImage } from "../../../../infra/media/storeLocalImage.js";
import { isR2Configured, storeShopImageInR2 } from "../../../../infra/media/storeR2Object.js";
import { publicUrlForStorageKey } from "../../../../infra/media/publicMediaUrl.js";
import { ValidationError } from "../../../../domain/errors/ValidationError.js";

export function uploadShopImage({ shopsRepo }) {
  return async function execute(client, { shopId, file }) {
    if (!file) throw new ValidationError("Image is required");
    if (!file.buffer || !file.mimetype) throw new ValidationError("Invalid image");

    const media = isR2Configured()
      ? await storeShopImageInR2({
          buffer: file.buffer,
          mimeType: file.mimetype,
          shopId
        })
      : await storeLocalImage({
          buffer: file.buffer,
          mimeType: file.mimetype,
          uploadsDir: env.UPLOADS_DIR
        });

    await shopsRepo.upsertShopImage(client, { shopId, media });

    const publicUrl = publicUrlForStorageKey(media.storageKey);
    return {
      storageKey: media.storageKey,
      url: publicUrl || `/${media.storageKey}`,
      sha256: media.sha256,
      contentType: media.contentType,
      byteSize: media.byteSize
    };
  };
}

