const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// POST /api/projects
router.post("/accept-provider", async (req, res) => {
  const {
    customerId,
    providerId,
    title,
    description,
    category,
    budgetMin,
    budgetMax,
    timeline,
    skills = [],
    priority,
    status = "IN_PROGRESS",
    ndaSigned = false,
    requirements,
    deliverables,
  } = req.body;

  // ✅ Validate required fields
  if (
    !customerId ||
    !providerId ||
    !title ||
    !description ||
    !category ||
    !budgetMin ||
    !budgetMax
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // ✅ Create the Project directly
    const project = await prisma.project.create({
      data: {
        title,
        description,
        category,
        budgetMin: parseFloat(budgetMin),
        budgetMax: parseFloat(budgetMax),
        timeline,
        priority,
        skills,
        customer: { connect: { id: customerId } },
        provider: { connect: { id: providerId } },
        status,
        ndaSigned,
        requirements,
        deliverables
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (err) {
    console.error("❌ Failed to create project:", err);
    return res.status(500).json({ error: "Failed to create project" });
  }
});



// ✅ GET /api/service-requests
router.get("/service-requests", async (req, res) => {
  try {
    const requests = await prisma.serviceRequest.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        proposals: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ serviceRequests: requests });
  } catch (error) {
    console.error("Error fetching service requests:", error);
    res.status(500).json({ error: "Failed to fetch service requests" });
  }
});

// // ✅ GET /api/projects/all
// router.get("/all", async (req, res) => {
//   try {
//     const projects = await prisma.project.findMany({
//       include: {
//         serviceRequest: true,
//         customer: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//         provider: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//           },
//         },
//         review: true,
//         milestones: true,
//         payments: true,
//         invoices: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     res.json({ projects });
//   } catch (error) {
//     console.error("Error fetching all projects:", error);
//     res.status(500).json({ error: "Failed to fetch all projects" });
//   }
// });

router.get("/customers/:userId/stats", async (req, res) => {
  const { userId } = req.params;

  try {
    const [
      activeProjects,
      completedProjects,
      totalSpentResult,
      customerProfile,
    ] = await Promise.all([
      // Count in-progress projects
      prisma.project.count({
        where: {
          customerId: userId,
          status: "IN_PROGRESS",
        },
      }),
      // Count completed projects
      prisma.project.count({
        where: {
          customerId: userId,
          status: "COMPLETED",
        },
      }),

      // Sum paid invoices
      prisma.invoice.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          customerId: userId,
          status: {
            not: "draft", // or 'paid' if you use that
          },
        },
      }),
    ]);

    return res.json({
      activeProjects,
      completedProjects,
      totalSpent: totalSpentResult._sum.totalAmount || 0,
      rating: null, // Not tracked for customer
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch customer stats" });
  }
});

// src/routes/projectRoutes.js (or statsRoutes.js)

router.get("/providers/:userId/stats", async (req, res) => {
  const { userId } = req.params;

  try {
    const [activeProjects, totalEarnedResult, providerProfile] =
      await Promise.all([
        // Count in-progress projects for provider
        prisma.project.count({
          where: {
            providerId: userId,
            status: "IN_PROGRESS",
          },
        }),

        // Count completed projects
        // prisma.project.count({
        //   where: {
        //     providerId: userId,
        //     status: "COMPLETED",
        //   },
        // }),

        // Sum released payments to provider
        prisma.payment.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            project: {
              providerId: userId,
            },
            status: "RELEASED",
          },
        }),

        // Provider profile for rating & views
        prisma.providerProfile.findUnique({
          where: { userId },
          select: {
            rating: true,
            viewsCount: true,
          },
        }),
      ]);

    return res.json({
      activeProjects,
      totalEarnings: totalEarnedResult._sum.amount || 0,
      rating: providerProfile?.rating || 0,
      profileViews: providerProfile?.viewsCount || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch provider stats" });
  }
});

// ✅ GET /api/projects/:userId
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const projects = await prisma.project.findMany({
      where: {
        customerId: userId,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        provider: {
          select: { id: true, name: true, email: true },
        },
        ServiceRequest: true, // Note: this is plural now
        review: true,
        milestones: true,
        payments: true,
        messages: true,
        invoices: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ projects });
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});


// ✅ GET /api/projects/in-progress/:userId
router.get("/in-progress/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const projects = await prisma.project.findMany({
      where: {
        customerId: userId,
        status: "IN_PROGRESS",
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        provider: {
          select: { id: true, name: true, email: true },
        },
        ServiceRequest: true,
        review: true,
        milestones: true,
        payments: true,
        messages: true,
        invoices: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ projects });
  } catch (error) {
    console.error("❌ Error fetching in-progress projects:", error);
    res.status(500).json({ error: "Failed to fetch in-progress projects" });
  }
});

// ✅ GET /api/projects/view/:projectId
router.get("/view/:projectId", async (req, res) => {
  const { projectId } = req.params;

  // Basic UUID validation (optional but recommended)
  const isValidUUID = /^[0-9a-fA-F-]{36}$/.test(projectId);
  if (!isValidUUID) {
    return res.status(400).json({ error: "Invalid project ID format" });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        provider: {
          select: { id: true, name: true, email: true },
        },
        ServiceRequest: true,
        review: true,
        milestones: true,
        payments: true,
        messages: true,
        invoices: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ project });
  } catch (error) {
    console.error("❌ Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});


module.exports = router;
