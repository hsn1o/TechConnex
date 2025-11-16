import { disputeModel } from "./model.js";

export const disputeService = {
  async getAllDisputes(filters = {}) {
    try {
      const disputes = await disputeModel.getAllDisputes(filters);
      return disputes;
    } catch (error) {
      throw new Error(`Failed to get disputes: ${error.message}`);
    }
  },

  async getDisputeById(disputeId) {
    try {
      const dispute = await disputeModel.getDisputeById(disputeId);
      if (!dispute) {
        throw new Error("Dispute not found");
      }
      return dispute;
    } catch (error) {
      throw new Error(`Failed to get dispute: ${error.message}`);
    }
  },

  async resolveDispute(disputeId, resolution, status, adminId = null, adminName = null) {
    try {
      const dispute = await disputeModel.getDisputeById(disputeId);
      if (!dispute) {
        throw new Error("Dispute not found");
      }

      const updatedDispute = await disputeModel.updateDisputeStatus(
        disputeId,
        status,
        resolution,
        adminId,
        adminName
      );

      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      // If resolving dispute, set project to DISPUTED and reject all milestones
      if (status === "RESOLVED") {
        // Set project status to DISPUTED
        await prisma.project.update({
          where: { id: dispute.projectId },
          data: {
            status: "DISPUTED",
          },
        });

        // Reject ALL milestones for this project
        await prisma.milestone.updateMany({
          where: { projectId: dispute.projectId },
          data: {
            status: "REJECTED",
          },
        });
      }

      // If closing dispute, freeze project work
      if (status === "CLOSED") {
        // Keep project status as DISPUTED to prevent further work
        await prisma.project.update({
          where: { id: dispute.projectId },
          data: {
            status: "DISPUTED",
          },
        });

        // If milestone exists, keep it as DISPUTED
        if (dispute.milestoneId) {
          await prisma.milestone.update({
            where: { id: dispute.milestoneId },
            data: {
              status: "DISPUTED",
            },
          });
        }
      }

      // If rejecting dispute, update milestone and project status
      if (status === "REJECTED" && dispute.milestoneId) {
        // Return milestone to previous status (or IN_PROGRESS)
        await prisma.milestone.update({
          where: { id: dispute.milestoneId },
          data: {
            status: "IN_PROGRESS",
          },
        });

        // Update project status back to IN_PROGRESS if it was DISPUTED
        if (dispute.project?.status === "DISPUTED") {
          await prisma.project.update({
            where: { id: dispute.projectId },
            data: {
              status: "IN_PROGRESS",
            },
          });
        }
      }

      return updatedDispute;
    } catch (error) {
      throw new Error(`Failed to resolve dispute: ${error.message}`);
    }
  },

  async simulateDisputePayout(disputeId, refundAmount, releaseAmount, resolution = null, adminId = null, adminName = null) {
    try {
      const dispute = await disputeModel.getDisputeById(disputeId);
      if (!dispute) {
        throw new Error("Dispute not found");
      }

      // Simulate payment processing (fake payment)
      const payoutResult = {
        disputeId,
        refundAmount: refundAmount || 0,
        releaseAmount: releaseAmount || 0,
        timestamp: new Date().toISOString(),
        status: "completed",
        transactionId: `SIM_${Date.now()}`,
      };

      // Log the payout (in production, this would trigger real payment processing)
      console.log("Simulated Dispute Payout:", payoutResult);

      // Build auto-generated resolution note based on payout amounts
      const autoResolutionNote = `Refund: RM${refundAmount || 0}, Release: RM${releaseAmount || 0}`;
      
      // Combine auto-generated note and admin's custom note into one resolution note
      let combinedResolutionNote = autoResolutionNote;
      if (resolution && resolution.trim()) {
        combinedResolutionNote = `${autoResolutionNote}\n\n--- Admin Note ---\n${resolution.trim()}`;
      }
      
      // Update dispute status to RESOLVED with combined note
      const updatedDispute = await disputeModel.updateDisputeStatus(
        disputeId,
        "RESOLVED",
        combinedResolutionNote,
        adminId,
        adminName
      );

      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      // When dispute is RESOLVED, set project to DISPUTED and reject ALL milestones
      await prisma.project.update({
        where: { id: dispute.projectId },
        data: {
          status: "DISPUTED",
        },
      });

      // Reject ALL milestones for this project
      await prisma.milestone.updateMany({
        where: { projectId: dispute.projectId },
        data: {
          status: "REJECTED",
        },
      });

      // If dispute is resolved, check if we should close it or keep it open for potential updates
      // For now, we'll keep it RESOLVED and allow admin to close it manually

      return {
        success: true,
        payout: payoutResult,
        dispute: updatedDispute,
      };
    } catch (error) {
      throw new Error(`Failed to simulate payout: ${error.message}`);
    }
  },

  async redoMilestone(disputeId, resolution = null, adminId = null, adminName = null) {
    try {
      const dispute = await disputeModel.getDisputeById(disputeId);
      if (!dispute) {
        throw new Error("Dispute not found");
      }

      // Check for milestoneId directly or through payment
      const milestoneId = dispute.milestoneId || dispute.payment?.milestoneId;
      
      if (!milestoneId) {
        throw new Error("No milestone associated with this dispute");
      }

      // Update milestone status to IN_PROGRESS (mark as "Disputed — Needs Update")
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();

      const updatedMilestone = await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          status: "IN_PROGRESS",
        },
      });

      // Update project status back to IN_PROGRESS if it was DISPUTED
      if (dispute.project?.status === "DISPUTED") {
        await prisma.project.update({
          where: { id: dispute.projectId },
          data: {
            status: "IN_PROGRESS",
          },
        });
      }

      // Build auto-generated resolution note
      const autoResolutionNote = "Milestone returned to IN_PROGRESS for resubmission. Provider can now edit and resubmit.";
      
      // Combine auto-generated note and admin's custom note into one resolution note
      let combinedResolutionNote = autoResolutionNote;
      if (resolution && resolution.trim()) {
        combinedResolutionNote = `${autoResolutionNote}\n\n--- Admin Note ---\n${resolution.trim()}`;
      }
      
      // Update dispute status to UNDER_REVIEW with combined note
      const updatedDispute = await disputeModel.updateDisputeStatus(
        disputeId,
        "UNDER_REVIEW",
        combinedResolutionNote,
        adminId,
        adminName
      );

      return {
        success: true,
        milestone: updatedMilestone,
        dispute: updatedDispute,
      };
    } catch (error) {
      throw new Error(`Failed to redo milestone: ${error.message}`);
    }
  },

  async getDisputeStats() {
    try {
      const stats = await disputeModel.getDisputeStats();
      return stats;
    } catch (error) {
      throw new Error(`Failed to get dispute stats: ${error.message}`);
    }
  },
};

