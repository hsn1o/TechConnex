// src/modules/company/milestones/service.js
import { prisma } from "./model.js"
import { UpsertMilestonesDto } from "./dto.js"

/**
 * Assert that the project is owned by the customer
 */
async function assertProjectOwnedByCompany(projectId, customerId) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      customerId: customerId
    },
    include: {
      milestones: {
        orderBy: { order: "asc" }
      }
    }
  })

  if (!project) {
    throw new Error("Project not found or you don't have permission to access it")
  }

  return project
}

/**
 * Get project milestones for company
 */
export async function getProjectMilestones(projectId, customerId) {
  try {
    const project = await assertProjectOwnedByCompany(projectId, customerId)

    return {
      milestones: project.milestones.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        amount: m.amount,
        dueDate: m.dueDate,
        order: m.order,
        status: m.status
      })),
      milestonesLocked: project.milestonesLocked,
      companyApproved: project.companyApproved,
      providerApproved: project.providerApproved,
      milestonesApprovedAt: project.milestonesApprovedAt
    }
  } catch (error) {
    console.error("Error fetching project milestones:", error)
    throw error
  }
}

/**
 * Update project milestones as company
 */
export async function updateProjectMilestones(projectId, customerId, milestones) {
  try {
    const project = await assertProjectOwnedByCompany(projectId, customerId)

    // Check if milestones are locked
    if (project.milestonesLocked) {
      throw new Error("Project milestones are locked and cannot be edited")
    }

    // Validate milestones
    const dto = new UpsertMilestonesDto({ milestones })
    const validationErrors = dto.validate()
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(", ")}`)
    }

    // Sanitize and normalize
    dto.sanitize()
    dto.normalizeSequences()

    // Update project milestones in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing milestones
      await tx.milestone.deleteMany({
        where: { projectId: projectId }
      })

      // Create new milestones
      if (dto.milestones.length > 0) {
        await tx.milestone.createMany({
          data: dto.milestones.map(m => ({
            projectId: projectId,
            title: m.title,
            description: m.description || "",
            amount: m.amount,
            dueDate: new Date(m.dueDate),
            order: m.sequence || 1,
            status: "DRAFT",
            source: "FINAL"
          }))
        })
      }

      // Reset approval flags when milestones are edited
      const updatedProject = await tx.project.update({
        where: { id: projectId },
      data: {
          companyApproved: false,
          providerApproved: false,
          milestonesApprovedAt: null
        },
        include: {
          milestones: {
            orderBy: { order: "asc" }
          }
        }
      })

      return updatedProject
    })

    return {
      milestones: result.milestones.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        amount: m.amount,
        dueDate: m.dueDate,
        order: m.order,
        status: m.status
      })),
      milestonesLocked: result.milestonesLocked,
      companyApproved: result.companyApproved,
      providerApproved: result.providerApproved,
      milestonesApprovedAt: result.milestonesApprovedAt
    }
  } catch (error) {
    console.error("Error updating project milestones:", error)
    throw error
  }
}

/**
 * Approve milestones as company
 */
export async function approveMilestones(projectId, customerId) {
  try {
    const project = await assertProjectOwnedByCompany(projectId, customerId)

    // Check if milestones are locked
    if (project.milestonesLocked) {
      throw new Error("Project milestones are already locked")
    }

    // Check if there are milestones to approve
    if (project.milestones.length === 0) {
      throw new Error("No milestones to approve")
    }

    // Update company approval
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        companyApproved: true
      },
      include: {
        milestones: {
          orderBy: { order: "asc" }
        }
      }
    })

    // Check if both parties have approved
    if (updatedProject.companyApproved && updatedProject.providerApproved) {
      // Lock milestones and mark them as approved
      const finalProject = await prisma.$transaction(async (tx) => {
        // Update project to lock milestones
        const lockedProject = await tx.project.update({
          where: { id: projectId },
      data: {
            milestonesLocked: true,
            milestonesApprovedAt: new Date()
          }
        })

        // Update all milestones to LOCKED status (ready to start work)
        await tx.milestone.updateMany({
          where: { projectId: projectId },
          data: { status: "LOCKED" }
        })

        return lockedProject
      })

      return {
        approved: true,
        locked: true,
        milestones: updatedProject.milestones.map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          amount: m.amount,
          dueDate: m.dueDate,
          order: m.order,
          status: "LOCKED"
        })),
        milestonesLocked: true,
        companyApproved: true,
        providerApproved: true,
        milestonesApprovedAt: finalProject.milestonesApprovedAt
      }
    }

    return {
      approved: true,
      locked: false,
      milestones: updatedProject.milestones.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        amount: m.amount,
        dueDate: m.dueDate,
        order: m.order,
        status: m.status
      })),
      milestonesLocked: updatedProject.milestonesLocked,
      companyApproved: updatedProject.companyApproved,
      providerApproved: updatedProject.providerApproved,
      milestonesApprovedAt: updatedProject.milestonesApprovedAt
    }
  } catch (error) {
    console.error("Error approving milestones:", error)
    throw error
  }
}
