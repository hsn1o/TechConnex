class CompanyProfileDto {
  constructor(data) {
    this.description = data.description;
    this.industry = data.industry;
    this.location = data.location;
    this.website = data.website;
    this.logoUrl = data.logoUrl;
    this.socialLinks = data.socialLinks;
    this.languages = data.languages || [];
    this.companySize = data.companySize;
    this.employeeCount = data.employeeCount;
    this.establishedYear = data.establishedYear;
    this.annualRevenue = data.annualRevenue;
    this.fundingStage = data.fundingStage;
    this.preferredContractTypes = data.preferredContractTypes || [];
    this.averageBudgetRange = data.averageBudgetRange;
    this.remotePolicy = data.remotePolicy;
    this.hiringFrequency = data.hiringFrequency;
    this.categoriesHiringFor = data.categoriesHiringFor || [];
    this.mission = data.mission;
    this.values = data.values || [];
    this.benefits = data.benefits;
    this.mediaGallery = data.mediaGallery || [];
  }

  validate() {
    const errors = [];

    // Required fields validation
    if (!this.description || this.description.trim().length < 10) {
      errors.push("Description must be at least 10 characters long");
    }

    if (!this.industry) {
      errors.push("Industry is required");
    }

    if (!this.location) {
      errors.push("Location is required");
    }

    // Optional field validations
    if (this.website && !this.isValidUrl(this.website)) {
      errors.push("Website must be a valid URL");
    }

    if (this.logoUrl && !this.isValidUrl(this.logoUrl)) {
      errors.push("Logo URL must be a valid URL");
    }

    if (this.employeeCount && (this.employeeCount < 1 || this.employeeCount > 1000000)) {
      errors.push("Employee count must be between 1 and 1,000,000");
    }

    if (this.establishedYear && (this.establishedYear < 1800 || this.establishedYear > new Date().getFullYear())) {
      errors.push("Established year must be between 1800 and current year");
    }

    if (this.annualRevenue && this.annualRevenue < 0) {
      errors.push("Annual revenue cannot be negative");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return true;
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  toUpdateData() {
    return {
      description: this.description,
      industry: this.industry,
      location: this.location,
      website: this.website,
      logoUrl: this.logoUrl,
      socialLinks: this.socialLinks,
      languages: this.languages,
      companySize: this.companySize,
      employeeCount: this.employeeCount,
      establishedYear: this.establishedYear,
      annualRevenue: this.annualRevenue,
      fundingStage: this.fundingStage,
      preferredContractTypes: this.preferredContractTypes,
      averageBudgetRange: this.averageBudgetRange,
      remotePolicy: this.remotePolicy,
      hiringFrequency: this.hiringFrequency,
      categoriesHiringFor: this.categoriesHiringFor,
      mission: this.mission,
      values: this.values,
      benefits: this.benefits,
      mediaGallery: this.mediaGallery,
    };
  }
}

class CompanyProfileUpdateDto {
  constructor(data) {
    // Allow partial updates - only include fields that are provided
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        this[key] = data[key];
      }
    });
  }

  validate() {
    const errors = [];

    // Validate only provided fields
    if (this.description !== undefined && (!this.description || this.description.trim().length < 10)) {
      errors.push("Description must be at least 10 characters long");
    }

    if (this.website && !this.isValidUrl(this.website)) {
      errors.push("Website must be a valid URL");
    }

    if (this.logoUrl && !this.isValidUrl(this.logoUrl)) {
      errors.push("Logo URL must be a valid URL");
    }

    if (this.employeeCount !== undefined && (this.employeeCount < 1 || this.employeeCount > 1000000)) {
      errors.push("Employee count must be between 1 and 1,000,000");
    }

    if (this.establishedYear !== undefined && (this.establishedYear < 1800 || this.establishedYear > new Date().getFullYear())) {
      errors.push("Established year must be between 1800 and current year");
    }

    if (this.annualRevenue !== undefined && this.annualRevenue < 0) {
      errors.push("Annual revenue cannot be negative");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return true;
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  toUpdateData() {
    const updateData = {};
    Object.keys(this).forEach(key => {
      if (this[key] !== undefined && this[key] !== null) {
        updateData[key] = this[key];
      }
    });
    return updateData;
  }
}

class CompanyProfileResponseDto {
  constructor(profileData) {
    this.id = profileData.id;
    this.userId = profileData.userId;
    this.description = profileData.description;
    this.industry = profileData.industry;
    this.location = profileData.location;
    this.website = profileData.website;
    this.logoUrl = profileData.logoUrl;
    this.socialLinks = profileData.socialLinks;
    this.languages = profileData.languages || [];
    this.companySize = profileData.companySize;
    this.employeeCount = profileData.employeeCount;
    this.establishedYear = profileData.establishedYear;
    this.annualRevenue = profileData.annualRevenue;
    this.fundingStage = profileData.fundingStage;
    this.preferredContractTypes = profileData.preferredContractTypes || [];
    this.averageBudgetRange = profileData.averageBudgetRange;
    this.remotePolicy = profileData.remotePolicy;
    this.hiringFrequency = profileData.hiringFrequency;
    this.categoriesHiringFor = profileData.categoriesHiringFor || [];
    this.completion = profileData.completion;
    this.rating = profileData.rating;
    this.reviewCount = profileData.reviewCount;
    this.totalSpend = profileData.totalSpend;
    this.projectsPosted = profileData.projectsPosted;
    this.lastActiveAt = profileData.lastActiveAt;
    this.mission = profileData.mission;
    this.values = profileData.values || [];
    this.benefits = profileData.benefits;
    this.mediaGallery = profileData.mediaGallery || [];
    this.createdAt = profileData.createdAt;
    this.updatedAt = profileData.updatedAt;

    // Enhanced user data
    this.user = profileData.user ? {
      id: profileData.user.id,
      email: profileData.user.email,
      name: profileData.user.name,
      phone: profileData.user.phone,
      kycStatus: profileData.user.kycStatus,
      isVerified: profileData.user.isVerified,
      createdAt: profileData.user.createdAt,
      kycDocuments: profileData.user.KycDocument || [],
    } : null;

    // Additional stats if available
    this.stats = profileData.stats || null;
  }

  toResponse() {
    return {
      id: this.id,
      userId: this.userId,
      description: this.description,
      industry: this.industry,
      location: this.location,
      website: this.website,
      logoUrl: this.logoUrl,
      socialLinks: this.socialLinks,
      languages: this.languages,
      companySize: this.companySize,
      employeeCount: this.employeeCount,
      establishedYear: this.establishedYear,
      annualRevenue: this.annualRevenue,
      fundingStage: this.fundingStage,
      preferredContractTypes: this.preferredContractTypes,
      averageBudgetRange: this.averageBudgetRange,
      remotePolicy: this.remotePolicy,
      hiringFrequency: this.hiringFrequency,
      categoriesHiringFor: this.categoriesHiringFor,
      completion: this.completion,
      rating: this.rating,
      reviewCount: this.reviewCount,
      totalSpend: this.totalSpend,
      projectsPosted: this.projectsPosted,
      lastActiveAt: this.lastActiveAt,
      mission: this.mission,
      values: this.values,
      benefits: this.benefits,
      mediaGallery: this.mediaGallery,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      user: this.user,
      stats: this.stats,
    };
  }
}

class KycDocumentResponseDto {
  constructor(documentData) {
    this.id = documentData.id;
    this.type = documentData.type;
    this.fileUrl = documentData.fileUrl;
    this.filename = documentData.filename;
    this.mimeType = documentData.mimeType;
    this.status = documentData.status;
    this.reviewNotes = documentData.reviewNotes;
    this.reviewedBy = documentData.reviewedBy;
    this.uploadedAt = documentData.uploadedAt;
    this.reviewedAt = documentData.reviewedAt;
  }

  toResponse() {
    return {
      id: this.id,
      type: this.type,
      fileUrl: this.fileUrl,
      filename: this.filename,
      mimeType: this.mimeType,
      status: this.status,
      reviewNotes: this.reviewNotes,
      reviewedBy: this.reviewedBy,
      uploadedAt: this.uploadedAt,
      reviewedAt: this.reviewedAt,
    };
  }
}

export {
  CompanyProfileDto,
  CompanyProfileUpdateDto,
  CompanyProfileResponseDto,
  KycDocumentResponseDto,
};
