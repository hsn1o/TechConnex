const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


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
