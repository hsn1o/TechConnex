import CompanyProfileService from "./service.js";

// Get company profile
async function getProfile(req, res) {
  try {
    const userId = req.user.userId;
    const profile = await CompanyProfileService.getProfile(userId);
    
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

// Create company profile
async function createProfile(req, res) {
  try {
    const userId = req.user.userId;
    const profileData = req.body;
    
    const profile = await CompanyProfileService.createProfile(userId, profileData);
    
    res.status(201).json({
      success: true,
      message: "Company profile created successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Create profile error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Update company profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const updateData = req.body;
    
    const profile = await CompanyProfileService.updateProfile(userId, updateData);
    
    res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Create or update company profile (upsert)
async function upsertProfile(req, res) {
  try {
    const userId = req.user.userId;
    const profileData = req.body;
    
    const profile = await CompanyProfileService.upsertProfile(userId, profileData);
    
    res.status(200).json({
      success: true,
      message: "Company profile saved successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Upsert profile error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Get profile completion percentage
async function getProfileCompletion(req, res) {
  try {
    const userId = req.user.userId;
    const completion = await CompanyProfileService.getProfileCompletion(userId);
    
    res.status(200).json({
      success: true,
      data: completion,
    });
  } catch (error) {
    console.error("Get profile completion error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Get all company profiles (admin or public)
async function getAllProfiles(req, res) {
  try {
    const filters = {
      industry: req.query.industry,
      location: req.query.location,
      companySize: req.query.companySize,
      hiringFrequency: req.query.hiringFrequency,
      limit: parseInt(req.query.limit) || 50,
      skip: parseInt(req.query.skip) || 0,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    const profiles = await CompanyProfileService.getAllProfiles(filters);
    
    res.status(200).json({
      success: true,
      data: profiles,
      count: profiles.length,
    });
  } catch (error) {
    console.error("Get all profiles error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Search company profiles
async function searchProfiles(req, res) {
  try {
    const { q: searchTerm } = req.query;
    const filters = {
      industry: req.query.industry,
      location: req.query.location,
      companySize: req.query.companySize,
      hiringFrequency: req.query.hiringFrequency,
      limit: parseInt(req.query.limit) || 50,
      skip: parseInt(req.query.skip) || 0,
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    const profiles = await CompanyProfileService.searchProfiles(searchTerm, filters);
    
    res.status(200).json({
      success: true,
      data: profiles,
      count: profiles.length,
      searchTerm,
    });
  } catch (error) {
    console.error("Search profiles error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Get profile statistics
async function getProfileStats(req, res) {
  try {
    const userId = req.user.userId;
    const stats = await CompanyProfileService.getProfileStats(userId);
    
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get profile stats error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Get public profile by ID
async function getPublicProfile(req, res) {
  try {
    const { id } = req.params;
    const profile = await CompanyProfileService.getPublicProfile(id);
    
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get public profile error:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

// Validate profile data
async function validateProfile(req, res) {
  try {
    const profileData = req.body;
    const isUpdate = req.query.update === 'true';
    
    const validatedData = CompanyProfileService.validateProfileData(profileData, isUpdate);
    
    res.status(200).json({
      success: true,
      message: "Profile data is valid",
      data: validatedData,
    });
  } catch (error) {
    console.error("Validate profile error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export {
  getProfile,
  createProfile,
  updateProfile,
  upsertProfile,
  getProfileCompletion,
  getAllProfiles,
  searchProfiles,
  getProfileStats,
  getPublicProfile,
  validateProfile,
};
