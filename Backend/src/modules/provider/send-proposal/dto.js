// src/modules/provider/send-proposal/dto.js
export class SendProposalDto {
  constructor(data) {
    this.providerId = data.providerId;
    this.serviceRequestId = data.serviceRequestId;
    this.bidAmount = Number(data.bidAmount);
    this.deliveryTime = Number(data.deliveryTime);
    this.coverLetter = (data.coverLetter || "").toString();
    this.attachmentUrl = data.attachmentUrl;
    this.milestones = Array.isArray(data.milestones) ? data.milestones.map((m, i) => ({
      sequence: Number(m.sequence ?? i + 1),
      title: (m.title || "").toString().trim(),
      description: (m.description || "").toString(),
      amount: Number(m.amount),
      dueDate: m.dueDate ? new Date(m.dueDate).toISOString() : null,
    })) : [];
  }

  validate() {
    if (!this.providerId) throw new Error("Provider ID is required");
    if (!this.serviceRequestId) throw new Error("ServiceRequest ID is required");
    if (typeof this.serviceRequestId !== "string" || !this.isValidUUID(this.serviceRequestId)) {
      throw new Error("ServiceRequest ID must be a valid UUID string");
    }
    if (!this.bidAmount || this.bidAmount <= 0) throw new Error("Valid bid amount is required");
    if (!this.deliveryTime || this.deliveryTime <= 0) throw new Error("Valid delivery time is required");
    if (!this.coverLetter || this.coverLetter.trim() === "") throw new Error("Cover letter is required");

    if (this.milestones.length > 0) {
      // Tolerance ±2% or 1 unit, whichever is larger
      const total = this.milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0);
      const tolerance = Math.max(this.bidAmount * 0.02, 1); // adjust if you prefer
      if (Math.abs(total - this.bidAmount) > tolerance) {
        throw new Error("Total milestone amount must approximately match bid amount");
      }
      let prev = 0;
      for (const m of this.milestones) {
        if (!m.title || !m.amount) throw new Error("Each milestone must have title and amount");
        if (m.sequence <= prev) throw new Error("Milestones must have increasing sequence numbers starting at 1");
        prev = m.sequence;
      }
    }
  }
  // ...


  

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
    this.serviceRequestId = data.serviceRequestId; // NEW
  }
  validate() {
    if (!this.providerId) throw new Error("Provider ID is required");
  }
}
