import { disputeService } from "./service.js";

export const disputeController = {
  async getAllDisputes(req, res) {
    try {
      const { status, search } = req.query;
      const filters = { status, search };
      
      const disputes = await disputeService.getAllDisputes(filters);
      
      res.json({
        success: true,
        data: disputes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getDisputeById(req, res) {
    try {
      const { id } = req.params;
      const dispute = await disputeService.getDisputeById(id);
      
      res.json({
        success: true,
        data: dispute,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  },

  async resolveDispute(req, res) {
    try {
      const { id } = req.params;
      const { status, resolution } = req.body;
      
      const dispute = await disputeService.resolveDispute(id, resolution, status);
      
      res.json({
        success: true,
        message: "Dispute resolved successfully",
        data: dispute,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async simulatePayout(req, res) {
    try {
      const { id } = req.params;
      const { refundAmount, releaseAmount } = req.body;
      
      const result = await disputeService.simulateDisputePayout(
        id,
        refundAmount || 0,
        releaseAmount || 0
      );
      
      res.json({
        success: true,
        message: "Payout simulated successfully",
        ...result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async redoMilestone(req, res) {
    try {
      const { id } = req.params;
      
      const result = await disputeService.redoMilestone(id);
      
      res.json({
        success: true,
        message: "Milestone returned to IN_PROGRESS",
        ...result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  async getDisputeStats(req, res) {
    try {
      const stats = await disputeService.getDisputeStats();
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

