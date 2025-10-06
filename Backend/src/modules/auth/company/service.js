// src/modules/company/auth/service.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  findUserByEmail,
  findUserById,
  createCompanyUser,
  findProviderProfile,
  createProviderProfile,
  updateUserRole,
} = require("./model");

async function registerCompany(dto) {
  const existingUser = await findUserByEmail(dto.email);
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  // Pass entire DTO, but overwrite the password
  return createCompanyUser({ ...dto, password: hashedPassword });
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

module.exports = {
  registerCompany,
  becomeProvider,
};
