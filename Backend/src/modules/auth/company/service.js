import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
  findUserByEmail,
  findUserById,
  createCompanyUser,
  findProviderProfile,
  createProviderProfile,
  updateUserRole,
} from "./model.js";

const prisma = new PrismaClient();

async function registerCompany(dto) {
  const existingUser = await findUserByEmail(dto.email);
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  // Pass entire DTO, but overwrite the password
  return createCompanyUser({ ...dto, password: hashedPassword });
}

async function loginCompany(email, password) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new Error("Invalid credentials");

  // Check if user has CUSTOMER role
  const hasCustomerRole = Array.isArray(user.role) 
    ? user.role.includes("CUSTOMER")
    : user.role === "CUSTOMER";

  if (!hasCustomerRole) {
    throw new Error("User is not registered as a customer");
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "24h" }
  );

  // Get customer profile
  const customerProfile = await prisma.customerProfile.findUnique({ 
    where: { userId: user.id } 
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      kycStatus: user.kycStatus,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
    customerProfile,
    token,
  };
}


async function becomeProvider(userId, { bio = "", skills = [] }) {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");

  // check if profile exists
  const existing = await findProviderProfile(userId);
  if (existing) return { alreadyProvider: true, profile: existing };

  // create profile
  const profile = await createProviderProfile(userId, { bio, skills });

  // update roles → ensure it's an array
  let roles = user.role;
  if (!Array.isArray(roles)) roles = [roles];
  if (!roles.includes("PROVIDER")) {
    roles.push("PROVIDER");
    await updateUserRole(userId, roles);
  }

  return { alreadyProvider: false, profile };
}

export {
  registerCompany,
  loginCompany,
  becomeProvider,
};
