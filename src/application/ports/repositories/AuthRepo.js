export class AuthRepo {
  // eslint-disable-next-line no-unused-vars
  async getStaffLoginContextByShopSlugAndEmail(_client, _params) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async getShopBySlug(_client, _slug) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async getUserByEmail(_client, _email) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async getActiveStaffRole(_client, _shopId, _userId) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async getActiveSuperadmin(_client, _userId) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async setSuperadminOtp(_client, _params) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async markSuperadminOtpUsed(_client, _userId) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async incrementSuperadminOtpAttempts(_client, _userId) {
    throw new Error("Not implemented");
  }
}

