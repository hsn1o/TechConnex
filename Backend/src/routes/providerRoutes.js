const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// --- PROVIDER LIST ENDPOINT ---
// GET /api/providers?search=&category=&location=&rating=&sort=&page=&pageSize=&userId=
router.get("/providers", async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      location = "",
      rating = "",
      sort = "rating",
      page = 1,
      pageSize = 12,
      userId = "",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    // Build Prisma filters
    let where = {
      providerProfile: {
        isVerified: true,
      },
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { providerProfile: { skills: { has: search } } },
      ];
    }
    if (category && category !== "all") {
      where.providerProfile = {
        ...where.providerProfile,
        skills: { has: category }, // UI category must match a skill
      };
    }
    if (location && location !== "all") {
      where.providerProfile = {
        ...where.providerProfile,
        location: { contains: location, mode: "insensitive" },
      };
    }
    if (rating && rating !== "all") {
      const minRating = rating === "4.5+" ? 4.5 : rating === "4.0+" ? 4.0 : 0;
      where.providerProfile = {
        ...where.providerProfile,
        rating: { gte: minRating },
      };
    }

    // Sorting
    let orderBy = {};
    if (sort === "rating") orderBy = { providerProfile: { rating: "desc" } };
    else if (sort === "price-low") orderBy = { providerProfile: { hourlyRate: "asc" } };
    else if (sort === "price-high") orderBy = { providerProfile: { hourlyRate: "desc" } };
    else if (sort === "experience") orderBy = { providerProfile: { yearsExperience: "desc" } };

    // Query providers
    const [providers, total, savedForUser] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          providerProfile: true,
        },
        orderBy,
        skip,
        take,
      }),
      prisma.user.count({ where }),
      userId
        ? prisma.savedProvider.findMany({
            where: { userId },
            select: { providerId: true },
          })
        : Promise.resolve([]),
    ]);

    const savedSet = new Set(savedForUser.map((s) => s.providerId));

    // Map DB fields to UI
    const mapped = providers.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      avatar: p.providerProfile?.avatarUrl || "/placeholder.svg", // UI expects avatar
      location: p.providerProfile?.location || "",
      bio: p.providerProfile?.bio || "",
      hourlyRate: p.providerProfile?.hourlyRate || 0,
      availability: p.providerProfile?.availability || "Unknown",
      rating: parseFloat(p.providerProfile?.rating) || 0,
      reviewCount: p.providerProfile?.totalReviews || 0,
      completedJobs: p.providerProfile?.totalProjects || 0,
      responseTime: `${p.providerProfile?.responseTime || 0} hours`,
      skills: p.providerProfile?.skills || [],
      specialties: [], // Extend if you add specialties
      verified: p.providerProfile?.isVerified || false,
      topRated: p.providerProfile?.isFeatured || false,
      saved: userId ? savedSet.has(p.id) : false,
    }));

    res.json({
      providers: mapped,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (err) {
    console.error("Provider list error:", err);
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

// --- PROVIDER PROFILE ENDPOINT ---
// GET /api/providers/:id?userId=
router.get("/providers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        providerProfile: {
          include: {
            certifications: true,
            portfolios: true,
            performance: true,
          },
        },
        reviewsReceived: {
          include: {
            reviewer: true,
          },
        },
        projectsAsProvider: true,
      },
    });
    if (!user || !user.providerProfile) {
      return res.status(404).json({ error: "Provider not found" });
    }

    let saved = false;
    if (userId) {
      const existing = await prisma.savedProvider.findUnique({
        where: { userId_providerId: { userId: String(userId), providerId: id } },
        select: { id: true },
      });
      saved = Boolean(existing);
    }

    const p = user.providerProfile;
    // Map DB fields to UI
    const mapped = {
      id: user.id,
      name: user.name,
      avatar: p.avatarUrl || "/placeholder.svg",
      bio: p.bio || "",
      title: p.title || "",
      company: p.company || "",
      rating: parseFloat(p.rating) || 0,
      reviewCount: p.totalReviews || 0,
      completedJobs: p.totalProjects || 0,
      hourlyRate: p.hourlyRate || 0,
      location: p.location || "",
      availability: p.availability || "Unknown",
      responseTime: `${p.responseTime || 0} hours`,
      skills: p.skills || [],
      specialties: [], // Extend if you add specialties
      languages: p.languages || [],
      verified: p.isVerified || false,
      topRated: p.isFeatured || false,
      successRate: parseFloat(p.successRate) || 0,
      onTimeDelivery: p.performance?.onTimeDelivery || 0,
      repeatClients: p.performance?.repeatClients || 0,
      lastActive: user.updatedAt,
      portfolio: p.portfolios.map((proj) => ({
        id: proj.id,
        title: proj.title,
        description: proj.description,
        technologies: proj.techStack,
        image: proj.imageUrl,
        completedAt: proj.date,
        category: "", // Extend if you add category
      })),
      reviews: user.reviewsReceived.map((r) => ({
        id: r.id,
        client: r.reviewer.name,
        avatar: r.reviewer.providerProfile?.avatarUrl || "/placeholder.svg",
        rating: r.rating,
        content: r.content,
        createdAt: r.createdAt,
      })),
      servicePackages: [], // Extend if you add packages
      education: [], // Extend if you add education
      certifications: p.certifications.map((cert) => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        issuedDate: cert.issuedDate,
        verified: cert.verified,
      })),
      saved,
    };
    res.json(mapped);
  } catch (err) {
    console.error("Provider profile error:", err);
    res.status(500).json({ error: "Failed to fetch provider profile" });
  }
});

// --- SAVED PROVIDERS ---
// POST /api/providers/:id/save  { userId }
router.post("/providers/:id/save", async (req, res) => {
  try {
    const { id } = req.params; // providerId
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const saved = await prisma.savedProvider.upsert({
      where: { userId_providerId: { userId, providerId: id } },
      update: {},
      create: { userId, providerId: id },
    });

    res.json({ success: true, saved: true, id: saved.id });
  } catch (err) {
    console.error("Save provider error:", err);
    res.status(500).json({ error: "Failed to save provider" });
  }
});

// DELETE /api/providers/:id/save?userId=
router.delete("/providers/:id/save", async (req, res) => {
  try {
    const { id } = req.params; // providerId
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    await prisma.savedProvider.delete({
      where: { userId_providerId: { userId: String(userId), providerId: id } },
    });

    res.json({ success: true, saved: false });
  } catch (err) {
    // If it doesn't exist, return idempotent success
    if (err.code === "P2025") {
      return res.json({ success: true, saved: false });
    }
    console.error("Unsave provider error:", err);
    res.status(500).json({ error: "Failed to unsave provider" });
  }
});

// GET /api/users/:userId/saved-providers
router.get("/users/:userId/saved-providers", async (req, res) => {
  try {
    const { userId } = req.params;

    const saved = await prisma.savedProvider.findMany({
      where: { userId },
      include: {
        provider: {
          include: { providerProfile: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const providers = saved.map((s) => {
      const p = s.provider;
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        avatar: p.providerProfile?.avatarUrl || "/placeholder.svg",
        location: p.providerProfile?.location || "",
        bio: p.providerProfile?.bio || "",
        hourlyRate: p.providerProfile?.hourlyRate || 0,
        availability: p.providerProfile?.availability || "Unknown",
        rating: parseFloat(p.providerProfile?.rating) || 0,
        reviewCount: p.providerProfile?.totalReviews || 0,
        completedJobs: p.providerProfile?.totalProjects || 0,
        responseTime: `${p.providerProfile?.responseTime || 0} hours`,
        skills: p.providerProfile?.skills || [],
        specialties: [],
        verified: p.providerProfile?.isVerified || false,
        topRated: p.providerProfile?.isFeatured || false,
        saved: true,
        savedAt: s.createdAt,
      };
    });

    res.json({ providers });
  } catch (err) {
    console.error("Saved providers list error:", err);
    res.status(500).json({ error: "Failed to fetch saved providers" });
  }
});

// src/routes/performanceRoutes.js or extend your provider routes

router.get("/providers/:userId/performance", async (req, res) => {
    const { userId } = req.params;
  
    try {
      const provider = await prisma.providerProfile.findUnique({
        where: { userId },
        include: {
          performance: true,
        },
      });
  
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
  
      const perf = provider.performance;
  
      return res.json({
        totalProjects: perf?.totalProjects || 0,
        completionRate: perf?.completionRate || 0,
        onTimeDelivery: perf?.onTimeDelivery || 0,
        repeatClients: perf?.repeatClients || 0,
        responseRate: provider.responseTime || "0%", // if stored as string
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch performance metrics" });
    }
  });
  
  module.exports = router;
