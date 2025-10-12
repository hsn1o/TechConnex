import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import {
  findUserById,
  createCompanyUser,
  findProviderProfile,
  createProviderProfile,
  updateUserRole,
  updateCompanyUser,
} from "./model.js";
import { findUserByEmail } from "../model.js";

const prisma = new PrismaClient();

async function registerCompany(dto) {
  const existingUser = await findUserByEmail(dto.email);
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  // 🧾 Pass full DTO + hashed password to the model
  // model handles nested create for CustomerProfile + KycDocuments
  const user = await createCompanyUser({
    ...dto,
    password: hashedPassword,
  });

  // 🧠 Optionally, you could auto-generate a token upon registration
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
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


async function updateCompanyProfile(userId, updateData) {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");

  // Update user + nested customerProfile
  const updatedUser = await updateCompanyUser(userId, updateData);
  return updatedUser;
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


export { registerCompany, becomeProvider, updateCompanyProfile, updatePassword };
