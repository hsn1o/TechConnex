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
async function updatePassword(userId, oldPassword, newPassword) {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");

  // Verify old password
  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) throw new Error("Old password is incorrect");

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  const updatedUser = await updateCompanyUser(userId, { password: hashedPassword });
  return updatedUser;
}


export {
  registerProvider,
  becomeCustomer,
  updatePassword
};
