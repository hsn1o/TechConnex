import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
  findUserByEmail,
  findUserById,
  createProviderUser,
  findProviderProfile,
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
  becomeCustomer,
};
