import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
  findUserByEmail,
  findUserById,
  createProviderUser,
  findProviderProfile,
  createProviderProfile,
  updateUserRole,
} from "./model.js";

const prisma = new PrismaClient();

async function registerProvider(dto) {
  const existingUser = await findUserByEmail(dto.email);
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  // Pass entire DTO, but overwrite the password
  return createProviderUser({ ...dto, password: hashedPassword });
}

async function loginProvider(email, password) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new Error("Invalid credentials");

  // Check if user has PROVIDER role
  const hasProviderRole = Array.isArray(user.role) 
    ? user.role.includes("PROVIDER")
    : user.role === "PROVIDER";

  if (!hasProviderRole) {
    throw new Error("User is not registered as a provider");
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

  // Get provider profile
  const providerProfile = await findProviderProfile(user.id);

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
    providerProfile,
    token,
  };
}

async function becomeCustomer(userId, { description = "", industry = "" }) {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");

  // Check if customer profile exists
  const existing = await prisma.customerProfile.findUnique({ where: { userId } });
  if (existing) return { alreadyCustomer: true, profile: existing };

  // Create customer profile
  const profile = await prisma.customerProfile.create({
    data: {
      userId,
      description,
      industry,
    },
  });

  // Update roles → ensure it's an array
  let roles = user.role;
  if (!Array.isArray(roles)) roles = [roles];
  if (!roles.includes("CUSTOMER")) {
    roles.push("CUSTOMER");
    await updateUserRole(userId, roles);
  }

  return { alreadyCustomer: false, profile };
}

export {
  registerProvider,
  loginProvider,
  becomeCustomer,
};
