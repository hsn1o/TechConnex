// src/modules/company/projects/dto.js
export class CreateProjectDto {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.category = this.mapCategory(data.category);
    this.budgetMin = data.budgetMin;
    this.budgetMax = data.budgetMax;
    this.timeline = data.timeline;
    this.priority = data.priority;
    this.skills = data.skills || [];
    this.requirements = data.requirements;
    this.deliverables = data.deliverables;
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
    if (!this.title || this.title.trim() === "") {
      throw new Error("Title is required");
    }
    if (!this.description || this.description.trim() === "") {
      throw new Error("Description is required");
    }
    if (!this.category || this.category.trim() === "") {
      throw new Error("Category is required");
    }
    if (!this.budgetMin || !this.budgetMax) {
      throw new Error("Budget range is required");
    }
    if (this.budgetMin >= this.budgetMax) {
      throw new Error("Minimum budget must be less than maximum budget");
    }
    if (!this.customerId) {
      throw new Error("Customer ID is required");
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
  }
}