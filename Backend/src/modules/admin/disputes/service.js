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

  async resolveDispute(disputeId, resolution, status) {
    try {
      const dispute = await disputeModel.getDisputeById(disputeId);
      if (!dispute) {
        throw new Error("Dispute not found");
      }

      const updatedDispute = await disputeModel.updateDisputeStatus(
        disputeId,
        status,
        resolution
      );

      // If closing dispute, freeze project work
      if (status === "CLOSED") {
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();

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
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();

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

  async simulateDisputePayout(disputeId, refundAmount, releaseAmount) {
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

      // Update dispute status to RESOLVED
      const updatedDispute = await disputeModel.updateDisputeStatus(
        disputeId,
        "RESOLVED",
        `Refund: RM${refundAmount || 0}, Release: RM${releaseAmount || 0}`
      );

      // Update milestone and project status if milestone exists
      if (dispute.milestoneId) {
        const { PrismaClient } = await import("@prisma/client");
        const prisma = new PrismaClient();

        // Update milestone status based on resolution
        if (releaseAmount > 0) {
          // Provider wins - milestone can be paid
          await prisma.milestone.update({
            where: { id: dispute.milestoneId },
            data: {
              status: refundAmount > 0 ? "APPROVED" : "PAID",
            },
          });
        } else if (refundAmount > 0) {
          // Company wins - milestone stays disputed or rejected
          await prisma.milestone.update({
            where: { id: dispute.milestoneId },
            data: {
              status: "REJECTED",
            },
          });
        }

        // Update project status back to IN_PROGRESS if it was DISPUTED (unless CLOSED)
        if (dispute.project?.status === "DISPUTED") {
          await prisma.project.update({
            where: { id: dispute.projectId },
            data: {
              status: "IN_PROGRESS",
            },
          });
        }
      }

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

  async redoMilestone(disputeId) {
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

      // Update dispute status to UNDER_REVIEW (allows provider to resubmit)
      const updatedDispute = await disputeModel.updateDisputeStatus(
        disputeId,
        "UNDER_REVIEW",
        "Milestone returned to IN_PROGRESS for resubmission. Provider can now edit and resubmit."
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

