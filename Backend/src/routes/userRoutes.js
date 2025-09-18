// src/routes/userRoutes.js

const express = require("express"); // ✅ REQUIRED
const router = express.Router(); // ✅ YOU FORGOT THIS LINE

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { summarizeResumeWithLangChain } = require("../utils/ai");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: "uploads/resumes/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ HEALTH CHECK ROUTE
router.get("/health", (req, res) => {
  res.json({
    message: "Backend is running!",
    timestamp: new Date().toISOString(),
  });
});
router.get("/check-email", async (req, res) => {
  try {
    const email = (req.query.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ error: "Email is required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    return res.json({ available: !existing });
  } catch (err) {
    console.error("check-email error:", err);
    return res.status(500).json({ error: "Server error checking email" });
  }
});;
// ✅ REGISTER ROUTE
// ✅ Express.js - Updated /register route for CUSTOMER role
router.post("/register", upload.single("resume"), async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    location,

    // Provider Only
    bio,
    skills,
    hourlyRate,
    yearsExperience,
    portfolioUrls,
    website,
    languages,
    profileVideoUrl,
    certifications,

    // Customer Only
    companyName,
    companySize,
    industry,
    logoUrl,
    establishedYear,
    employeeCount,
  } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Check if user already exists
    // ✅ put this immediately after the "Missing required fields" return
const strongPwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|;:'",.<>/?`~]).{8,}$/;
if (!strongPwdRe.test(password || "")) {
  return res.status(400).json({
    error:
      "Password is too weak. Use at least 8 characters with uppercase, lowercase, number, and symbol.",
  });
}
const emailNorm = (email || "").toLowerCase().trim();
const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
if (existing) return res.status(400).json({ error: "Email already exists." });

    // ✅ PRE-VALIDATE CERTIFICATIONS before user creation
    if (role === "PROVIDER" && certifications) {
      const certs = JSON.parse(certifications);
      const invalidCerts = [];

// inside the PRE-VALIDATE CERTIFICATIONS block (same loop):
for (const cert of certs) {
  const parsedDate = new Date(cert.issuedDate);
  if (!cert.issuedDate || isNaN(parsedDate)) {
    invalidCerts.push(cert.name || "Unnamed Certification");
  }

  const hasSerial = cert.serialNumber && String(cert.serialNumber).trim().length > 0;
  const hasUrl = cert.sourceUrl && String(cert.sourceUrl).trim().length > 0;
  if (!hasSerial && !hasUrl) {
    invalidCerts.push(`[${cert.name || "Unnamed"}] missing serialNumber or sourceUrl`);
  }
  if (hasUrl && !/^https?:\/\/\S+$/i.test(cert.sourceUrl)) {
    invalidCerts.push(`[${cert.name || "Unnamed"}] invalid sourceUrl`);
  }
}


      if (invalidCerts.length > 0) {
        return res.status(400).json({
          error: `The following certifications have invalid issue dates and must be corrected before submission: ${invalidCerts.join(", ")}`,
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
const newUser = await prisma.user.create({
  data: {
    name,
    email: emailNorm,   // ⟵ store normalized
    phone,
    password: hashedPassword,
    role,
  },
});

    // ✅ PROVIDER PROFILE CREATION
    if (role === "PROVIDER") {
      const providerProfile = await prisma.providerProfile.create({
        data: {
          userId: newUser.id,
          bio,
          location,
          skills: JSON.parse(skills),
          hourlyRate: parseFloat(hourlyRate),
          yearsExperience: parseInt(yearsExperience),
          portfolioUrls: JSON.parse(portfolioUrls),
          website,
          profileVideoUrl,
          languages: JSON.parse(languages),
          completion: 70,
        },
      });

      if (certifications) {
        const certs = JSON.parse(certifications);
        for (const cert of certs) {
          await prisma.certification.create({
              data: {
              profileId: providerProfile.id,
              name: cert.name,
              issuer: cert.issuer,
              issuedDate: new Date(cert.issuedDate),
              verified: cert.verified || false,
              // NEW
              serialNumber: cert.serialNumber || null,
              sourceUrl: cert.sourceUrl || null,
              },
          });
        }
      }

      return res.status(201).json({
        message: "Provider created",
        userId: newUser.id,
      });
    }

    // ✅ CUSTOMER PROFILE CREATION
    if (role === "CUSTOMER") {
      await prisma.customerProfile.create({
        data: {
          userId: newUser.id,
          location,
          bio: `Registered under ${companyName}`,
          companySize,
          website,
          description: industry,
          logoUrl: logoUrl || null,
          establishedYear: establishedYear ? parseInt(establishedYear) : null,
          employeeCount: employeeCount ? parseInt(employeeCount) : null,
          languages: ["English"], // Optional
          completion: 70,
        },
      });

      return res.status(201).json({
        message: "Customer created",
        userId: newUser.id,
      });
    }

    return res.status(400).json({ error: "Invalid role specified" });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Something went wrong during registration." });
  }
});

// ✅ LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials." });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials." });
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ GET ALL USERS (LIMITED FIELDS)
router.get("/providers", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        providerProfile: {
          select: {
            location: true,
            bio: true,
            hourlyRate: true,
            availability: true,
            rating: true,
            totalReviews: true,
            totalProjects: true,
            responseTime: true,
            skills: true,
          },
        },
      },
      where: {
        role: "PROVIDER", // Optional: filter only providers
      },
    });

    return res.json(users);
  } catch (err) {
    console.error("Fetch all users (limited) error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ GET USER BY ID ROUTE
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        kycStatus: true,
        isVerified: true,
        createdAt: true,
        resume: true,
        customerProfile: true,
        providerProfile: {
          select: {
            id: true,
            location: true,
            bio: true,
            hourlyRate: true,
            availability: true,
            portfolioUrls: true,
            profileVideoUrl: true,
            languages: true,
            rating: true,
            totalReviews: true,
            totalProjects: true,
            totalEarnings: true,
            viewsCount: true,
            successRate: true,
            responseTime: true,
            isFeatured: true,
            isVerified: true,
            skills: true,
            yearsExperience: true,
            website: true,
            completion: true,
            minimumProjectBudget: true,
            maximumProjectBudget: true,
            preferredProjectDuration: true,
            workPreference: true,
            teamSize: true,
            companySize: true,
            createdAt: true,
            updatedAt: true,
            certifications: {
              select: {
                id: true,
                name: true,
                issuer: true,
                issuedDate: true,
                verified: true,
                // NEW
                serialNumber: true,
                sourceUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("Fetch user by ID error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
