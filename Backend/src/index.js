const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

const userRoutes = require("./routes/userRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const projectRoutes = require("./routes/projectRoutes");
const providerRoutes = require("./routes/providerRoutes");
const serviceRequestRoutes = require("./routes/ServiceRequestRoutes");
const kycRoutes = require("./routes/kycRoutes");
const adminKycRoutes = require("./routes/adminKycRoutes");




app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// Use the user routes
app.use("/api", userRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", providerRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/admin/kyc", adminKycRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
