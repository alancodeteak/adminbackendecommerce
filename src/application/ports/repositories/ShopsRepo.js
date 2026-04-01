/**
 * @typedef {Object} ListShopsParams
 * @property {string=} q
 * @property {"active"|"blocked"|"deleted"=} status
 * @property {boolean=} isActive
 * @property {number} limit
 * @property {number} offset
 */

/**
 * @typedef {Object} ShopRow
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string|null} custom_domain
 * @property {boolean} is_active
 * @property {"active"|"blocked"|"deleted"} status
 * @property {string} created_at
 * @property {string} updated_at
 */

export class ShopsRepo {
  /**
   * @param {import("pg").PoolClient} _client
   * @param {ListShopsParams} _params
   * @returns {Promise<ShopRow[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async list(_client, _params) {
    throw new Error("Not implemented");
  }

  /**
   * @param {import("pg").PoolClient} _client
   * @param {string} _id
   * @returns {Promise<ShopRow|null>}
   */
  // eslint-disable-next-line no-unused-vars
  async getById(_client, _id) {
    throw new Error("Not implemented");
  }
}

