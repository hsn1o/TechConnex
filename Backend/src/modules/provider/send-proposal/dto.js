// src/modules/provider/send-proposal/dto.js
export class SendProposalDto {
  constructor(data) {
    this.providerId = data.providerId;
    this.requestId = data.requestId;
    this.bidAmount = data.bidAmount;
    this.deliveryTime = data.deliveryTime;
    this.coverLetter = data.coverLetter;
    this.attachmentUrl = data.attachmentUrl;
    this.milestones = data.milestones || []; // Store for later use when proposal is accepted
  }

  validate() {
    if (!this.providerId) {
      throw new Error("Provider ID is required");
    }
    if (!this.requestId) {
      throw new Error("Request ID is required");
    }
    // Validate that requestId is a UUID string, not an integer
    if (typeof this.requestId !== 'string' || !this.isValidUUID(this.requestId)) {
      throw new Error("Request ID must be a valid UUID string");
    }
    if (!this.bidAmount || this.bidAmount <= 0) {
      throw new Error("Valid bid amount is required");
    }
    if (!this.deliveryTime || this.deliveryTime <= 0) {
      throw new Error("Valid delivery time is required");
    }
    if (!this.coverLetter) {
      throw new Error("Cover letter is required");
    }
  }

  isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}

export class GetProposalsDto {
  constructor(data) {
    this.providerId = data.providerId;
    this.page = parseInt(data.page) || 1;
    this.limit = parseInt(data.limit) || 10;
    this.status = data.status;
  }

  validate() {
    if (!this.providerId) {
      throw new Error("Provider ID is required");
    }
  }
}