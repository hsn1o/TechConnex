// seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create a test customer user
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const customerUser = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      password: hashedPassword,
      name: "Test Customer",
      phone: "123456789",
      role: ["CUSTOMER"],
      kycStatus: "active",
      isVerified: true,
    },
  });

  // Create customer profile
  await prisma.customerProfile.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      description: "A test customer company",
      industry: "Technology",
      location: "Kuala Lumpur",
      companySize: "50-100",
      employeeCount: 75,
      establishedYear: 2020,
      completion: 85,
    },
  });

  console.log("✅ Created customer user:", customerUser.email);
  console.log("✅ Customer user ID:", customerUser.id);

  // Create another test customer
  const customerUser2 = await prisma.user.upsert({
    where: { email: "customer2@example.com" },
    update: {},
    create: {
      email: "customer2@example.com",
      password: hashedPassword,
      name: "Another Customer",
      phone: "987654321",
      role: ["CUSTOMER"],
      kycStatus: "active",
      isVerified: true,
    },
  });

  await prisma.customerProfile.upsert({
    where: { userId: customerUser2.id },
    update: {},
    create: {
      userId: customerUser2.id,
      description: "Another test customer company",
      industry: "Finance",
      location: "Selangor",
      companySize: "10-50",
      employeeCount: 25,
      establishedYear: 2018,
      completion: 70,
    },
  });

  console.log("✅ Created second customer user:", customerUser2.email);
  console.log("✅ Second customer user ID:", customerUser2.id);

  // Create test provider users
  const providerUsers = [
    {
      email: "provider1@example.com",
      name: "Ahmad Rahman",
      phone: "0123456789",
      bio: "Full-stack developer with 5+ years of experience in web development",
      location: "Kuala Lumpur",
      hourlyRate: 80,
      skills: ["React", "Node.js", "MongoDB", "JavaScript", "TypeScript"],
      rating: 4.8,
      totalReviews: 25,
      totalProjects: 15,
      isVerified: true,
      isFeatured: true,
    },
    {
      email: "provider2@example.com", 
      name: "Sarah Lim",
      phone: "0198765432",
      bio: "UI/UX Designer specializing in mobile app design and user experience",
      location: "Selangor",
      hourlyRate: 60,
      skills: ["Figma", "Adobe XD", "UI Design", "UX Research", "Prototyping"],
      rating: 4.6,
      totalReviews: 18,
      totalProjects: 12,
      isVerified: true,
      isFeatured: false,
    },
    {
      email: "provider3@example.com",
      name: "Raj Kumar",
      phone: "0134567890",
      bio: "DevOps engineer with expertise in cloud infrastructure and CI/CD",
      location: "Penang",
      hourlyRate: 100,
      skills: ["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform"],
      rating: 4.9,
      totalReviews: 32,
      totalProjects: 20,
      isVerified: true,
      isFeatured: true,
    },
    {
      email: "provider4@example.com",
      name: "Lisa Chen",
      phone: "0145678901",
      bio: "Data scientist and machine learning engineer with PhD in Computer Science",
      location: "Johor",
      hourlyRate: 120,
      skills: ["Python", "TensorFlow", "PyTorch", "Data Analysis", "Machine Learning"],
      rating: 4.7,
      totalReviews: 14,
      totalProjects: 8,
      isVerified: true,
      isFeatured: false,
    },
    {
      email: "provider5@example.com",
      name: "Hassan Ali",
      phone: "0156789012",
      bio: "Mobile app developer specializing in React Native and Flutter",
      location: "Kuala Lumpur",
      hourlyRate: 70,
      skills: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
      rating: 4.5,
      totalReviews: 22,
      totalProjects: 16,
      isVerified: false,
      isFeatured: false,
    }
  ];

  for (const providerData of providerUsers) {
    const providerUser = await prisma.user.upsert({
      where: { email: providerData.email },
      update: {},
      create: {
        email: providerData.email,
        password: hashedPassword,
        name: providerData.name,
        phone: providerData.phone,
        role: ["PROVIDER"],
        kycStatus: "active",
        isVerified: true,
      },
    });

    await prisma.providerProfile.upsert({
      where: { userId: providerUser.id },
      update: {},
      create: {
        userId: providerUser.id,
        bio: providerData.bio,
        location: providerData.location,
        hourlyRate: providerData.hourlyRate,
        skills: providerData.skills,
        rating: providerData.rating,
        totalReviews: providerData.totalReviews,
        totalProjects: providerData.totalProjects,
        isVerified: providerData.isVerified,
        isFeatured: providerData.isFeatured,
        availability: "Available",
        responseTime: 2,
        languages: ["English", "Malay"],
        yearsExperience: 5,
        workPreference: "remote",
        teamSize: 1,
        completion: 90,
      },
    });

    console.log(`✅ Created provider user: ${providerUser.email} (ID: ${providerUser.id})`);
  }

  console.log("🎉 Database seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
