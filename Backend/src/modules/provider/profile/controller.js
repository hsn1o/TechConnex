import ProviderProfileService from "./service.js";
import { ProviderProfileDto } from "./dto.js";

class ProviderProfileController {
  // GET /api/provider/profile - Get provider profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profile = await ProviderProfileService.getProfile(userId);
      
      res.json({
        success: true,
        message: "Provider profile retrieved successfully",
        data: profile,
      });
    } catch (error) {
      console.error("Error in getProfile:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // POST /api/provider/profile - Create provider profile
  static async createProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profileData = req.body;
      
      const profile = await ProviderProfileService.createProfile(userId, profileData);
      
      res.json({
        success: true,
        message: "Provider profile created successfully",
        data: profile,
      });
    } catch (error) {
      console.error("Error in createProfile:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // PUT /api/provider/profile - Update provider profile
  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profileData = req.body;
      
      const profile = await ProviderProfileService.updateProfile(userId, profileData);
      
      res.json({
        success: true,
        message: "Provider profile updated successfully",
        data: profile,
      });
    } catch (error) {
      console.error("Error in updateProfile:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // PATCH /api/provider/profile - Upsert provider profile
  static async upsertProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profileData = req.body;
      
      const profile = await ProviderProfileService.upsertProfile(userId, profileData);
      
      res.json({
        success: true,
        message: "Provider profile saved successfully",
        data: profile,
      });
    } catch (error) {
      console.error("Error in upsertProfile:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/provider/profile/stats - Get profile statistics
  static async getProfileStats(req, res) {
    try {
      const userId = req.user.userId;
      const stats = await ProviderProfileService.getProfileStats(userId);
      
      res.json({
        success: true,
        message: "Provider profile stats retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Error in getProfileStats:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/provider/profile/completion - Get profile completion
  static async getProfileCompletion(req, res) {
    try {
      const userId = req.user.userId;
      const completion = await ProviderProfileService.getProfileCompletion(userId);
      
      res.json({
        success: true,
        message: "Provider profile completion retrieved successfully",
        data: completion,
      });
    } catch (error) {
      console.error("Error in getProfileCompletion:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default ProviderProfileController;