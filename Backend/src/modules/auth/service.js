// src/modules/company/auth/service.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "./model.js";

async function loginProvider({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token, user };
}

async function checkEmailAvailability(email) {
  const normalizedEmail = (email || "").toString().trim().toLowerCase();
  if (!normalizedEmail) throw new Error("Email is required");

  const user = await findUserByEmail(normalizedEmail);
  return { available: !user };
}
export { loginProvider, checkEmailAvailability };
