/**
 * @typedef {Object} ListProductsParams
 * @property {string=} status
 * @property {string=} categoryId
 * @property {string=} q
 * @property {number} limit
 * @property {number} offset
 */

/**
 * @typedef {Object} ProductRow
 * @property {string} id
 * @property {string} shop_id
 * @property {string|null} category_id
 * @property {string} name
 * @property {string} slug
 * @property {string} base_unit
 * @property {string} status
 * @property {string} price_minor_per_unit
 * @property {string} created_at
 * @property {string} updated_at
 */

export class ProductsRepo {
  /**
   * @param {import("pg").PoolClient} _client
   * @param {ListProductsParams} _params
   * @returns {Promise<ProductRow[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async list(_client, _params) {
    throw new Error("Not implemented");
  }
}

