import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function uploadCertifications(req, res) {
  try {
    const { userId, certifications } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    if (!certifications || !Array.isArray(certifications)) {
      return res.status(400).json({ success: false, message: "Certifications array is required" });
    }

    // Check if user exists and has provider profile
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { providerProfile: true }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.providerProfile) {
      return res.status(400).json({ success: false, message: "User must have a provider profile" });
    }

    // Delete existing certifications for this user
    await prisma.certification.deleteMany({
      where: { profileId: user.providerProfile.id }
    });

    // Create new certifications
    const createdCertifications = [];
    for (const cert of certifications) {
      if (cert.name && cert.issuer && cert.issuedDate) {
        const newCert = await prisma.certification.create({
          data: {
            profileId: user.providerProfile.id,
            name: cert.name,
            issuer: cert.issuer,
            issuedDate: new Date(cert.issuedDate),
            serialNumber: cert.serialNumber || null,
            sourceUrl: cert.sourceUrl || null,
            verified: false, // Default to false, admin can verify later
          },
        });
        createdCertifications.push(newCert);
      }
    }

    return res.status(201).json({ 
      success: true, 
      message: "Certifications uploaded successfully",
      certifications: createdCertifications 
    });
  } catch (error) {
    console.error("Certifications upload error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getCertifications(req, res) {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { 
        providerProfile: {
          include: {
            certifications: true
          }
        }
      }
    });
    
    if (!user || !user.providerProfile) {
      return res.status(404).json({ success: false, message: "User or provider profile not found" });
    }

    return res.status(200).json({ 
      success: true, 
      certifications: user.providerProfile.certifications 
    });
  } catch (error) {
    console.error("Get certifications error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export { uploadCertifications, getCertifications };
