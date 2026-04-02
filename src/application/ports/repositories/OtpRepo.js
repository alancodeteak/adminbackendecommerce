export class OtpRepo {
  // eslint-disable-next-line no-unused-vars
  async getLatestUnusedOtpByEmailAndPurpose(_client, _email, _purpose) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async createOtp(_client, _params) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async markOtpUsed(_client, _otpId) {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async incrementOtpAttempts(_client, _otpId) {
    throw new Error("Not implemented");
  }
}

