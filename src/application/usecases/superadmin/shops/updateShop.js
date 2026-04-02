import { NotFoundError } from "../../../../domain/errors/NotFoundError.js";

export function updateShop({ shopsRepo }) {
  return async function execute(client, { id, patch }) {
    const row = await shopsRepo.getById(client, id);
    if (!row) throw new NotFoundError("Shop not found");

    const toRepo = { ...patch };
    if (patch.address !== undefined) {
      const base =
        row.address_row_id != null
          ? {
              line1: row.line1,
              line2: row.line2,
              landmark: row.landmark,
              city: row.city,
              state: row.state,
              postal_code: row.postal_code,
              country: row.country,
              lat: row.lat,
              lng: row.lng,
              raw: row.address_raw
            }
          : {};
      toRepo.address = { ...base, ...patch.address };
    }

    const updated = await shopsRepo.updateShop(client, id, toRepo);
    if (!updated) throw new NotFoundError("Shop not found");
    return updated;
  };
}
