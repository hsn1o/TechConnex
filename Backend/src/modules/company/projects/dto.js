// src/modules/company/projects/dto.js

// Add near the top helper
const ensureStringArray = (v) => {
  if (v == null) return undefined;
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    // allow newline/comma separated fallbacks
    return v
      .split(/\r?\n|,/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  throw new Error("Requirements/Deliverables must be an array of strings or newline-separated text");
};


export class CreateProjectDto {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.category = this.mapCategory(data.category);
    this.budgetMin = data.budgetMin;
    this.budgetMax = data.budgetMax;
    this.skills = data.skills || [];
    this.timeline = data.timeline;
    this.priority = data.priority;
    this.ndaSigned = data.ndaSigned || false;
    this.requirements = ensureStringArray(data.requirements);   // <— changed
    this.deliverables = ensureStringArray(data.deliverables);   // <— changed
    this.customerId = data.customerId;
  }

  mapCategory(category) {
    const categoryMap = {
      "Mobile Development": "MOBILE_APP_DEVELOPMENT",
      "Web Development": "WEB_DEVELOPMENT",
      "Cloud Services": "CLOUD_SERVICES",
      "IoT Solutions": "IOT_SOLUTIONS",
      "Data Analytics": "DATA_ANALYTICS",
      "Cybersecurity": "CYBERSECURITY",
      "UI/UX Design": "UI_UX_DESIGN",
      "DevOps": "DEVOPS",
      "AI/ML Solutions": "AI_ML_SOLUTIONS",
      "System Integration": "SYSTEM_INTEGRATION",
    };
    
    return categoryMap[category] || category;
  }

validate() {
    // existing checks...
    if (!this.title || this.title.trim() === "") throw new Error("Title is required");
    if (!this.description || this.description.trim() === "") throw new Error("Description is required");
    if (!this.category || this.category.trim() === "") throw new Error("Category is required");
    if (!this.budgetMin || !this.budgetMax) throw new Error("Budget range is required");
    if (this.budgetMin >= this.budgetMax) throw new Error("Minimum budget must be less than maximum budget");
    if (!this.customerId) throw new Error("Customer ID is required");

    if (this.requirements && !Array.isArray(this.requirements)) {
      throw new Error("Requirements must be an array of strings");
    }
    if (this.deliverables && !Array.isArray(this.deliverables)) {
      throw new Error("Deliverables must be an array of strings");
    }
  }
}

export class GetProjectsDto {
  constructor(data) {
    this.customerId = data.customerId;
    this.page = parseInt(data.page) || 1;
    this.limit = parseInt(data.limit) || 10;
    this.status = data.status;
    this.category = data.category;
  }

  validate() {
    if (!this.customerId) {
      throw new Error("Customer ID is required");
    }
    
    // Validate status if provided
    if (this.status) {
      const validStatuses = [
        "OPEN", "CLOSED", // ServiceRequest statuses
        "IN_PROGRESS", "COMPLETED", "DISPUTED", "CANCELLED" // Project statuses
      ];
      if (!validStatuses.includes(this.status)) {
        throw new Error("Invalid status filter");
      }
    }
    
    // Validate pagination
    if (this.page < 1) {
      throw new Error("Page must be greater than 0");
    }
    if (this.limit < 1 || this.limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }
  }
}

// src/modules/company/projects/dto.js
const toStringArray = (v) => {
  if (v == null) return undefined;
  if (Array.isArray(v)) return v.map(String).map(s=>s.trim()).filter(Boolean);
  if (typeof v === "string") return v.split(/\r?\n|,/).map(s=>s.trim()).filter(Boolean);
  throw new Error("requirements/deliverables must be array or newline-separated string");
};

export class UpdateProjectDto {
  constructor(data) {
    this.customerId   = data.customerId;
    this.title        = data.title;
    this.description  = data.description;
    this.category     = data.category;
    this.budgetMin    = data.budgetMin;
    this.budgetMax    = data.budgetMax;
    this.timeline     = data.timeline;
    this.priority     = data.priority;
    this.skills       = Array.isArray(data.skills) ? data.skills : undefined;
    this.ndaSigned    = typeof data.ndaSigned === "boolean" ? data.ndaSigned : undefined;
    this.requirements = toStringArray(data.requirements);
    this.deliverables = toStringArray(data.deliverables);
  }
  validatePartial() {
    if (!this.customerId) throw new Error("Unauthorized");
    if (this.budgetMin != null && this.budgetMax != null && Number(this.budgetMin) >= Number(this.budgetMax)) {
      throw new Error("Minimum budget must be less than maximum budget");
    }
  }
}
